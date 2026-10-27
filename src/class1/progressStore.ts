// Device-only progress store for child profiles.
// Nothing leaves the browser: no accounts, no network. Every storage access is wrapped
// so a private window or blocked storage just means progress is not remembered.
import { useSyncExternalStore } from 'react';
import { setSpeechEnabled } from '../utils/speech';

export type AppRole = 'child' | 'parent' | 'teacher';
export type ObservationLevel = 'beginning' | 'developing' | 'proficient';

export interface SkillRecord {
  attempts: number;
  correct: number;
  /** Leitner box 1–5; higher means the skill is more secure and is reviewed less often. */
  box: number;
  lastSeen: string | null;
  nextDue: string | null;
}

export interface ActivityEntry {
  at: string;
  kind: 'quiz' | 'practice' | 'star' | 'complete';
  chapterId?: string;
  skillId?: string;
  correct?: boolean;
}

export interface ProfileData {
  id: string;
  name: string;
  createdAt: string;
  stars: number;
  /** Star key -> date (YYYY-MM-DD) it was last earned, so repeat taps don't farm stars. */
  starLog: Record<string, string>;
  completedChapterIds: string[];
  /** Question id -> result of the FIRST attempt only. */
  quizFirstAttempts: Record<string, { correct: boolean; at: string; chapterId: string }>;
  skills: Record<string, SkillRecord>;
  observations: Record<string, { level: ObservationLevel; note?: string; at: string }>;
  activity: ActivityEntry[];
  /** Practice rounds started per day (YYYY-MM-DD), for the free plan's daily limit. */
  practiceLog?: Record<string, number>;
  /** Last local change (ISO), used to decide which copy wins when syncing with an account. */
  updatedAt?: string;
}

interface StoreState {
  version: 1;
  activeProfileId: string;
  profiles: Record<string, ProfileData>;
  prefs: { voice: boolean; role: AppRole };
}

const STORAGE_KEY = 'omnilearn_class1_progress_v1';
const LEGACY_COMPLETED_KEY = 'omnilearn_completed_chapters';
const MAX_ACTIVITY = 600;
/** Days until the next review for Leitner boxes 1..5. */
const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];

