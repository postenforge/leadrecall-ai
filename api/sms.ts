import type { VercelRequest, VercelResponse } from "@vercel/node";
import twilio from "twilio";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

/**
 * Twilio SMS Webhook
 * 
 * Called when someone replies to our AI text-back.
 * We continue the conversation using AI to qualify the lead
 * and offer to book an appointment.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const callerPhone = req.body.From; // The person replying
  const businessPhone = req.body.To; // Our Twilio number
  const incomingMessage = req.body.Body; // Their message text

  console.log(`[SMS] Incoming from ${callerPhone}: "${incomingMessage}"`);

  // Get or create conversation
  let conversation = await getActiveConversation(callerPhone, businessPhone);
  
  let messages: Array<{ role: string; content: string; timestamp: string }> = [];

  if (conversation) {
    messages = typeof conversation.messages === "string" 
      ? JSON.parse(conversation.messages) 
      : conversation.messages || [];
  }

  // Add the incoming message to history
  messages.push({
    role: "user",
    content: incomingMessage,
    timestamp: new Date().toISOString(),
  });

  // Generate AI response based on conversation history
  const aiReply = await generateConversationReply(messages);

  // Add AI response to history
  messages.push({
    role: "assistant",
    content: aiReply,
    timestamp: new Date().toISOString(),
  });

  // Update or create conversation in database
  if (conversation) {
    await updateConversation(conversation.id, messages);
  } else {
    await createConversation(callerPhone, businessPhone, messages);
  }

  // Send the AI reply via Twilio
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: aiReply,
    from: TWILIO_PHONE_NUMBER,
    to: callerPhone,
  });

  console.log(`[SMS] Replied to ${callerPhone}: "${aiReply}"`);

  // Notify the business owner about the lead conversation
  await notifyOwnerOfLead(callerPhone, incomingMessage, aiReply, messages);

  // Respond with empty TwiML (we already sent the message via API)
  const twiml = new twilio.twiml.MessagingResponse();
  res.setHeader("Content-Type", "text/xml");
  return res.status(200).send(twiml.toString());
}

async function generateConversationReply(
  messages: Array<{ role: string; content: string; timestamp?: string }>
) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a friendly, professional assistant for a local home service business (plumber, electrician, HVAC, etc). You're having a text conversation with a potential customer who tried to call but couldn't get through.

Your goals:
1. Understand what service they need
2. Get their name if they haven't given it
3. Offer to schedule a time for the business owner to call them back or come out
4. Be helpful, warm, and concise (under 160 characters per message when possible)
5. If they want to book, ask what day/time works best
6. Don't use excessive emojis
7. Don't mention you're an AI - you're "the office" or "we"
8. If they seem ready to book, confirm the details and let them know someone will follow up

Keep responses SHORT - this is texting, not email.`,
        },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      max_tokens: 150,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("[OPENAI] Error:", err);
    return "Got it! Let me have someone get back to you shortly.";
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || "Got it! Let me have someone get back to you shortly.";
}

async function getActiveConversation(callerPhone: string, businessPhone: string) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/conversations?caller_phone=eq.${encodeURIComponent(callerPhone)}&business_phone=eq.${encodeURIComponent(businessPhone)}&status=eq.active&order=created_at.desc&limit=1`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  if (!response.ok) return null;
  const data = await response.json();
  return data.length > 0 ? data[0] : null;
}

async function createConversation(
  callerPhone: string,
  businessPhone: string,
  messages: Array<{ role: string; content: string; timestamp: string }>
) {
  await fetch(`${SUPABASE_URL}/rest/v1/conversations`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      caller_phone: callerPhone,
      business_phone: businessPhone,
      messages: JSON.stringify(messages),
      status: "active",
    }),
  });
}

async function updateConversation(
  id: number,
  messages: Array<{ role: string; content: string; timestamp: string }>
) {
  await fetch(`${SUPABASE_URL}/rest/v1/conversations?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: JSON.stringify(messages),
      updated_at: new Date().toISOString(),
    }),
  });
}

async function notifyOwnerOfLead(
  callerPhone: string,
  customerMessage: string,
  aiReply: string,
  fullHistory: Array<{ role: string; content: string; timestamp?: string }>
) {
  // For now, log it. In production, this would send an email/SMS to the business owner.
  const OWNER_PHONE = process.env.OWNER_NOTIFICATION_PHONE;
  
  if (OWNER_PHONE) {
    try {
      const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      const summary = `New lead activity!\nFrom: ${callerPhone}\nThey said: "${customerMessage}"\nAI replied: "${aiReply}"\nTotal messages: ${fullHistory.length}`;
      
      await client.messages.create({
        body: summary.substring(0, 1600), // SMS limit
        from: TWILIO_PHONE_NUMBER,
        to: OWNER_PHONE,
      });
    } catch (err) {
      console.warn("[NOTIFY] Failed to notify owner:", err);
    }
  } else {
    console.log(`[NOTIFY] Lead activity from ${callerPhone}: "${customerMessage}" (no OWNER_NOTIFICATION_PHONE set)`);
  }
}
