-- OmniLearn Class 1 backend: accounts, children, consent, sync, subscriptions, schools, classes.
--
-- Ground rules (children's data under India's DPDP Act):
--   * RLS is ON for every table. `anon` gets no table access at all; children's data is only
--     reachable by the parent / teacher who owns it, or by Edge Functions using the service role.
--   * Deleting an account cascades to every child, consent, progress row, class and student.
--   * Plan limits below mirror src/platform/plans.ts. Change both together.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------------------------
-- Plan catalogue (pure functions, mirror of plans.ts)
-- ---------------------------------------------------------------------------------------------

-- free 0 < family 1 < family_plus 2 < classroom 3 < school 4. Content gates use this order, so
-- classroom and school include everything family_plus has.
create or replace function public.plan_rank(plan text)
returns int language sql immutable set search_path = public as $$
  select case plan
    when 'free' then 0 when 'family' then 1 when 'family_plus' then 2
    when 'classroom' then 3 when 'school' then 4 else 0 end
$$;

-- maxChildren: free 1, family 3, family_plus 5, classroom 1, school 1.
create or replace function public.plan_max_children(plan text)
returns int language sql immutable set search_path = public as $$
  select case plan when 'family' then 3 when 'family_plus' then 5 else 1 end
$$;

-- maxClasses: classroom 5, school unlimited (represented by int max), others 0.
create or replace function public.plan_max_classes(plan text)
returns int language sql immutable set search_path = public as $$
  select case plan when 'classroom' then 5 when 'school' then 2147483647 else 0 end
$$;

-- maxStudentsPerClass: classroom 45, school 60, others 0.
create or replace function public.plan_max_students_per_class(plan text)
returns int language sql immutable set search_path = public as $$
  select case plan when 'classroom' then 45 when 'school' then 60 else 0 end
$$;

-- weeklySummary: family and family_plus only (classroom/school have it off in plans.ts).
create or replace function public.plan_weekly_summary(plan text)
returns boolean language sql immutable set search_path = public as $$
  select plan in ('family', 'family_plus')
$$;

-- ---------------------------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------------------------

create table public.app_users (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         text not null check (role in ('parent', 'teacher', 'school_admin')),
  display_name text check (display_name is null or char_length(display_name) <= 80),
  created_at   timestamptz not null default now()
);

create table public.children (
  id         uuid primary key default gen_random_uuid(),
  parent_id  uuid not null references public.app_users (id) on delete cascade,
  name       text not null check (char_length(btrim(name)) between 1 and 60),
  avatar     text check (avatar is null or char_length(avatar) <= 64),
  created_at timestamptz not null default now()
);
create index children_parent_id_idx on public.children (parent_id);

-- Verifiable parental consent log. child_id may be null for account-level consent given before
-- a child profile exists.
create table public.consents (
  id             uuid primary key default gen_random_uuid(),
  parent_id      uuid not null references public.app_users (id) on delete cascade,
  child_id       uuid references public.children (id) on delete cascade,
  policy_version text not null check (char_length(policy_version) between 1 and 40),
  method         text not null check (char_length(method) between 1 and 80),
  consented_at   timestamptz not null default now(),
  revoked_at     timestamptz
);
create index consents_parent_id_idx on public.consents (parent_id);
create index consents_child_id_idx on public.consents (child_id);

-- ProfileData from src/class1/progressStore.ts. 256 KB cap leaves room for jsonb's text form
-- (the student-progress function itself rejects payloads over 200 KB).
create table public.child_progress (
  child_id   uuid primary key references public.children (id) on delete cascade,
  data       jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 262144),
  updated_at timestamptz not null default now()
);

create table public.schools (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(btrim(name)) between 2 and 120),
  admin_user_id uuid not null references public.app_users (id) on delete cascade,
  created_at    timestamptz not null default now()
);
create index schools_admin_user_id_idx on public.schools (admin_user_id);

