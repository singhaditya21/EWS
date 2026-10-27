// Database access-rule tests: runs the Supabase migration in an in-memory Postgres (PGlite)
// with stand-ins for Supabase's auth schema, then checks plans, limits and row-level security.
// Run with `npm run test:db` (also runs in CI).
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import fs from 'fs';
import crypto from 'crypto';
const repo = process.cwd();
const db = new PGlite({ extensions: { pgcrypto } });
const results = [];
const ok = (name, cond, extra='') => results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`);

await db.exec(`
create schema if not exists extensions;
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key, email text, phone text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.role() returns text language sql stable as $$ select current_setting('request.jwt.claim.role', true) $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema extensions to anon, authenticated, service_role;
`);
try {
  await db.exec(fs.readFileSync(`${repo}/supabase/migrations/20261027000000_init.sql`, 'utf8'));
  ok('migration applies', true);
} catch (e) { ok('migration applies', false, e.message); console.log(results.join('\n')); process.exit(1); }
try { await db.exec(fs.readFileSync(`${repo}/supabase/seed.sql`, 'utf8')); ok('seed applies', true); } catch (e) { ok('seed applies', false, e.message); }

const U = { P: crypto.randomUUID(), P2: crypto.randomUUID(), T: crypto.randomUUID(), A: crypto.randomUUID(), T2: crypto.randomUUID() };
for (const [k, id] of Object.entries(U)) await db.query(`insert into auth.users (id, email) values ($1, $2)`, [id, `${k.toLowerCase()}@example.test`]);

const as = async (uid, sql, params=[]) => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false); set role ${uid ? 'authenticated' : 'anon'};`);
  try { return { rows: (await db.query(sql, params)).rows }; } catch (e) { return { error: e.message }; } finally { await db.exec('reset role'); }
};
const svc = async (sql, params=[]) => { await db.exec('reset role'); return (await db.query(sql, params)).rows; };
const future = new Date(Date.now() + 30*864e5).toISOString();
const past = new Date(Date.now() - 864e5).toISOString();

// Parent on Free
for (const k of ['P','P2','T','A','T2']) {
  const r = await as(U[k], `insert into public.app_users (id, role, display_name) values ($1, $2, $3)`, [U[k], k.startsWith('T') ? 'teacher' : k==='A' ? 'school_admin' : 'parent', k]);
  if (r.error) ok(`app_users insert ${k}`, false, r.error);
}
ok('free plan by default', (await as(U.P, `select public.current_plan() p`)).rows?.[0]?.p === 'free');
const c1 = await as(U.P, `insert into public.children (parent_id, name, avatar) values ($1,'Riya','🦁') returning id`, [U.P]);
ok('free: first child allowed', !c1.error, c1.error);
const c2 = await as(U.P, `insert into public.children (parent_id, name) values ($1,'Kabir')`, [U.P]);
ok('free: second child blocked', !!c2.error, c2.error?.slice(0,80));
const childId = c1.rows?.[0]?.id;
const cons = await as(U.P, `insert into public.consents (parent_id, child_id, policy_version, method) values ($1,$2,'v1','test')`, [U.P, childId]);
ok('consent insert', !cons.error, cons.error);
const pr = await as(U.P, `insert into public.child_progress (child_id, data) values ($1, '{"stars":1}')`, [childId]);
ok('free: cloud sync blocked', !!pr.error, pr.error?.slice(0,60));
const other = await as(U.P2, `select * from public.children`);
ok('other parent cannot see children', other.rows?.length === 0, other.error);
const fakeChild = await as(U.P2, `insert into public.children (parent_id, name) values ($1,'Hack')`, [U.P]);
ok('cannot add child to another parent', !!fakeChild.error);

