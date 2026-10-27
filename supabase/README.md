# OmniLearn backend (Supabase) — setup guide

This folder is the whole backend: database tables and security rules (`migrations/`), example
premium content (`seed.sql`), and the server functions (`functions/`). The app works without
it (free, progress kept on the device). Once you finish these steps and put two values in the
app's `.env`, accounts, sync, payments and classrooms switch on.

The exact API the app expects is in [`CONTRACT.md`](./CONTRACT.md).

You need:

- A Supabase account (free tier is fine to start): <https://supabase.com>
- Node.js 18+ (for `npx supabase ...`; nothing to install globally)
- A Razorpay account, in **Test mode** while you set up: <https://dashboard.razorpay.com>
- An SMS provider for phone sign-in (MSG91, Twilio, Vonage or TextLocal)
- Optional: a Resend account for the weekly parent email: <https://resend.com>

All commands below are run from the repository root (the folder that contains `supabase/`).

---

## 1. Create the Supabase project

1. Supabase dashboard → **New project**.
2. Name it `omnilearn`. Pick the **Mumbai (ap-south-1)** region so children's data stays in
   India. Save the database password somewhere safe (a password manager).
3. When it's ready, open **Project Settings → General** and copy the **Reference ID**
   (looks like `abcdefghijklmnop`). We call it `<project-ref>` below.

## 2. Create the tables and security rules

```bash
npx supabase login                               # opens the browser once
npx supabase link --project-ref <project-ref>    # asks for the database password
npx supabase db push                             # applies supabase/migrations/*
npx supabase db push --include-seed              # optional: also loads supabase/seed.sql
```

If `--include-seed` isn't available in your CLI version, open **SQL Editor** in the dashboard,
paste the contents of `supabase/seed.sql`, and run it.

Check: **Table Editor** should list `app_users`, `children`, `consents`, `child_progress`,
`subscriptions`, `schools`, `school_members`, `school_invites`, `classes`, `class_students`,
`assignments`, `premium_content`, `student_login_attempts`, `class_code_attempts`, each showing
"RLS enabled".

## 3. Connect the app

**Project Settings → API**: copy the **Project URL** and the **anon / publishable key** into the
app's `.env` (at the repo root):

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...            # the anon key — safe to ship in the browser
VITE_RAZORPAY_KEY_ID=rzp_test_...        # optional; the subscribe function also returns it
```

Never put the **service_role** key in the app or in git. It bypasses every security rule.

## 4. Sign-in: email code and phone code

**Authentication → URL Configuration**

- Site URL: your production address, e.g. `https://learn.example.in`
- Redirect URLs: add `http://localhost:5173` (development) and your production address.

**Authentication → Providers → Email**

- Enable **Email**. Turn **Confirm email** off (the one-time code itself proves the address).
- Email OTP expiry: `600` seconds; OTP length: `6`.

**Authentication → Email Templates** — the app asks people to type a 6-digit code, so the
**Magic Link** and **Confirm signup** templates must contain `{{ .Token }}`. Paste the contents
of `supabase/templates/magic_link.html` into both, with subject "Your OmniLearn sign-in code".

**Authentication → SMTP Settings** — Supabase's built-in mailer only sends a handful of emails
per hour and is meant for testing. Before launch, set up custom SMTP (Resend, Amazon SES,
Zoho, ...). With Resend: host `smtp.resend.com`, port `465`, user `resend`, password = a Resend
API key, sender = an address on your verified domain.

**Authentication → Providers → Phone**

1. Enable **Phone**.
2. Pick an SMS provider and paste its credentials (e.g. MSG91 auth key + sender id, or Twilio
   Account SID + Auth Token + Messaging Service SID).
3. SMS template: `Your OmniLearn code is {{ .Code }}. It expires in 10 minutes.`
4. **India needs DLT registration**: SMS to Indian numbers is only delivered if your sender ID
   and message template are registered on a DLT portal (Jio, Airtel, Vi, ...). MSG91 walks you
   through this; with Twilio you register via their India DLT process. Until that's done,
   use email sign-in.

For local development (`npx supabase start`) you can fix codes for test numbers in
`supabase/config.toml` under `[auth.sms.test_otp]`.

## 5. Create the Razorpay plans

Razorpay dashboard (in **Test mode** first) → **Subscriptions → Plans → Create plan**. Create
these 7 plans. Amounts are in rupees in the dashboard (the API stores them in paise); all
include 18% GST.

| Plan id env var                      | Billing  | Amount      | In paise   |
|--------------------------------------|----------|-------------|------------|
| `RAZORPAY_PLAN_FAMILY_MONTHLY`       | every 1 month | ₹99    | 9900       |
| `RAZORPAY_PLAN_FAMILY_YEARLY`        | every 1 year  | ₹799   | 79900      |
| `RAZORPAY_PLAN_FAMILY_PLUS_MONTHLY`  | every 1 month | ₹199   | 19900      |
| `RAZORPAY_PLAN_FAMILY_PLUS_YEARLY`   | every 1 year  | ₹1,499 | 149900     |
| `RAZORPAY_PLAN_CLASSROOM_MONTHLY`    | every 1 month | ₹249   | 24900      |
| `RAZORPAY_PLAN_CLASSROOM_YEARLY`     | every 1 year  | ₹1,999 | 199900     |
| `RAZORPAY_PLAN_SCHOOL_YEARLY`        | every 1 year  | ₹300 **per seat** | 30000 |