create table public.school_members (
  school_id  uuid not null references public.schools (id) on delete cascade,
  user_id    uuid not null references public.app_users (id) on delete cascade,
  role       text not null check (role in ('admin', 'teacher')),
  created_at timestamptz not null default now(),
  primary key (school_id, user_id)
);
create index school_members_user_id_idx on public.school_members (user_id);

create table public.school_invites (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools (id) on delete cascade,
  email       text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  token       text not null unique default encode(extensions.gen_random_bytes(16), 'hex'),
  created_at  timestamptz not null default now(),
  accepted_at timestamptz
);
create index school_invites_school_id_idx on public.school_invites (school_id);

-- Written only by Edge Functions (service role). Razorpay statuses:
-- https://razorpay.com/docs/payments/subscriptions/states/
create table public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  owner_user_id            uuid references public.app_users (id) on delete cascade,
  school_id                uuid references public.schools (id) on delete cascade,
  plan                     text not null check (plan in ('family', 'family_plus', 'classroom', 'school')),
  period                   text not null check (period in ('monthly', 'yearly')),
  status                   text not null default 'created' check (status in (
                             'created', 'authenticated', 'active', 'pending', 'halted',
                             'cancelled', 'completed', 'expired', 'paused')),
  razorpay_subscription_id text unique,
  seats                    int not null default 1 check (seats >= 1),
  current_period_end       timestamptz,
  -- Set by razorpay-cancel when the user cancels "at cycle end"; access continues till then.
  cancel_at_period_end     boolean not null default false,
  -- Razorpay event time of the last webhook applied, so late/out-of-order deliveries are ignored.
  last_event_at            timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  check (owner_user_id is not null or school_id is not null),
  check (plan <> 'school' or school_id is not null)
);
create index subscriptions_owner_user_id_idx on public.subscriptions (owner_user_id);
create index subscriptions_school_id_idx on public.subscriptions (school_id);