// Family plan
await svc(`insert into public.subscriptions (owner_user_id, plan, period, status, razorpay_subscription_id, current_period_end) values ($1,'family','monthly','active','sub_P',$2)`, [U.P, future]);
ok('family plan detected', (await as(U.P, `select public.current_plan() p`)).rows?.[0]?.p === 'family');
for (const n of ['Kabir','Meera']) { const r = await as(U.P, `insert into public.children (parent_id, name) values ($1,$2)`, [U.P, n]); if (r.error) ok(`family child ${n}`, false, r.error); }
const c4 = await as(U.P, `insert into public.children (parent_id, name) values ($1,'Fourth')`, [U.P]);
ok('family: 4th child blocked', !!c4.error);
const pr2 = await as(U.P, `insert into public.child_progress (child_id, data) values ($1, '{"stars":2}') on conflict (child_id) do update set data = excluded.data`, [childId]);
ok('family: cloud sync allowed', !pr2.error, pr2.error);
const sel = await as(U.P, `select data from public.child_progress where child_id = $1`, [childId]);
ok('family: progress readable', sel.rows?.[0]?.data?.stars === 2, sel.error);
const subsSel = await as(U.P, `select id, plan, status, razorpay_subscription_id, current_period_end from public.subscriptions`);
ok('owner can read own subscription columns', subsSel.rows?.length === 1, subsSel.error);
const subsWrite = await as(U.P, `update public.subscriptions set plan = 'school'`);
ok('owner cannot edit subscription', !!subsWrite.error || (await svc(`select plan from public.subscriptions where owner_user_id=$1`, [U.P]))[0].plan === 'family', subsWrite.error?.slice(0,60));
const prem1 = await as(U.P, `select key from public.premium_content`);
ok('family: premium packs hidden', prem1.rows?.length === 0, prem1.error);

// Upgrade to family plus
await svc(`update public.subscriptions set plan='family_plus' where owner_user_id=$1`, [U.P]);
const prem2 = await as(U.P, `select key from public.premium_content`);
ok('family_plus: premium packs visible', (prem2.rows?.length ?? 0) >= 2, prem2.error ?? JSON.stringify(prem2.rows));
// Cancelled but still in paid period
await svc(`update public.subscriptions set status='cancelled' where owner_user_id=$1`, [U.P]);
ok('cancelled within period still counts', (await as(U.P, `select public.current_plan() p`)).rows?.[0]?.p === 'family_plus');
await svc(`update public.subscriptions set current_period_end=$2 where owner_user_id=$1`, [U.P, past]);
ok('expired falls back to free', (await as(U.P, `select public.current_plan() p`)).rows?.[0]?.p === 'free');
const syncAfter = await as(U.P, `update public.child_progress set data='{"stars":3}' where child_id=$1 returning child_id`, [childId]);
ok('expired: sync writes stop', !!syncAfter.error || syncAfter.rows?.length === 0);
const delAfter = await as(U.P, `delete from public.children where id=$1 returning id`, [childId]);
ok('expired: parent can still delete a child', delAfter.rows?.length === 1, delAfter.error);

// Anon
const anon1 = await as(null, `select * from public.class_students`);
ok('anon cannot read class_students', !!anon1.error || anon1.rows?.length === 0, anon1.error?.slice(0,50));
const anon2 = await as(null, `select * from public.premium_content`);
ok('anon cannot read premium_content', !!anon2.error || anon2.rows?.length === 0);
const anon3 = await as(null, `select * from public.children`);
ok('anon cannot read children', !!anon3.error || anon3.rows?.length === 0);

// Teacher
const cl0 = await as(U.T, `insert into public.classes (teacher_id, name, board, consent_confirmed) values ($1,'1A','CBSE',true)`, [U.T]);
ok('free teacher cannot create class', !!cl0.error);
await svc(`insert into public.subscriptions (owner_user_id, plan, period, status, razorpay_subscription_id, current_period_end) values ($1,'classroom','monthly','active','sub_T',$2)`, [U.T, future]);
const cl1 = await as(U.T, `insert into public.classes (teacher_id, name, board, class_code, consent_confirmed) values ($1,'1A','CBSE','ABC234',true) returning id, class_code`, [U.T]);
ok('classroom teacher creates class', !cl1.error, cl1.error);
const classId = cl1.rows?.[0]?.id;
const picHashJs = crypto.createHash('sha256').update(`${classId}:🐶🍎⭐`).digest('hex');
const picHashDb = (await svc(`select public.picture_hash($1::uuid, '🐶🍎⭐') h`, [classId]))[0]?.h;
ok('picture_hash matches the app formula', picHashJs === picHashDb);
let added = 0, blockedAt = null;
for (let i = 0; i < 46; i++) {
  const r = await as(U.T, `insert into public.class_students (class_id, display_name, picture_hash) values ($1,$2,$3)`, [classId, `Kid${i}`, picHashJs]);
  if (r.error) { blockedAt = i; break; } added++;
}
ok('classroom: 45 students max', added === 45 && blockedAt === 45, `added ${added}`);
const otherTeach = await as(U.P2, `select * from public.class_students`);
ok('other user cannot read class students', !!otherTeach.error || otherTeach.rows?.length === 0);
const asg = await as(U.T, `insert into public.assignments (class_id, chapter_id) values ($1,'cls1-math-add-sub-frog')`, [classId]);
ok('teacher assigns lesson', !asg.error, asg.error);
let classes = 1, cblock = null;
for (let i = 0; i < 5; i++) { const r = await as(U.T, `insert into public.classes (teacher_id, name, board, consent_confirmed) values ($1,$2,'ICSE',true)`, [U.T, `C${i}`]); if (r.error) { cblock = r.error; break; } classes++; }
ok('classroom: 5 classes max', classes === 5 && !!cblock, `classes ${classes}`);
const noConsent = await svc(`select count(*)::int n from public.classes`);
ok('generated class codes', (await svc(`select count(*)::int n from public.classes where class_code ~ '^[A-HJ-NP-Z2-9]{6}$'`))[0].n === noConsent[0].n);

