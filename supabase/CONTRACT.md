# Backend contract (Supabase)

The web app (`src/platform/*`) talks to Supabase through these tables and Edge Functions.
Plans and limits live in `src/platform/plans.ts`; plan ids: `free | family | family_plus | classroom | school`.

The app must keep working with **no backend configured** (free, device-only). When `VITE_SUPABASE_URL`
and `VITE_SUPABASE_ANON_KEY` are set, accounts, sync, payments and classrooms switch on.

## Tables (schema `public`, all with Row Level Security ON)

| Table | Columns | Who can read / write |
|---|---|---|
| `app_users` | `id uuid pk = auth.users.id`, `role text check (parent, teacher, school_admin)`, `display_name text`, `created_at` | Own row read/insert/update |
| `children` | `id uuid pk default gen_random_uuid()`, `parent_id uuid → app_users on delete cascade`, `name text not null`, `avatar text`, `created_at` | Parent: own children CRUD. Insert allowed only while the parent's child count < plan `maxChildren` (enforce in a trigger using `current_plan()`; free = 1, family = 3, family_plus = 5) |
| `consents` | `id`, `parent_id`, `child_id → children on delete cascade`, `policy_version text`, `method text`, `consented_at timestamptz default now()`, `revoked_at timestamptz` | Parent: own rows insert/select; update only `revoked_at` |
| `child_progress` | `child_id uuid pk → children on delete cascade`, `data jsonb not null`, `updated_at` | Parent of the child: select/upsert, **only if `current_plan()` gives cloud sync** (any paid plan) |
| `subscriptions` | `id`, `owner_user_id uuid null`, `school_id uuid null`, `plan text`, `period text (monthly, yearly)`, `status text`, `razorpay_subscription_id text unique`, `seats int default 1`, `current_period_end timestamptz`, `created_at`, `updated_at` | Owner (or school admin) select only. Writes only by Edge Functions (service role) |
| `schools` | `id`, `name`, `admin_user_id → app_users`, `created_at` | Members select; admin update |
| `school_members` | `school_id`, `user_id`, `role text (admin, teacher)`, pk(school_id,user_id) | Members select; admin insert/delete |
| `school_invites` | `id`, `school_id`, `email text`, `token text unique default encode(gen_random_bytes(16),'hex')`, `accepted_at` | Admin insert/select/delete; invitee accepts via RPC `accept_school_invite(token)` |
| `classes` | `id`, `teacher_id → app_users`, `school_id null`, `name`, `board text (CBSE, ICSE)`, `class_code text unique` (6 chars, no 0/O/1/I), `consent_confirmed boolean not null` (teacher/school confirms parents consented), `created_at` | Teacher: own classes CRUD, only when `current_plan()` is `classroom` or `school`; insert limited by `maxClasses` (classroom = 5) |
| `class_students` | `id`, `class_id → classes on delete cascade`, `display_name text`, `avatar text`, `picture_hash text`, `progress jsonb default '{}'`, `updated_at` | Teacher of the class: CRUD (≤ `maxStudentsPerClass`: classroom 45, school 60). Never readable by anon |
| `assignments` | `id`, `class_id → classes on delete cascade`, `chapter_id text`, `due_on date null`, `created_at` | Teacher of the class: CRUD |
| `premium_content` | `key text pk`, `min_plan text`, `payload jsonb` | Select only when the caller's plan rank ≥ `min_plan` rank |

Plan rank: free 0 < family 1 < family_plus 2 < classroom 3 < school 4. (For content gates, classroom and school both include everything family_plus has.)

## SQL functions

- `current_plan() returns text` — security definer. Best plan among: the caller's own subscriptions with `status in ('active','authenticated')` and `current_period_end > now()` (or null period end while `authenticated`), and `school` if the caller is a member of a school whose subscription is active. Default `'free'`.
- `accept_school_invite(token text)` — adds the caller to `school_members` as teacher if the invite email matches the caller's auth email; marks accepted.
- `picture_hash(class_id uuid, picture text) returns text` — `encode(digest(class_id::text || ':' || picture, 'sha256'), 'hex')` (pgcrypto).

