// Keeps device progress and account progress in step.
// - Account children appear as learner profiles on this device (profile id = child id).
// - Paid plans sync each child's progress both ways; the newer copy wins.
// - A child signed in at school saves to the class.
import { getClient } from './supabase';
import { getSession, subscribeSession } from './session';
import { PLANS } from './plans';
import { getStudentSession, pushStudentProgress } from './student';
import { ProfileData, newProfile, progress, subscribeProgress } from '../class1/progressStore';

const PUSH_DELAY_MS = 2000;
/** updatedAt of the copy we last pulled or pushed, per profile, so we don't echo changes back. */
const synced: Record<string, string | undefined> = {};
let timer: ReturnType<typeof setTimeout> | null = null;
let started = false;

const newer = (a?: string, b?: string) => (a ?? '') > (b ?? '');

const pullAccountChildren = async () => {
  const s = getSession();
  if (s.status !== 'signed-in' || s.children.length === 0) return;
  const local = progress.getState().profiles;

  // Make sure every account child has a learner profile here.
  for (const child of s.children) {
    if (!local[child.id]) progress.upsertProfile({ ...newProfile(child.name), id: child.id, name: child.name });
  }

  if (!PLANS[s.plan].limits.cloudSync) return;
  const client = await getClient();
  const { data, error } = await client
    .from('child_progress')
    .select('child_id, data')
    .in('child_id', s.children.map((c) => c.id));
  if (error || !data) return;
  for (const row of data as { child_id: string; data: ProfileData }[]) {
    const mine = progress.getState().profiles[row.child_id];
    const name = s.children.find((c) => c.id === row.child_id)?.name ?? row.data.name;
    if (!mine || newer(row.data.updatedAt, mine.updatedAt)) {
      progress.upsertProfile({ ...row.data, id: row.child_id, name });
      synced[row.child_id] = row.data.updatedAt;
    }
  }
};

const pushActive = async () => {
  const p = progress.active();
  if (synced[p.id] === p.updatedAt) return;

  const student = getStudentSession();
  if (student && p.id === `student:${student.student.id}`) {
    synced[p.id] = p.updatedAt;
    await pushStudentProgress(p).catch(() => {
      synced[p.id] = undefined; // try again on the next change
    });
    return;
  }

  const s = getSession();
  if (s.status !== 'signed-in' || !PLANS[s.plan].limits.cloudSync) return;
  if (!s.children.some((c) => c.id === p.id)) return;
  synced[p.id] = p.updatedAt;
  const client = await getClient();
  const { error } = await client.from('child_progress').upsert({ child_id: p.id, data: p });
  if (error) synced[p.id] = undefined;
};

export const startSync = () => {
  if (started) return;
  started = true;
  subscribeSession(() => {
    void pullAccountChildren();
  });
  subscribeProgress(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void pushActive(), PUSH_DELAY_MS);
  });
  // Save before the tab closes if a change is still waiting.
  window.addEventListener('pagehide', () => {
    if (timer) void pushActive();
  });
};