-- Unambiguous 6-character code: no 0/O/1/I.
create table public.classes (
  id                uuid primary key default gen_random_uuid(),
  teacher_id        uuid not null references public.app_users (id) on delete cascade,
  school_id         uuid references public.schools (id) on delete set null,
  name              text not null check (char_length(btrim(name)) between 1 and 80),
  board             text not null check (board in ('CBSE', 'ICSE')),
  class_code        text not null unique check (class_code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  consent_confirmed boolean not null,
  created_at        timestamptz not null default now()
);
create index classes_teacher_id_idx on public.classes (teacher_id);
create index classes_school_id_idx on public.classes (school_id);

create table public.class_students (
  id           uuid primary key default gen_random_uuid(),
  class_id     uuid not null references public.classes (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 40),
  avatar       text check (avatar is null or char_length(avatar) <= 64),
  -- picture_hash(class_id, picture); never returned to the roster or to students.
  picture_hash text check (picture_hash is null or picture_hash ~ '^[0-9a-f]{64}$'),
  progress     jsonb not null default '{}'::jsonb
                 check (jsonb_typeof(progress) = 'object' and octet_length(progress::text) <= 262144),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index class_students_class_id_idx on public.class_students (class_id);

create table public.assignments (
  id         uuid primary key default gen_random_uuid(),
  class_id   uuid not null references public.classes (id) on delete cascade,
  chapter_id text not null check (char_length(chapter_id) between 1 and 120),
  due_on     date,
  created_at timestamptz not null default now()
);
create index assignments_class_id_idx on public.assignments (class_id);

create table public.premium_content (
  key      text primary key,
  min_plan text not null check (min_plan in ('free', 'family', 'family_plus', 'classroom', 'school')),
  payload  jsonb not null
);

-- Failed picture-password tries (rate limit: 10 per student per 15 min). Service role only.
create table public.student_login_attempts (
  id           bigint generated always as identity primary key,
  student_id   uuid not null references public.class_students (id) on delete cascade,
  attempted_at timestamptz not null default now()
);
create index student_login_attempts_student_idx on public.student_login_attempts (student_id, attempted_at);
create index student_login_attempts_at_idx on public.student_login_attempts (attempted_at);

-- Failed class-code lookups per (salted, hashed) client IP, so class codes can't be enumerated
-- to harvest children's names. No raw IPs are stored. Service role only.
create table public.class_code_attempts (
  id           bigint generated always as identity primary key,
  ip_hash      text not null,
  attempted_at timestamptz not null default now()
);
create index class_code_attempts_ip_idx on public.class_code_attempts (ip_hash, attempted_at);
create index class_code_attempts_at_idx on public.class_code_attempts (attempted_at);

-- ---------------------------------------------------------------------------------------------
-- Plan resolution
-- ---------------------------------------------------------------------------------------------

-- A subscription grants access while active/authenticated and inside its paid period
-- (authenticated may have no period yet). A cancelled one keeps access until the period it
-- was paid for ends.
create or replace function public.subscription_grants_access(status text, period_end timestamptz)
returns boolean language sql stable set search_path = public as $$
  select (status in ('active', 'authenticated', 'cancelled') and period_end > now())
      or (status = 'authenticated' and period_end is null)
$$;

-- Every paid plan the user currently has: own subscriptions plus 'school' via membership.
create or replace function public.active_plans_for(uid uuid)
returns setof text language sql stable security definer set search_path = public as $$
  select s.plan from public.subscriptions s
   where s.owner_user_id = uid
     and public.subscription_grants_access(s.status, s.current_period_end)
  union
  select 'school' from public.school_members m
    join public.subscriptions s on s.school_id = m.school_id and s.plan = 'school'
   where m.user_id = uid
     and public.subscription_grants_access(s.status, s.current_period_end)
$$;

create or replace function public.plan_for_user(uid uuid)
returns text language sql stable security definer set search_path = public as $$
  select coalesce(
    (select p from public.active_plans_for(uid) p order by public.plan_rank(p) desc limit 1),
    'free')
$$;

-- Best plan of the caller (by rank). Default 'free'.
create or replace function public.current_plan()
returns text language sql stable security definer set search_path = public as $$
  select case when auth.uid() is null then 'free' else public.plan_for_user(auth.uid()) end
$$;

-- Limits take the most generous of all the user's active plans. Picking only the top-ranked plan
-- would wrongly cut a Family Plus parent who is also a school teacher to 1 child (school ranks
-- higher but has maxChildren 1).
create or replace function public.user_max_children(uid uuid)
returns int language sql stable security definer set search_path = public as $$
  select max(public.plan_max_children(p))
    from (select 'free'::text union select * from public.active_plans_for(uid)) x(p)
$$;

create or replace function public.user_max_classes(uid uuid)
returns int language sql stable security definer set search_path = public as $$
  select max(public.plan_max_classes(p))
    from (select 'free'::text union select * from public.active_plans_for(uid)) x(p)
$$;

create or replace function public.user_max_students_per_class(uid uuid)
returns int language sql stable security definer set search_path = public as $$
  select max(public.plan_max_students_per_class(p))
    from (select 'free'::text union select * from public.active_plans_for(uid)) x(p)
$$;

-- ---------------------------------------------------------------------------------------------
-- Membership helpers (SECURITY DEFINER so policies can use them without RLS recursion)
-- ---------------------------------------------------------------------------------------------

create or replace function public.is_school_member(sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.school_members where school_id = sid and user_id = auth.uid())
      or exists (select 1 from public.schools where id = sid and admin_user_id = auth.uid())
$$;

create or replace function public.is_school_admin(sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.schools where id = sid and admin_user_id = auth.uid())
      or exists (select 1 from public.school_members
                  where school_id = sid and user_id = auth.uid() and role = 'admin')
$$;

create or replace function public.is_class_teacher(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.classes where id = cid and teacher_id = auth.uid())
$$;

-- ---------------------------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------------------------

create or replace function public.picture_hash(class_id uuid, picture text)
returns text language sql immutable set search_path = public as $$
  select encode(extensions.digest(class_id::text || ':' || picture, 'sha256'), 'hex')
$$;

-- Default for classes.class_code. Uses crypto-random bytes (the code is the roster's only
-- secret); 256 is a multiple of 32, so `byte % 32` is unbiased. SECURITY DEFINER so the
-- uniqueness check sees every class, not just the caller's.
create or replace function public.generate_class_code()
returns text language plpgsql volatile security definer set search_path = public as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes bytea;
  code text;
begin
  loop
    bytes := extensions.gen_random_bytes(6);
    code := '';
    for i in 0..5 loop
      code := code || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.classes c where c.class_code = code);
  end loop;
  return code;
end
$$;

alter table public.classes alter column class_code set default public.generate_class_code();

-- Invitee joins a school as teacher. The invite's email must match the caller's auth email.
create or replace function public.accept_school_invite(token text)
returns uuid language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  caller_email text;
  inv public.school_invites%rowtype;
begin
  if uid is null then
    raise exception 'Sign in to accept this invite.' using errcode = '28000';
  end if;

  select lower(u.email) into caller_email from auth.users u where u.id = uid;
  if caller_email is null or caller_email = '' then
    raise exception 'Sign in with the email address the invite was sent to.' using errcode = '42501';
  end if;

  select * into inv from public.school_invites i
   where i.token = accept_school_invite.token
   for update;
  if not found or inv.accepted_at is not null then
    raise exception 'This invite is not valid or was already used.' using errcode = 'P0002';
  end if;
  if lower(inv.email) <> caller_email then
    raise exception 'This invite was sent to a different email address.' using errcode = '42501';
  end if;

  insert into public.app_users (id, role) values (uid, 'teacher') on conflict (id) do nothing;
  insert into public.school_members (school_id, user_id, role)
    values (inv.school_id, uid, 'teacher')
    on conflict (school_id, user_id) do nothing;
  update public.school_invites set accepted_at = now() where id = inv.id;
  return inv.school_id;
end
$$;

-- Parents to email in weekly-summary (service role only). Needs a weeklySummary plan and an email.
create or replace function public.weekly_summary_recipients()
returns table (user_id uuid, email text)
language sql stable security definer set search_path = public as $$
  select u.id, au.email::text
    from public.app_users u
    join auth.users au on au.id = u.id
   where coalesce(au.email, '') <> ''
     and exists (select 1 from public.children c where c.parent_id = u.id)
     and exists (select 1 from public.active_plans_for(u.id) p where public.plan_weekly_summary(p))
$$;

-- Housekeeping for the rate-limit tables (service role / pg_cron).
create or replace function public.purge_rate_limit_attempts()
returns void language sql volatile security definer set search_path = public as $$
  delete from public.student_login_attempts where attempted_at < now() - interval '1 day';
  delete from public.class_code_attempts where attempted_at < now() - interval '1 day';
$$;

-- ---------------------------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end
$$;

create trigger child_progress_updated_at before update on public.child_progress
  for each row execute function public.set_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();
create trigger class_students_updated_at before update on public.class_students
  for each row execute function public.set_updated_at();

-- Child limit per plan. The advisory lock serialises concurrent inserts for the same parent so
-- two quick taps can't both slip under the limit.
create or replace function public.enforce_child_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  n int;
  lim int;
begin
  perform pg_advisory_xact_lock(hashtextextended('children:' || new.parent_id::text, 0));
  select count(*) into n from public.children where parent_id = new.parent_id;
  lim := public.user_max_children(new.parent_id);
  if n >= lim then
    raise exception 'Child limit reached for your plan (maximum %).', lim
      using errcode = 'P0001', hint = 'Upgrade your plan to add more children.';
  end if;
  return new;
end
$$;

create trigger children_limit before insert on public.children
  for each row execute function public.enforce_child_limit();

create or replace function public.enforce_class_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  n int;
  lim int;
begin
  if tg_op = 'UPDATE' and new.teacher_id = old.teacher_id then
    return new;
  end if;
  perform pg_advisory_xact_lock(hashtextextended('classes:' || new.teacher_id::text, 0));
  lim := public.user_max_classes(new.teacher_id);
  if lim = 0 then
    raise exception 'Your plan does not include classes.'
      using errcode = 'P0001', hint = 'Choose the Classroom or School plan.';
  end if;
  select count(*) into n from public.classes where teacher_id = new.teacher_id;
  if n >= lim then
    raise exception 'Class limit reached for your plan (maximum %).', lim using errcode = 'P0001';
  end if;
  return new;
end
$$;

create trigger classes_limit before insert or update of teacher_id on public.classes
  for each row execute function public.enforce_class_limit();

-- Student limit per class, from the class teacher's plan. Students can only be added once the
-- teacher/school has confirmed parental consent for the class.
create or replace function public.enforce_student_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  cls public.classes%rowtype;
  n int;
  lim int;
begin
  if tg_op = 'UPDATE' and new.class_id = old.class_id then
    return new;
  end if;
  select * into cls from public.classes where id = new.class_id;
  if not found then
    raise exception 'Class not found.' using errcode = 'P0002';
  end if;
  if not cls.consent_confirmed then
    raise exception 'Confirm that parents have consented before adding children to this class.'
      using errcode = 'P0001';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('class_students:' || new.class_id::text, 0));
  lim := public.user_max_students_per_class(cls.teacher_id);
  select count(*) into n from public.class_students where class_id = new.class_id;
  if n >= lim then
    raise exception 'Student limit reached for this class on your plan (maximum %).', lim
      using errcode = 'P0001';
  end if;
  -- School classes also share the school's paid seats across all its classes.
  if cls.school_id is not null then
    perform pg_advisory_xact_lock(hashtextextended('school_seats:' || cls.school_id::text, 0));
    select s.seats into lim
      from public.subscriptions s
     where s.school_id = cls.school_id
       and s.plan = 'school'
       and (s.status in ('active', 'authenticated') or (s.status = 'cancelled' and s.current_period_end > now()))
     order by s.current_period_end desc nulls last
     limit 1;
    if lim is not null then
      select count(*) into n
        from public.class_students st join public.classes c on c.id = st.class_id
       where c.school_id = cls.school_id;
      if n >= lim then
        raise exception 'All % student seats in your school licence are used. Ask your school admin to add seats.', lim
          using errcode = 'P0001';
      end if;
    end if;
  end if;
  return new;