For the School plan the price is per seat: the app sends the number of seats as the
subscription `quantity`, and Razorpay charges `₹300 × seats`.

After creating each plan, copy its **Plan ID** (`plan_...`). Test-mode and Live-mode plans have
different ids — you'll create them again when you go live.

**Settings → API Keys → Generate Test Key** gives you a **Key ID** (`rzp_test_...`) and a
**Key Secret**. The secret is shown once; store it safely.

## 6. Set the function secrets

Generate two long random secrets first:

```bash
openssl rand -hex 32   # use as STUDENT_TOKEN_SECRET
openssl rand -hex 32   # use as CRON_SECRET
```

Then set everything (one command; replace each value):

```bash
npx supabase secrets set \
  APP_ORIGIN="https://learn.example.in,http://localhost:5173" \
  RAZORPAY_KEY_ID="rzp_test_xxx" \
  RAZORPAY_KEY_SECRET="xxx" \
  RAZORPAY_WEBHOOK_SECRET="choose-a-long-random-string" \
  RAZORPAY_PLAN_FAMILY_MONTHLY="plan_xxx" \
  RAZORPAY_PLAN_FAMILY_YEARLY="plan_xxx" \
  RAZORPAY_PLAN_FAMILY_PLUS_MONTHLY="plan_xxx" \
  RAZORPAY_PLAN_FAMILY_PLUS_YEARLY="plan_xxx" \
  RAZORPAY_PLAN_CLASSROOM_MONTHLY="plan_xxx" \
  RAZORPAY_PLAN_CLASSROOM_YEARLY="plan_xxx" \
  RAZORPAY_PLAN_SCHOOL_YEARLY="plan_xxx" \
  STUDENT_TOKEN_SECRET="<64 hex chars>" \
  CRON_SECRET="<64 hex chars>" \
  RESEND_API_KEY="re_xxx" \
  SUMMARY_FROM_EMAIL="OmniLearn <hello@learn.example.in>"
```

Tip: shell history keeps these. Alternatively put them in a file that is **not** committed
(e.g. `supabase/.env.secrets`; `supabase/.gitignore` already ignores `.env.*`) and run
`npx supabase secrets set --env-file supabase/.env.secrets`.

What each secret is:

| Secret | What it is / where to get it |
|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Provided to every function automatically by Supabase. **Don't set them** (the CLI refuses names starting with `SUPABASE_`). |
| `APP_ORIGIN` | The web address(es) allowed to call the functions from a browser (CORS), comma-separated. If unset, any site may call them — fine locally, not in production. |
| `RAZORPAY_KEY_ID` | Razorpay API Key ID (`rzp_test_...` / `rzp_live_...`). Public; the app's checkout also uses it. |
| `RAZORPAY_KEY_SECRET` | Razorpay API Key Secret. Lets the server create and cancel subscriptions. Secret. |
| `RAZORPAY_WEBHOOK_SECRET` | A string **you choose** and type into Razorpay's webhook settings (step 8). Proves webhook calls really come from Razorpay. Secret. |
| `RAZORPAY_PLAN_*` (7) | The plan ids from step 5. |
| `STUDENT_TOKEN_SECRET` | Signs the 12-hour sign-in tokens children get after entering their class code and pictures. At least 32 characters. Changing it signs every child out. Secret. |
| `CRON_SECRET` | Password the scheduled job sends to `weekly-summary` so nobody else can trigger emails. Secret. |
| `RESEND_API_KEY` | Resend API key for the weekly parent email. Optional: without it the weekly email is skipped. |
| `SUMMARY_FROM_EMAIL` | Sender for the weekly email, on a domain verified in Resend, e.g. `OmniLearn <hello@learn.example.in>`. |

Check with `npx supabase secrets list` (shows names and hashes, not values).

## 7. Deploy the functions

```bash
npx supabase functions deploy
```

This deploys every folder in `supabase/functions/` (folders starting with `_` are shared code,
not functions). `supabase/config.toml` tells Supabase which functions need a signed-in user
(`razorpay-subscribe`, `razorpay-cancel`, `delete-account`) and which do their own checks
(`razorpay-webhook`, `weekly-summary`, `class-roster`, `student-session`, `student-progress`).

Function URLs look like `https://<project-ref>.supabase.co/functions/v1/<name>`.

## 8. Add the Razorpay webhook

Razorpay dashboard → **Accounts & Settings → Webhooks → Add new webhook**:

