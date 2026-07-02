import type { VercelRequest, VercelResponse } from "@vercel/node";
import twilio from "twilio";
import { isValidTwilioRequest } from "./_lib/twilio";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

/** The business owner's real phone. When set, incoming calls ring through to
 * it first and the text-back only fires if the call goes unanswered. When
 * unset, every call is treated as missed (text-back immediately). */
const FORWARD_TO_PHONE = process.env.FORWARD_TO_PHONE;

/** Business identity used in the text-back. SMS senders are required to
 * identify themselves, and callers won't recognize a bare Twilio number. */
const BUSINESS_NAME = process.env.BUSINESS_NAME || "our team";

/** How long ago a conversation can have started and still suppress a new
 * text-back. Callers from last week deserve a fresh response. */
const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Twilio Voice Webhook
 *
 * Call flow:
 * 1. Incoming call → if FORWARD_TO_PHONE is set, <Dial> rings the owner's
 *    phone. Twilio then re-requests this endpoint with DialCallStatus.
 * 2. If the dial completed, the caller talked to a human — done.
 * 3. If unanswered/busy/failed (or no forward number configured), we send the
 *    text-back SMS, then tell the caller to expect a text and hang up.
 *
 * IMPORTANT: On Vercel serverless, all async work must complete BEFORE
 * res.send() — the function may be terminated right after responding.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }
  if (!isValidTwilioRequest(req)) {
    console.warn("[VOICE] Rejected request with invalid Twilio signature");
    return res.status(403).send("Forbidden");
  }

  const callerPhone = req.body.From;
  const calledPhone = req.body.To;
  const dialCallStatus = req.body.DialCallStatus; // present only on the <Dial> action callback

  console.log(
    `[VOICE] From ${callerPhone} to ${calledPhone}, CallStatus=${req.body.CallStatus}, DialCallStatus=${dialCallStatus ?? "n/a"}`
  );

  const twiml = new twilio.twiml.VoiceResponse();

  // Step 1: fresh incoming call with a forward number → ring the owner first.
  if (FORWARD_TO_PHONE && !dialCallStatus) {
    const dial = twiml.dial({
      timeout: 20,
      action: "/api/voice", // Twilio calls back here with DialCallStatus
      callerId: TWILIO_PHONE_NUMBER,
    });
    dial.number(FORWARD_TO_PHONE);
    res.setHeader("Content-Type", "text/xml");
    return res.status(200).send(twiml.toString());
  }

  // Step 2: the owner answered — nothing more to do.
  if (dialCallStatus === "completed" || dialCallStatus === "answered") {
    twiml.hangup();
    res.setHeader("Content-Type", "text/xml");
    return res.status(200).send(twiml.toString());
  }

  // Step 3: genuinely missed call (no-answer/busy/failed, or no forwarding
  // configured). Send the text-back before responding.
  try {
    await sendTextBack(callerPhone, calledPhone);
    console.log(`[VOICE] Text-back sent to ${callerPhone}`);
  } catch (err) {
    console.error("[VOICE] Failed to send text-back:", err);
  }

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

  // Skip only if we texted this caller back within the dedup window —
  // otherwise a repeat caller weeks later would never get a response.
  const existingConvo = await getRecentActiveConversation(callerPhone, businessPhone);
  if (existingConvo) {
    console.log(`[TEXT-BACK] Recent active conversation exists for ${callerPhone}, skipping duplicate text`);
    return;
  }

  // Deliberately a template, not an LLM call: it's instant, it can never say
  // something off-script, and it matches the sample message submitted for
  // carrier registration (10DLC / toll-free verification).
  const message = `Hi, it's ${BUSINESS_NAME}. Sorry we missed your call! How can we help you today? Reply STOP to opt out.`;

  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: message,
    from: TWILIO_PHONE_NUMBER,
    to: callerPhone,
  });

  console.log(`[TEXT-BACK] Sent to ${callerPhone}: "${message}"`);

  await saveConversation(callerPhone, businessPhone, [
    { role: "assistant", content: message, timestamp: new Date().toISOString() },
  ]);
}

async function getRecentActiveConversation(callerPhone: string, businessPhone: string) {
  const since = new Date(Date.now() - DEDUP_WINDOW_MS).toISOString();
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/conversations?caller_phone=eq.${encodeURIComponent(callerPhone)}&business_phone=eq.${encodeURIComponent(businessPhone)}&status=eq.active&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=1`,
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