end
$$;

create trigger class_students_limit before insert or update of class_id on public.class_students
  for each row execute function public.enforce_student_limit();

-- Consent rows are an audit trail: server sets the times, and a revocation is final.
create or replace function public.guard_consent()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.consented_at := now();
    new.revoked_at := null;
  elsif old.revoked_at is not null then
    new.revoked_at := old.revoked_at;
  elsif new.revoked_at is not null then
    new.revoked_at := now();
  end if;
  return new;
end
$$;

create trigger consents_guard before insert or update on public.consents
  for each row execute function public.guard_consent();

create or replace function public.normalise_invite_email()
returns trigger language plpgsql set search_path = public as $$
begin
  new.email := lower(btrim(new.email));
  return new;
end
$$;

create trigger school_invites_email before insert or update of email on public.school_invites
  for each row execute function public.normalise_invite_email();

-- ---------------------------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------------------------
-- `(select ...)` around auth.uid()/current_plan() makes Postgres evaluate them once per
-- statement instead of once per row.

alter table public.app_users              enable row level security;
alter table public.children               enable row level security;
alter table public.consents               enable row level security;
alter table public.child_progress         enable row level security;
alter table public.subscriptions          enable row level security;
alter table public.schools                enable row level security;
alter table public.school_members         enable row level security;
alter table public.school_invites         enable row level security;
alter table public.classes                enable row level security;
alter table public.class_students         enable row level security;
alter table public.assignments            enable row level security;
alter table public.premium_content        enable row level security;
alter table public.student_login_attempts enable row level security;
alter table public.class_code_attempts    enable row level security;

