import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  const checks = {
    env: {
      supabaseUrl: !!SUPABASE_URL,
      supabaseKey: !!SUPABASE_SERVICE_KEY,
    },
    database: false as boolean,
    timestamp: new Date().toISOString(),
  };

  // Test Supabase connection
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    try {
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/leads?select=id&limit=1`, {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      });
      checks.database = resp.ok;
    } catch {
      checks.database = false;
    }
  }

  const healthy = checks.env.supabaseUrl && checks.env.supabaseKey && checks.database;

  return res.status(healthy ? 200 : 503).json({
    status: healthy ? "healthy" : "degraded",
    ...checks,
  });
}