export const today = () => new Date().toISOString().slice(0, 10);
const addDays = (date: string, days: number) => {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const newId = () => `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

const emptyProfile = (name: string, completed: string[] = []): ProfileData => ({
  id: newId(),
  name,
  createdAt: new Date().toISOString(),
  stars: 0,
  starLog: {},
  completedChapterIds: completed,
  quizFirstAttempts: {},
  skills: {},
  observations: {},
  activity: [],
});

const readJSON = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const load = (): StoreState => {
  const saved = readJSON<StoreState>(STORAGE_KEY);
  if (saved?.version === 1 && saved.profiles?.[saved.activeProfileId]) return saved;
  const legacy = readJSON<string[]>(LEGACY_COMPLETED_KEY) ?? [];
  const first = emptyProfile('My Child', Array.isArray(legacy) ? legacy : []);
  return {
    version: 1,
    activeProfileId: first.id,
    profiles: { [first.id]: first },
    prefs: { voice: true, role: 'child' },
  };
};

let state: StoreState = load();
setSpeechEnabled(state.prefs.voice);
const listeners = new Set<() => void>();

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: keep working in memory.
  }
};

const commit = (next: StoreState) => {
  state = next;
  persist();
  listeners.forEach((l) => l());
};

const updateActive = (fn: (p: ProfileData) => ProfileData) => {
  const p = state.profiles[state.activeProfileId];
  const next = { ...fn(p), updatedAt: new Date().toISOString() };
  commit({ ...state, profiles: { ...state.profiles, [p.id]: next } });
};

const log = (p: ProfileData, entry: Omit<ActivityEntry, 'at'>): ActivityEntry[] =>
  [...p.activity, { ...entry, at: new Date().toISOString() }].slice(-MAX_ACTIVITY);

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

// Keep tabs in sync when the same device has the app open twice.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    const fresh = load();
    state = fresh;
    listeners.forEach((l) => l());
  });
}

export const progress = {
  getState: () => state,
  active: () => state.profiles[state.activeProfileId],

  addProfile(name: string) {
    const p = emptyProfile(name.trim() || 'New Learner');
    commit({ ...state, activeProfileId: p.id, profiles: { ...state.profiles, [p.id]: p } });
  },
  switchProfile(id: string) {
    if (state.profiles[id]) commit({ ...state, activeProfileId: id });
  },
  renameProfile(id: string, name: string) {
    const p = state.profiles[id];
    if (!p || !name.trim()) return;
    commit({ ...state, profiles: { ...state.profiles, [id]: { ...p, name: name.trim() } } });
  },
  deleteProfile(id: string) {
    const ids = Object.keys(state.profiles);
    if (ids.length <= 1 || !state.profiles[id]) return;
    const profiles = { ...state.profiles };
    delete profiles[id];
    const activeProfileId = id === state.activeProfileId ? Object.keys(profiles)[0] : state.activeProfileId;
    commit({ ...state, profiles, activeProfileId });
  },

  /**
   * Adds or replaces a whole profile (an account child or a school student's saved progress).
   * Does not bump updatedAt, so syncing back the same data doesn't loop.
   */
  upsertProfile(p: ProfileData, activate = false) {
    commit({
      ...state,
      activeProfileId: activate ? p.id : state.activeProfileId,
      profiles: { ...state.profiles, [p.id]: p },
    });
  },
  /** Removes a profile without the "keep at least one" rule (used when leaving student mode). */
  removeProfile(id: string, fallbackId?: string) {
    if (!state.profiles[id]) return;
    const profiles = { ...state.profiles };
    delete profiles[id];
    if (Object.keys(profiles).length === 0) {
      const p = emptyProfile('My Child');
      profiles[p.id] = p;
    }
    const activeProfileId =
      state.activeProfileId === id ? (fallbackId && profiles[fallbackId] ? fallbackId : Object.keys(profiles)[0]) : state.activeProfileId;
    commit({ ...state, profiles, activeProfileId });
  },
  /** Starts a practice round if today's limit allows it. Returns false when the limit is reached. */
  tryStartPracticeRound(limitPerDay: number): boolean {
    const p = progress.active();
    const used = p.practiceLog?.[today()] ?? 0;
    if (used >= limitPerDay) return false;
    updateActive((cur) => ({ ...cur, practiceLog: { [today()]: used + 1 } }));
    return true;
  },
  practiceRoundsToday: () => progress.active().practiceLog?.[today()] ?? 0,

  setVoice(on: boolean) {
    setSpeechEnabled(on);
    commit({ ...state, prefs: { ...state.prefs, voice: on } });
  },
  setRole(role: AppRole) {
    commit({ ...state, prefs: { ...state.prefs, role } });
  },

  /** Returns false when this star was already earned today (no farming by repeat taps). */
  awardStar(key: string): boolean {
    const p = progress.active();
    if (p.starLog[key] === today()) return false;
    updateActive((cur) => ({
      ...cur,
      stars: cur.stars + 1,
      starLog: { ...cur.starLog, [key]: today() },
      activity: log(cur, { kind: 'star' }),
    }));
    return true;
  },

  toggleComplete(chapterId: string) {
    updateActive((p) => {
      const done = p.completedChapterIds.includes(chapterId);
      return {
        ...p,
        completedChapterIds: done
          ? p.completedChapterIds.filter((c) => c !== chapterId)
          : [...p.completedChapterIds, chapterId],
        activity: done ? p.activity : log(p, { kind: 'complete', chapterId }),
      };
    });
  },

  /** Records only the first attempt for each question. */
  recordQuizAttempt(questionId: string, chapterId: string, correct: boolean, skillId?: string) {
    const p = progress.active();
    if (p.quizFirstAttempts[questionId]) return;
    updateActive((cur) => ({
      ...cur,
      quizFirstAttempts: {
        ...cur.quizFirstAttempts,
        [questionId]: { correct, at: new Date().toISOString(), chapterId },
      },
      activity: log(cur, { kind: 'quiz', chapterId, skillId, correct }),
    }));
    if (skillId) progress.recordSkillResult(skillId, correct, chapterId, false);
  },

  recordSkillResult(skillId: string, correct: boolean, chapterId?: string, logIt = true) {
    updateActive((p) => {
      const prev = p.skills[skillId] ?? { attempts: 0, correct: 0, box: 1, lastSeen: null, nextDue: null };
      const box = correct ? Math.min(5, prev.box + 1) : 1;
      const rec: SkillRecord = {
        attempts: prev.attempts + 1,
        correct: prev.correct + (correct ? 1 : 0),
        box,
        lastSeen: today(),
        nextDue: addDays(today(), BOX_INTERVAL_DAYS[box]),
      };
      return {
        ...p,
        skills: { ...p.skills, [skillId]: rec },
        activity: logIt ? log(p, { kind: 'practice', chapterId, skillId, correct }) : p.activity,
      };
    });
  },

  setObservation(chapterId: string, level: ObservationLevel, note?: string) {
    updateActive((p) => ({
      ...p,
      observations: { ...p.observations, [chapterId]: { level, note, at: new Date().toISOString() } },
    }));
  },
};

export const subscribeProgress = subscribe;
export const newProfile = emptyProfile;

export const useProgress = () => useSyncExternalStore(subscribe, () => state, () => state);
export const useActiveProfile = () => {
  const s = useProgress();
  return s.profiles[s.activeProfileId];
};

/** Skills due for review today (never-seen skills are not "due"; they are new). */
export const dueSkillIds = (p: ProfileData, on = today()) =>
  Object.entries(p.skills)
    .filter(([, r]) => r.nextDue !== null && r.nextDue <= on)
    .map(([id]) => id);
