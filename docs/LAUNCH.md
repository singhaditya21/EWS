# Launching paid plans

The app runs today as a free, device-only site. Paid plans, accounts, sync and classrooms switch on
when a backend is connected. These are the steps, in order. Steps marked **(you)** need your own
accounts, identity checks or legal sign-off, so they can't be automated.

## 1. Backend — Supabase **(you)**
Follow [`supabase/README.md`](../supabase/README.md): create the project (choose the Mumbai region),
push the database, set the function secrets and deploy the Edge Functions.

## 2. Payments — Razorpay **(you)**
1. Create a Razorpay account and complete KYC (business details, bank account, GST number).
2. In **Test mode** first, create the 7 plans listed in `supabase/README.md` and paste their ids into the function secrets.
3. Add the webhook (`…/functions/v1/razorpay-webhook`) with the subscription events and its secret.
4. Test every plan with Razorpay's test UPI/cards, then repeat in **Live mode**.

## 3. Front end
1. Copy `.env.example` to `.env.local` (for `npm run deploy`) and fill in the Supabase URL, anon key and Razorpay key id.
2. Build: `npm run build` — content checks, type-check and bundle.

## 4. Hosting — move to Cloudflare Pages and make the repo private **(you)**
Paid content and question banks shouldn't sit in a public repo. GitHub Pages needs a paid GitHub
plan for private repos, so move hosting first, then switch the repo to private:
1. Cloudflare dashboard → Workers & Pages → Create → Pages → connect the GitHub repo.
2. Build command `npm run build`, output directory `dist`, Node 20.
3. Add the three `VITE_…` variables under Settings → Environment variables.
4. Add your domain; set `APP_ORIGIN` (Supabase secret) and the Supabase Auth site URL to it.
5. Check the new site works end to end, then make the GitHub repo private and turn off GitHub Pages.

## 5. Legal and compliance **(you)**
- Have a qualified Indian lawyer review `src/platform/legal.ts` (privacy policy, terms, consent text) and fill every `[PLACEHOLDER]`.
- Appoint a Grievance Officer and publish their contact.
- Questions for the lawyer: verifiable parental consent under the DPDP Rules (is OTP sign-in + consent enough?), whether adaptive practice counts as "behavioural monitoring" of children, who controls data for a solo teacher on the Classroom plan, data stored outside India (email provider), breach-notification process.
- Register for GST; Razorpay issues invoices for subscriptions.

## 6. Content
- Have a practising Class 1 teacher review each chapter and mark it reviewed in `src/class1/boardMap.ts`.
- Record Hindi audio and add more premium packs (`supabase/seed.sql` → `premium_content`; list them in `src/platform/packs.ts`).