## Edge Functions (Deno, `supabase/functions/<name>/index.ts`)

All return JSON, handle CORS (`OPTIONS`), and read secrets from env.

| Function | Auth | Input → Output |
|---|---|---|
| `razorpay-subscribe` | user JWT | `{ plan: 'family'|'family_plus'|'classroom'|'school', period: 'monthly'|'yearly', seats?: number, school_name?: string }` → creates a Razorpay subscription with plan id from env `RAZORPAY_PLAN_<PLAN>_<PERIOD>` (e.g. `RAZORPAY_PLAN_FAMILY_MONTHLY`), `quantity = seats` for school; inserts `subscriptions` row (status `created`; for school creates the `schools` row + admin membership). Returns `{ subscription_id, key_id }` |
| `razorpay-webhook` | Razorpay signature (`X-Razorpay-Signature`, HMAC-SHA256 of raw body with `RAZORPAY_WEBHOOK_SECRET`) | Handles `subscription.authenticated/activated/charged/pending/halted/cancelled/completed`: updates `status`, `current_period_end` (from `payload.subscription.entity.current_end`, unix seconds). Idempotent |
| `razorpay-cancel` | user JWT | `{ subscription_id }` (Razorpay id; must belong to the caller, or the caller is the school's admin) → `POST /v1/subscriptions/{id}/cancel` with `cancel_at_cycle_end: 1`; returns `{ status, current_period_end }`. Access continues until the period ends (the webhook marks it `cancelled`/`completed` later) |
| `class-roster` | none (class code is the secret) | `{ class_code }` → `{ class_id, class_name, board, students: [{ id, display_name, avatar }] }` (no progress, no hashes). 404 if unknown |
| `student-session` | none | `{ class_code, student_id, picture }` → verifies `picture_hash`; returns `{ token, student: { id, display_name, avatar, progress }, assignments: [{ chapter_id, due_on }] , board }`. Token = base64url(JSON{sid, cid, exp}) + '.' + HMAC-SHA256 with `STUDENT_TOKEN_SECRET`, 12 h expiry. Rate-limit: max 10 failed tries per student per 15 min (store attempts in a small table `student_login_attempts`) |
| `student-progress` | student token in body | `{ token, data }` → verifies token, updates `class_students.progress`, `updated_at`. Reject payloads > 200 KB |
| `delete-account` | user JWT | Deletes the caller's children, progress, consents, classes (cascade) and auth user. Refuses if the caller is the admin of a school with other members |
| `weekly-summary` | cron (header `Authorization: Bearer <CRON_SECRET>`) | For parents with `weeklySummary` plans, emails a 7-day summary per child (questions answered, % right, stars, lessons finished — computed from `child_progress.data.activity`) via Resend (`RESEND_API_KEY`, `SUMMARY_FROM_EMAIL`). Skips silently if keys are missing |

`child_progress.data` and `class_students.progress` hold the app's `ProfileData` shape from `src/class1/progressStore.ts`.

## Environment

Frontend (`.env`, public): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_RAZORPAY_KEY_ID` (optional; the subscribe function also returns it).

Edge Function secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAY_PLAN_FAMILY_MONTHLY`, `RAZORPAY_PLAN_FAMILY_YEARLY`, `RAZORPAY_PLAN_FAMILY_PLUS_MONTHLY`, `RAZORPAY_PLAN_FAMILY_PLUS_YEARLY`, `RAZORPAY_PLAN_CLASSROOM_MONTHLY`, `RAZORPAY_PLAN_CLASSROOM_YEARLY`, `RAZORPAY_PLAN_SCHOOL_YEARLY`, `STUDENT_TOKEN_SECRET`, `CRON_SECRET`, `RESEND_API_KEY`, `SUMMARY_FROM_EMAIL`, `APP_ORIGIN` (for CORS).