-- app_users: own row read/insert/update.
create policy app_users_select on public.app_users for select to authenticated
  using (id = (select auth.uid()));
-- School admins may see the names of teachers in their own school (for the admin page).
create policy app_users_select_school_admin on public.app_users for select to authenticated
  using (exists (
    select 1 from public.school_members m
     where m.user_id = app_users.id and public.is_school_admin(m.school_id)));
create policy app_users_insert on public.app_users for insert to authenticated
  with check (id = (select auth.uid()));
create policy app_users_update on public.app_users for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- children: parent CRUD on own children (insert limit enforced by trigger).
create policy children_select on public.children for select to authenticated
  using (parent_id = (select auth.uid()));
create policy children_insert on public.children for insert to authenticated
  with check (parent_id = (select auth.uid()));
create policy children_update on public.children for update to authenticated
  using (parent_id = (select auth.uid())) with check (parent_id = (select auth.uid()));
create policy children_delete on public.children for delete to authenticated
  using (parent_id = (select auth.uid()));

-- consents: parent insert/select own; update limited to revoked_at by column grant below.
create policy consents_select on public.consents for select to authenticated
  using (parent_id = (select auth.uid()));
create policy consents_insert on public.consents for insert to authenticated
  with check (
    parent_id = (select auth.uid())
    and (child_id is null or exists (
      select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid())))
  );
