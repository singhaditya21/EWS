// Signed-in grown-up (parent, teacher or school admin), their plan, children and school.
// Children never sign in here: at home they use the parent's device, at school a class code.
import { useSyncExternalStore } from 'react';
import { cloudConfigured } from './config';
import { callFunction, friendlyError, getClient } from './supabase';
import { PLAN_RANK, PlanId } from './plans';
import { POLICY_VERSION } from './legal';

export type AccountRole = 'parent' | 'teacher' | 'school_admin';

export interface AccountChild {
  id: string;
  name: string;
  avatar: string | null;
}

export interface SessionState {
  status: 'off' | 'loading' | 'signed-out' | 'signed-in';
  userId: string | null;
  email: string | null;
  phone: string | null;
  role: AccountRole | null;
  displayName: string | null;
  plan: PlanId;
  children: AccountChild[];
  school: { id: string; name: string; isAdmin: boolean } | null;
  error: string | null;
}

const initial: SessionState = {
  status: cloudConfigured ? 'loading' : 'off',
  userId: null,
  email: null,
  phone: null,
  role: null,
  displayName: null,
  plan: 'free',
  children: [],
  school: null,
  error: null,
};

let state = initial;
const listeners = new Set<() => void>();
const set = (patch: Partial<SessionState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

export const useSession = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state
  );
export const getSession = () => state;
export const subscribeSession = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const asPlan = (p: unknown): PlanId => ((PLAN_RANK as string[]).includes(String(p)) ? (p as PlanId) : 'free');

/** Reloads everything about the signed-in account from the backend. */
export const refreshSession = async () => {
  if (!cloudConfigured) return;
  try {
    const client = await getClient();
    const { data: auth } = await client.auth.getUser();
    const user = auth.user;
    if (!user) {
      set({ ...initial, status: 'signed-out' });
      return;
    }
    const [{ data: me }, { data: plan }, { data: kids }, { data: memberships }] = await Promise.all([
      client.from('app_users').select('role, display_name').eq('id', user.id).maybeSingle(),
      client.rpc('current_plan'),
      client.from('children').select('id, name, avatar').order('created_at'),
      client.from('school_members').select('role, schools(id, name)').eq('user_id', user.id),
    ]);
    // The embedded relation can come back as an object or a one-item array depending on the schema cache.
    const first = (memberships ?? [])[0] as unknown as
      | { role: string; schools: { id: string; name: string } | { id: string; name: string }[] | null }
      | undefined;
    const school = Array.isArray(first?.schools) ? first?.schools[0] : first?.schools;
    const m = first && school ? { role: first.role, schools: school } : undefined;
    set({
      status: 'signed-in',
      userId: user.id,
      email: user.email ?? null,
      phone: user.phone ?? null,
      role: (me?.role as AccountRole) ?? null,
      displayName: me?.display_name ?? null,
      plan: asPlan(plan),
      children: (kids ?? []) as AccountChild[],
      school: m?.schools ? { id: m.schools.id, name: m.schools.name, isAdmin: m.role === 'admin' } : null,
      error: null,
    });
  } catch (e) {
    set({ status: 'signed-out', error: friendlyError((e as Error).message) });
  }
};

export const initSession = async () => {
  if (!cloudConfigured) return;
  const client = await getClient();
  client.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') void refreshSession();
  });
  await refreshSession();
};

// --- Sign-in (one-time code to phone or email) ---

const asPhone = (raw: string) => {
  const digits = raw.replace(/[^\d+]/g, '');
  return digits.startsWith('+') ? digits : `+91${digits.replace(/^0/, '')}`;
};
const isEmail = (raw: string) => raw.includes('@');

export const sendCode = async (contact: string) => {
  const client = await getClient();
  const { error } = isEmail(contact)
    ? await client.auth.signInWithOtp({ email: contact.trim(), options: { shouldCreateUser: true } })
    : await client.auth.signInWithOtp({ phone: asPhone(contact) });
  if (error) throw new Error(friendlyError(error.message));
};

export const verifyCode = async (contact: string, code: string) => {
  const client = await getClient();
  const { error } = isEmail(contact)
    ? await client.auth.verifyOtp({ email: contact.trim(), token: code.trim(), type: 'email' })
    : await client.auth.verifyOtp({ phone: asPhone(contact), token: code.trim(), type: 'sms' });
  if (error) throw new Error(friendlyError(error.message));
  await refreshSession();
};

export const signOut = async () => {
  const client = await getClient();
  await client.auth.signOut();
  set({ ...initial, status: 'signed-out' });
};

export const setAccountRole = async (role: AccountRole, displayName: string) => {
  const client = await getClient();
  const { error } = await client
    .from('app_users')
    .upsert({ id: state.userId, role, display_name: displayName.trim() || null });
  if (error) throw new Error(friendlyError(error.message));
  await refreshSession();
};

// --- Children (parents) ---

/** Adds a child and records the parent's consent in the same step. */
export const addChild = async (name: string, avatar: string, consentMethod: string) => {
  const client = await getClient();
  const { data, error } = await client
    .from('children')
    .insert({ parent_id: state.userId, name: name.trim(), avatar })
    .select('id')
    .single();
  if (error) {
    throw new Error(
      /limit|maximum|plan/i.test(error.message)
        ? 'Your plan’s child limit is reached. Upgrade to add more children.'
        : error.message
    );
  }
  const { error: cErr } = await client.from('consents').insert({
    parent_id: state.userId,
    child_id: data.id,
    policy_version: POLICY_VERSION,
    method: consentMethod,
  });
  if (cErr) throw new Error(cErr.message);
  await refreshSession();
  return data.id as string;
};

export const removeChild = async (id: string) => {
  const client = await getClient();
  const { error } = await client.from('children').delete().eq('id', id);
  if (error) throw new Error(friendlyError(error.message));
  await refreshSession();
};

export const deleteAccount = async () => {
  await callFunction('delete-account', {});
  const client = await getClient();
  await client.auth.signOut();
  set({ ...initial, status: 'signed-out' });
};
