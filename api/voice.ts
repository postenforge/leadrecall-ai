import type { VercelRequest, VercelResponse } from "@vercel/node";
import twilio from "twilio";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

/**
 * Twilio Voice Webhook
 * 
 * This is called when someone calls the Twilio number.
 * We let it ring briefly, then if unanswered (or we choose not to answer),
 * we trigger the AI text-back.
 * 
 * For the MVP: We DON'T answer the call (let it go to voicemail or just ring out).
 * Instead, we immediately send an AI-powered text to the caller.
 * 
 * Flow: Call comes in → Twilio hits this webhook → We respond with TwiML 
 * that rejects/doesn't answer → Twilio hits the "status callback" when call ends
 * → We send the AI text from the status callback.
 * 
 * Actually, simpler approach: When the call comes in, we respond with a brief
 * ring then hangup, AND simultaneously fire off the text-back SMS.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Twilio sends webhooks as POST with form-encoded data
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const callerPhone = req.body.From; // The person who called (missed caller)
  const calledPhone = req.body.To;   // Our Twilio number
  const callStatus = req.body.CallStatus;

  console.log(`[VOICE] Incoming call from ${callerPhone} to ${calledPhone}, status: ${callStatus}`);

  // Send AI text-back to the caller (non-blocking)
  sendTextBack(callerPhone, calledPhone).catch((err) => {
    console.error("[VOICE] Failed to send text-back:", err);
  });

  // Respond with TwiML - ring briefly then end the call
  // This simulates a "missed call" experience
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say(
    { voice: "alice" },
    "Sorry, we can't take your call right now. We'll text you right back!"
  );
  twiml.hangup();

  res.setHeader("Content-Type", "text/xml");
  return res.status(200).send(twiml.toString());
}

async function sendTextBack(callerPhone: string, businessPhone: string) {
  if (!callerPhone || !businessPhone) {
    console.warn("[TEXT-BACK] Missing phone numbers, skipping");
    return;
  }

  // Check if we already have an active conversation with this caller
  const existingConvo = await getActiveConversation(callerPhone, businessPhone);
  
  if (existingConvo) {
    console.log(`[TEXT-BACK] Active conversation exists for ${callerPhone}, skipping duplicate text`);
    return;
  }

  // Generate AI response
  const aiMessage = await generateAIResponse(callerPhone, []);

  // Send SMS via Twilio
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: aiMessage,
    from: TWILIO_PHONE_NUMBER,
    to: callerPhone,
  });

  console.log(`[TEXT-BACK] Sent to ${callerPhone}: "${aiMessage}"`);

  // Save conversation to database
  await saveConversation(callerPhone, businessPhone, [
    { role: "assistant", content: aiMessage, timestamp: new Date().toISOString() },
  ]);
}

async function generateAIResponse(callerPhone: string, previousMessages: Array<{ role: string; content: string }>) {
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
          content: `You are a friendly, professional assistant for a local home service business. Someone just tried to call and couldn't get through. Your job is to:
1. Apologize briefly for missing their call
2. Ask how you can help them today
3. Keep it under 160 characters (1 SMS)
4. Be warm and conversational, not robotic
5. Don't use emojis excessively (1 max)
6. Don't mention you're an AI

Example: "Hey! Sorry we missed your call. How can we help you today? We can get you scheduled ASAP."`,
        },
        ...previousMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        ...(previousMessages.length === 0
          ? [{ role: "user" as const, content: "Generate the initial text-back message for a missed call." }]
          : []),
      ],
      max_tokens: 100,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("[OPENAI] Error:", err);
    // Fallback message if AI fails
    return "Hey! Sorry we missed your call. How can we help you today?";
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || "Hey! Sorry we missed your call. How can we help you today?";
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

async function saveConversation(
  callerPhone: string,
  businessPhone: string,
  messages: Array<{ role: string; content: string; timestamp: string }>
) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/conversations`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      caller_phone: callerPhone,
      business_phone: businessPhone,
      messages: JSON.stringify(messages),
      status: "active",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("[DB] Failed to save conversation:", err);
  }
}
