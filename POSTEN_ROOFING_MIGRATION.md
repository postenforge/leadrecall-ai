# Migrating the Missed-Call Stack into `postenroofing`

This repo (`leadrecall-ai`) contains a working, hardened missed-call text-back
system for Vercel. This doc is the checklist for lifting it into the
`postenforge/postenroofing` repo so Posten Roofing's site answers every call.

## What to copy

Copy these files verbatim into the roofing repo (same paths):

```
api/_lib/twilio.ts   ← webhook signature validation + STOP/HELP keyword helpers
api/voice.ts         ← call forwarding + missed-call text-back
api/sms.ts           ← AI conversation + opt-out handling + owner alerts
api/health.ts        ← env/database health check
api/leads.ts         ← lead capture endpoint (adapt fields, see below)
```

Also make sure the roofing repo's `vercel.json` routes API traffic:

```json
"rewrites": [
  { "source": "/api/:path*", "destination": "/api/:path*" },
  { "source": "/((?!api|assets/).*)", "destination": "/index.html" }
]
```

And `package.json` needs these dependencies: `twilio`, `@vercel/node` (dev).

### Adapt `api/leads.ts` for homeowners

The current form fields are B2B (`businessName`, `ownerName`). A roofing quote
form should capture: name, phone, address (or at least ZIP), and what's going
on (leak / storm damage / replacement / inspection). Keep the same
validation-then-Supabase-insert pattern.

## Supabase setup (new project or existing)

```sql
create table if not exists leads (
  id bigint generated always as identity primary key,
  business_name text,          -- repurpose or replace with homeowner fields
  owner_name text not null,
  phone text not null,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists conversations (
  id bigint generated always as identity primary key,
  caller_phone text not null,
  business_phone text not null,
  messages jsonb not null default '[]',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on conversations (caller_phone, business_phone, status, created_at desc);
```

Keep Row Level Security ON with no public policies — the API uses the service
key and RLS never applies to it; leaving RLS on means the anon key can't read
customer phone numbers.

## Vercel environment variables

| Variable | Purpose |
|---|---|
| `TWILIO_ACCOUNT_SID` | Twilio console → Account Info |
| `TWILIO_AUTH_TOKEN` | Twilio console → Account Info |
| `TWILIO_PHONE_NUMBER` | The toll-free number, E.164 (`+18885551234`) |
| `FORWARD_TO_PHONE` | Matt's cell — calls ring here first; text-back only fires if unanswered |
| `BUSINESS_NAME` | `Posten Roofing` — used in the first text and the AI prompt |
| `OWNER_NOTIFICATION_PHONE` | Where lead-activity SMS alerts go (Matt's cell) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (never the anon key) |
| `OPENAI_API_KEY` | Only used for reply conversations, not the first text |
| `TWILIO_VALIDATE_WEBHOOK` | Leave unset in production. Set `false` only while testing webhooks with curl |

## Twilio console configuration

1. Buy a **toll-free** number (not a local 10DLC number — see below).
2. Phone number → Voice → "A call comes in" → Webhook →
   `https://<your-domain>/api/voice` (HTTP POST).
3. Phone number → Messaging → "A message comes in" → Webhook →
   `https://<your-domain>/api/sms` (HTTP POST).
4. Use the production domain (custom domain if you attach one) — the signature
   check validates the exact URL Twilio was configured with, so the webhook
   URL in Twilio must match the domain serving the function.

## Toll-free verification (the replacement for the denied 10DLC campaigns)

Submit via Twilio console → Messaging → Regulatory Compliance → Toll-Free
Verification. This is a single form, no brand/campaign vetting, typically
approved in days. What to enter:

- **Business info:** legal entity for Posten Roofing (LLC + EIN strongly
  preferred over sole prop), website URL, business address.
- **Use case:** Customer Care. Description: *"When a customer calls our
  roofing company and we are unable to answer, we send a single SMS letting
  them know we missed their call and asking how we can help. Replies continue
  as a two-way customer service conversation."*
- **Opt-in type:** Verbal / via phone call. Opt-in description: *"The consumer
  initiates contact by calling our business phone number. Our voicemail
  greeting states they will receive a text message from us. The first message
  identifies our business and includes opt-out instructions."*
- **Sample message** (must match what the code actually sends —
  see `api/voice.ts`):
  > Hi, it's Posten Roofing. Sorry we missed your call! How can we help you
  > today? Reply STOP to opt out.
- **Volume:** pick the lowest tier that's honest (e.g., 1,000/month).
- Make sure the website has visible Privacy Policy and Terms pages that
  mention SMS (this repo's `/privacy` and `/terms` pages already have the
  required language — copy those too).

## End-to-end test plan (after deploy)

1. `GET /api/health` → expect `"status": "healthy"`.
2. Call the toll-free number from another phone; let `FORWARD_TO_PHONE` ring
   out → caller hears the message and receives the template text.
3. Call again and *answer* on the forwarded phone → no text should be sent.
4. Reply to the text → AI response arrives; `OWNER_NOTIFICATION_PHONE` gets
   the lead alert.
5. Reply `STOP` → no reply comes back (Twilio sends the carrier opt-out
   confirmation); the conversation row flips to `closed` in Supabase.
6. Text `START`, then trigger a fresh missed call the next day → a new
   text-back arrives (24h dedup window).

## Known limitation

If `FORWARD_TO_PHONE`'s voicemail picks up, Twilio counts the call as
answered and no text-back fires. Keep the cell's voicemail delay longer than
the 20-second dial timeout in `api/voice.ts`, or lower that timeout.