create policy consents_update on public.consents for update to authenticated
  using (parent_id = (select auth.uid())) with check (parent_id = (select auth.uid()));

-- child_progress: parent of the child, only on a plan with cloud sync (any paid plan).
-- Delete is allowed regardless of plan so a parent can always erase a child's data.
create policy child_progress_select on public.child_progress for select to authenticated
  using (
    (select public.current_plan()) <> 'free'
    and exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid()))
  );
create policy child_progress_insert on public.child_progress for insert to authenticated
  with check (
    (select public.current_plan()) <> 'free'
    and exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid()))
  );
create policy child_progress_update on public.child_progress for update to authenticated
  using (
    (select public.current_plan()) <> 'free'
    and exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid()))
  )
  with check (
    (select public.current_plan()) <> 'free'
    and exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid()))
  );
create policy child_progress_delete on public.child_progress for delete to authenticated
  using (exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid())));

-- subscriptions: owner or school admin may read. No client writes.
create policy subscriptions_select on public.subscriptions for select to authenticated
  using (
    owner_user_id = (select auth.uid())
    or (school_id is not null and public.is_school_admin(school_id))
  );

-- schools: members read; admin updates (name only, by column grant). Created by Edge Functions.
create policy schools_select on public.schools for select to authenticated
  using (public.is_school_member(id));
create policy schools_update on public.schools for update to authenticated
  using (public.is_school_admin(id)) with check (public.is_school_admin(id));

-- school_members: members read; admin adds/removes teachers; a teacher may leave.
create policy school_members_select on public.school_members for select to authenticated
  using (public.is_school_member(school_id));
create policy school_members_insert on public.school_members for insert to authenticated
  with check (public.is_school_admin(school_id) and role = 'teacher');
create policy school_members_delete on public.school_members for delete to authenticated
  using (
    role = 'teacher'
    and (public.is_school_admin(school_id) or user_id = (select auth.uid()))
  );

-- school_invites: admin insert/select/delete. Invitees use accept_school_invite().
create policy school_invites_select on public.school_invites for select to authenticated
  using (public.is_school_admin(school_id));
create policy school_invites_insert on public.school_invites for insert to authenticated
  with check (public.is_school_admin(school_id));
create policy school_invites_delete on public.school_invites for delete to authenticated
  using (public.is_school_admin(school_id));

-- classes: teacher's own, only on classroom/school. Delete is always allowed (data erasure).
create policy classes_select on public.classes for select to authenticated
  using (teacher_id = (select auth.uid()) and (select public.current_plan()) in ('classroom', 'school'));
create policy classes_insert on public.classes for insert to authenticated
  with check (
    teacher_id = (select auth.uid())
    and (select public.current_plan()) in ('classroom', 'school')
    and (school_id is null or public.is_school_member(school_id))
  );
