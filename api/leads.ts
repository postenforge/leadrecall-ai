import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

interface LeadPayload {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
}

function validatePayload(body: unknown): { valid: true; data: LeadPayload } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body is required" };
  }

  const { businessName, ownerName, phone, email } = body as Record<string, unknown>;

  if (!businessName || typeof businessName !== "string" || businessName.trim().length === 0) {
    return { valid: false, error: "Business name is required" };
  }
  if (!ownerName || typeof ownerName !== "string" || ownerName.trim().length === 0) {
    return { valid: false, error: "Owner name is required" };
  }
  if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
    return { valid: false, error: "Phone number is required" };
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return { valid: false, error: "Valid email is required" };
  }

  return {
    valid: true,
    data: {
      businessName: (businessName as string).trim(),
      ownerName: (ownerName as string).trim(),
      phone: (phone as string).trim(),
      email: (email as string).trim(),
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  // Validate input
  const validation = validatePayload(req.body);
  if (!validation.valid) {
    return res.status(400).json({ success: false, error: (validation as { valid: false; error: string }).error });
  }

  const { businessName, ownerName, phone, email } = (validation as { valid: true; data: LeadPayload }).data;

  try {
    // Insert lead into Supabase via REST API
    const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        business_name: businessName,
        owner_name: ownerName,
        phone,
        email,
      }),
    });

    if (!supabaseRes.ok) {
      const errBody = await supabaseRes.text();
      console.error("Supabase insert error:", errBody);
      return res.status(500).json({ success: false, error: "Failed to save lead" });
    }

    const [lead] = await supabaseRes.json();
    console.log("Lead saved:", lead.id, businessName, email);

    // Send notification email to owner (non-blocking)
    try {
      await sendOwnerNotification({ businessName, ownerName, phone, email });
    } catch (notifyErr) {
      console.warn("Owner notification failed (non-blocking):", notifyErr);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Lead submission error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function sendOwnerNotification(lead: LeadPayload) {
  const NOTIFY_EMAIL = process.env.OWNER_EMAIL;
  if (!NOTIFY_EMAIL) {
    console.warn("OWNER_EMAIL not set, skipping notification");
    return;
  }

  // Use Supabase Edge Function or a simple webhook for notifications
  // For now, log the lead details — we'll add email integration next
  console.log(`[NOTIFICATION] New lead from ${lead.businessName} (${lead.ownerName}) - ${lead.phone} - ${lead.email}`);
}