- Webhook URL: `https://<project-ref>.supabase.co/functions/v1/razorpay-webhook`
- Secret: the same value as `RAZORPAY_WEBHOOK_SECRET`
- Alert email: yours
- Active events — tick exactly these:
  - `subscription.authenticated`
  - `subscription.activated`
  - `subscription.charged`
  - `subscription.pending`
  - `subscription.halted`
  - `subscription.cancelled`
  - `subscription.completed`

Test mode and Live mode have separate webhook lists; add it in both when you go live.

## 9. Schedule the weekly parent email

1. Dashboard → **Database → Extensions**: enable `pg_cron` and `pg_net`.
2. **SQL Editor**, run once (replace the two placeholders):

```sql
-- Keep the cron secret in Vault rather than in the job text.
select vault.create_secret('<the CRON_SECRET value>', 'cron_secret');

-- Every Sunday 03:30 UTC = 09:00 IST.
select cron.schedule(
  'weekly-summary',
  '30 3 * * 0',
  $$
  select net.http_post(
    url     := 'https://<project-ref>.supabase.co/functions/v1/weekly-summary',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);

-- Optional: tidy the sign-in rate-limit tables nightly (functions also do this occasionally).
select cron.schedule('purge-rate-limits', '15 21 * * *', $$ select public.purge_rate_limit_attempts(); $$);
```

See jobs with `select * from cron.job;`, runs with
`select * from cron.job_run_details order by start_time desc limit 10;`, and HTTP results with
`select * from net._http_response order by created desc limit 10;`.
To remove: `select cron.unschedule('weekly-summary');`.

Only parents on Family / Family Plus with an email address get the summary, only for children
whose consent hasn't been withdrawn, and only when something happened that week.

## 10. Test end to end (Razorpay Test mode)

1. Run the app (`npm run dev`) with the `.env` from step 3. Sign in with your email code.
2. Choose a plan → Razorpay Checkout opens. Pay with Razorpay's **test** card / UPI details from
   their docs (Payments → Test card details; for UPI use `success@razorpay`). No real money
   moves in Test mode.
3. Within a few seconds the webhook arrives. Check in **SQL Editor**:
   ```sql
   select plan, status, current_period_end, last_event_at from public.subscriptions order by created_at desc limit 5;
   ```
   Status should go `created` → `authenticated` → `active`.
4. In the app, the plan badge should change; adding a second child should now work on Family.
5. If nothing changes: Razorpay → Webhooks → your webhook → **delivery logs**, and Supabase →
   **Edge Functions → razorpay-webhook → Logs**. A `401 Invalid signature` means the webhook
   secret in Razorpay and `RAZORPAY_WEBHOOK_SECRET` differ.
6. Teacher flow: buy Classroom, create a class (tick "parents have consented"), add a student
   with 3 pictures, then on another browser enter the class code, tap the name and the pictures.
7. Cancel from the account page: the subscription stays usable until `current_period_end`.
8. Weekly email: call it by hand —
   ```bash
   curl -X POST https://<project-ref>.supabase.co/functions/v1/weekly-summary \
     -H "Authorization: Bearer <CRON_SECRET>"
   ```
   It returns `{ recipients, sent, skipped, failed }`.

## Going live

1. Razorpay: activate your account (KYC), switch to **Live mode**, create the 7 plans again,
   generate Live API keys, add the webhook again (Live mode) with a new secret.
2. `npx supabase secrets set` the live `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
   `RAZORPAY_WEBHOOK_SECRET` and the 7 live plan ids. Update `VITE_RAZORPAY_KEY_ID` if you use it.
3. Set `APP_ORIGIN` to your production address only.
4. Supabase: custom SMTP on, SMS provider DLT-approved, Site URL = production.

## How children's data is protected (DPDP Act)

- **No anonymous access.** The `anon` key can't read any table. Children never have accounts:
  at school they use a class code + picture password through the functions, which return only
  that child's own data.
- **Row Level Security on every table.** Parents see only their own children; teachers only their
  own classes; nobody can write subscriptions except the payment functions.
- **Consent.** Parents' consent is logged in `consents` (server-timestamped; a withdrawal is
  final). Teachers must confirm parental consent on a class before adding children.
- **Erasure.** `delete-account` cancels billing, then deletes the account; everything else
  (children, consents, progress, classes, students, assignments) is removed by cascading
  foreign keys. Deleting a child or class removes its data too.
- **Brute-force limits.** 10 wrong picture tries per child per 15 minutes; 30 unknown class
  codes per network per 15 minutes. IPs are stored only as salted hashes and purged daily.
- **Data minimisation.** Class rosters return first names and avatars only — no progress, no
  picture hashes.

## Changing plans or limits

Limits live in two places that must agree: `src/platform/plans.ts` (the app) and the
`plan_*` functions at the top of `migrations/20261027000000_init.sql` (the database). To
change them, add a **new** migration that `create or replace`s those functions, then
`npx supabase db push`. Never edit a migration that has already been pushed.