create policy classes_update on public.classes for update to authenticated
  using (teacher_id = (select auth.uid()) and (select public.current_plan()) in ('classroom', 'school'))
  with check (
    teacher_id = (select auth.uid())
    and (select public.current_plan()) in ('classroom', 'school')
    and (school_id is null or public.is_school_member(school_id))
  );
create policy classes_delete on public.classes for delete to authenticated
  using (teacher_id = (select auth.uid()));

-- class_students: teacher of the class (limit + consent enforced by trigger).
create policy class_students_select on public.class_students for select to authenticated
  using (public.is_class_teacher(class_id) and (select public.current_plan()) in ('classroom', 'school'));
create policy class_students_insert on public.class_students for insert to authenticated
  with check (public.is_class_teacher(class_id) and (select public.current_plan()) in ('classroom', 'school'));
create policy class_students_update on public.class_students for update to authenticated
  using (public.is_class_teacher(class_id) and (select public.current_plan()) in ('classroom', 'school'))
  with check (public.is_class_teacher(class_id) and (select public.current_plan()) in ('classroom', 'school'));
create policy class_students_delete on public.class_students for delete to authenticated
  using (public.is_class_teacher(class_id));

-- assignments: teacher of the class.
create policy assignments_select on public.assignments for select to authenticated
  using (public.is_class_teacher(class_id) and (select public.current_plan()) in ('classroom', 'school'));
create policy assignments_insert on public.assignments for insert to authenticated
  with check (public.is_class_teacher(class_id) and (select public.current_plan()) in ('classroom', 'school'));
create policy assignments_update on public.assignments for update to authenticated
  using (public.is_class_teacher(class_id) and (select public.current_plan()) in ('classroom', 'school'))
  with check (public.is_class_teacher(class_id) and (select public.current_plan()) in ('classroom', 'school'));
create policy assignments_delete on public.assignments for delete to authenticated
  using (public.is_class_teacher(class_id));

-- premium_content: readable when the caller's plan rank >= min_plan rank.
create policy premium_content_select on public.premium_content for select to authenticated
  using (public.plan_rank((select public.current_plan())) >= public.plan_rank(min_plan));

-- student_login_attempts, class_code_attempts: RLS on with no policies = no client access.

-- ---------------------------------------------------------------------------------------------
-- Privileges (least privilege; RLS above still applies on top of these)
-- ---------------------------------------------------------------------------------------------

-- Supabase grants everything to anon/authenticated by default. Start from nothing.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

-- Future tables in this schema are not readable by anon unless a migration grants it.
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;

grant select, insert (id, role, display_name), update (id, role, display_name)
  on public.app_users to authenticated;
grant select, insert, update, delete on public.children to authenticated;
grant select, insert (parent_id, child_id, policy_version, method), update (revoked_at)
  on public.consents to authenticated;
grant select, insert, update, delete on public.child_progress to authenticated;
grant select (id, owner_user_id, school_id, plan, period, status, razorpay_subscription_id, seats,
              current_period_end, cancel_at_period_end, created_at)
  on public.subscriptions to authenticated;
grant select, update (name) on public.schools to authenticated;
grant select, insert, delete on public.school_members to authenticated;
grant select, insert (school_id, email), delete on public.school_invites to authenticated;
grant select, insert, update, delete on public.classes to authenticated;
grant select, insert, update, delete on public.class_students to authenticated;
grant select, insert, update, delete on public.assignments to authenticated;
grant select on public.premium_content to authenticated;

-- Functions callable by signed-in users (the helpers are also needed inside RLS policies).
grant execute on function
  public.plan_rank(text), public.plan_max_children(text), public.plan_max_classes(text),
  public.plan_max_students_per_class(text), public.plan_weekly_summary(text),
  public.current_plan(), public.is_school_member(uuid), public.is_school_admin(uuid),
  public.is_class_teacher(uuid), public.picture_hash(uuid, text), public.generate_class_code(),
  public.accept_school_invite(text), public.subscription_grants_access(text, timestamptz)
  to authenticated;

-- Edge Functions (service role) also need the server-side helpers.
grant execute on all functions in schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