// School
const school = (await svc(`insert into public.schools (name, admin_user_id) values ('Test School',$1) returning id`, [U.A]))[0].id;
await svc(`insert into public.school_members (school_id, user_id, role) values ($1,$2,'admin')`, [school, U.A]);
await svc(`insert into public.subscriptions (school_id, plan, period, status, razorpay_subscription_id, seats, current_period_end) values ($1,'school','yearly','active','sub_S',200,$2)`, [school, future]);
const inv = await as(U.A, `insert into public.school_invites (school_id, email) values ($1,'t2@example.test') returning token`, [school]);
ok('admin invites teacher', !inv.error, inv.error);
const wrongAccept = await as(U.P2, `select public.accept_school_invite($1)`, [inv.rows?.[0]?.token]);
ok('wrong email cannot accept invite', !!wrongAccept.error, wrongAccept.error?.slice(0,60));
const acc = await as(U.T2, `select public.accept_school_invite($1)`, [inv.rows?.[0]?.token]);
ok('invited teacher accepts', !acc.error, acc.error);
ok('school member gets school plan', (await as(U.T2, `select public.current_plan() p`)).rows?.[0]?.p === 'school');
const t2class = await as(U.T2, `insert into public.classes (teacher_id, school_id, name, board, consent_confirmed) values ($1,$2,'1B','ICSE',true)`, [U.T2, school]);
ok('school teacher creates class', !t2class.error, t2class.error);
const nonAdminInv = await as(U.T2, `insert into public.school_invites (school_id, email) values ($1,'x@example.test')`, [school]);
ok('non-admin cannot invite', !!nonAdminInv.error);

const names = await as(U.A, `select m.user_id, u.display_name from public.school_members m left join public.app_users u on u.id = m.user_id where m.school_id = $1`, [school]);
ok('admin sees member names', names.rows?.some(r => r.display_name === 'T2'), names.error ?? JSON.stringify(names.rows));
const leak = await as(U.T2, `select display_name from public.app_users where id <> $1`, [U.T2]);
ok('teacher cannot see other users', leak.rows?.length === 0, leak.error);

// School seat cap across classes
await svc(`update public.subscriptions set seats = 3 where school_id = $1`, [school]);
const t2cls = (await svc(`select id from public.classes where teacher_id = $1`, [U.T2]))[0].id;
let seatAdded = 0, seatErr = null;
for (let i = 0; i < 4; i++) { const r = await as(U.T2, `insert into public.class_students (class_id, display_name, picture_hash) values ($1,$2,$3)`, [t2cls, `S${i}`, picHashJs]); if (r.error) { seatErr = r.error; break; } seatAdded++; }
ok('school: seats cap students across classes', seatAdded === 3 && !!seatErr, `${seatAdded} added; ${seatErr?.slice(0,60)}`);

// Cascade delete
const kidsBefore = (await svc(`select count(*)::int n from public.children where parent_id=$1`, [U.P]))[0].n;
await svc(`delete from public.app_users where id=$1`, [U.P]);
const kidsAfter = (await svc(`select count(*)::int n from public.children where parent_id=$1`, [U.P]))[0].n;
ok('deleting a parent removes their children', kidsBefore > 0 && kidsAfter === 0, `${kidsBefore} -> ${kidsAfter}`);

console.log(results.join('\n'));
console.log(`\n${results.filter(r=>r.startsWith('PASS')).length}/${results.length} passed`);
if (results.some((r) => r.startsWith('FAIL'))) process.exit(1);
