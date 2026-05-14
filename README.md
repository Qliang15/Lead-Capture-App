# Lead Capture

Small lead capture app: a public form that saves to Supabase and forwards each submission to a webhook.

**Live URL:** https://lead-capture-app-lyart.vercel.app
## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + RLS)
- Vercel

## Routes

- `/` - landing page with the lead form
- `/leads` - table of all submissions, newest first
- `/api/leads` - POST: validates, saves to Supabase, then forwards to the webhook

## Running locally

```bash
git clone https://github.com/Qliang15/Lead-Capture-App.git
cd lead-capture-app
npm install
```

Set up Supabase:

1. Create a new project at https://supabase.com
2. Open the SQL editor and run `supabase/schema.sql`
3. From Settings → API, grab the project URL, the anon key, and the service role key

Copy the env file and fill it in:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
CANDIDATE_NAME=Qiyan Liang
```

Then:

```bash
npm run dev
```

Open http://localhost:3000.

## Notes on how it works

**Webhook flow.** The `/api/leads` route saves the lead to Supabase first. Only after a successful insert does it `fetch()` the webhook with the `X-Candidate-Name` header. If the webhook fails (non-2xx, network error, or 5s timeout) it's logged via `console.error` and the user still sees a success state. Logs show up in Vercel function logs.

**Why `/leads` is server-rendered.** Anon users shouldn't be able to read leads directly from Supabase. RLS is enabled on the `leads` table with no anon policies, so the anon key can't read anything. The `/leads` page is a server component that reads via the service role key, so the browser only gets the rendered HTML.

Note: the `/leads` page itself is publicly accessible at the deployed URL (the task says "no auth needed for this exercise"). The protection is at the database layer — the anon key can't read leads even if someone hits Supabase directly. In a real deployment I'd put auth in front of `/leads`.

**Error cases handled in the form:**

- Empty / invalid client input → inline field errors
- Duplicate email → 409 from API, friendly banner
- DB failure → 500, retry message
- Webhook failure → user still sees success, server logs the failure
- Network failure → "couldn't reach the server" banner

**Webhook timeout.** Capped at 5s with `AbortController` so a slow webhook doesn't make the user wait.

## Deploying to Vercel

1. Push to GitHub
2. Import the repo in Vercel
3. Add the four env vars (same as `.env.local`) under Settings → Environment Variables, for Production / Preview / Development
4. Deploy

## Verifying RLS

From a JS console with the anon key:

```js
const sb = createClient(URL, ANON_KEY);
await sb.from("leads").select("*");
// → { data: [], error: null }   RLS hides everything
```

## Project layout

```
app/
  api/leads/route.ts   POST: validate → insert → forward webhook
  leads/page.tsx       server-rendered leads table
  page.tsx             landing page
  layout.tsx
components/
  LeadForm.tsx         client form
lib/
  supabaseAdmin.ts     server-only client (service role)
  supabaseBrowser.ts   anon client
  types.ts
  validation.ts        shared client + server validation
supabase/
  schema.sql
```

## Things I'd add with more time

- Rate limiting on `/api/leads`
- Retry queue for failed webhooks (right now they're just logged)
- Auth on `/leads`
- Honeypot or captcha to cut spam
