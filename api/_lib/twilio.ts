import type { VercelRequest } from "@vercel/node";
import twilio from "twilio";

/**
 * Validates that an incoming webhook request was really signed by Twilio.
 *
 * Without this check, anyone who discovers the webhook URL can POST fake
 * "incoming call" payloads and make our Twilio account send SMS to arbitrary
 * numbers (toll fraud / SMS pumping).
 *
 * Set TWILIO_VALIDATE_WEBHOOK=false to temporarily bypass (e.g. while testing
 * with curl), but never leave it off in production.
 */
export function isValidTwilioRequest(req: VercelRequest): boolean {
  if (process.env.TWILIO_VALIDATE_WEBHOOK === "false") {
    return true;
  }

  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const signature = req.headers["x-twilio-signature"];
  if (!authToken || !signature || typeof signature !== "string") {
    return false;
  }

  // Reconstruct the exact URL Twilio signed. Behind Vercel's proxy the
  // original host/proto live in x-forwarded-* headers.
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = (req.headers["x-forwarded-host"] as string) || req.headers.host;
  const url = `${proto}://${host}${req.url}`;

  const params = (req.body ?? {}) as Record<string, string>;
  return twilio.validateRequest(authToken, signature, url, params);
}

/** Normalized check for carrier opt-out / help keywords (Twilio handles the
 * actual opt-out; we just must not keep messaging or run AI on these). */
export function isOptOutKeyword(message: string): boolean {
  const normalized = (message || "").trim().toUpperCase();
  return ["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"].includes(normalized);
}

export function isHelpKeyword(message: string): boolean {
  const normalized = (message || "").trim().toUpperCase();
  return ["HELP", "INFO"].includes(normalized);
}
