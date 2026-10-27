import React, { useState } from 'react';
import { CurriculumChapter } from '../../types/curriculum.types';
import { AppRole, progress, useProgress } from '../progressStore';
import { cloudConfigured } from '../../platform/config';
import { openPage } from '../../platform/nav';
import { useSession } from '../../platform/session';
import { studentSignOut, useStudentSession } from '../../platform/student';
import { usePlan } from '../../platform/entitlements';
import { PLANS } from '../../platform/plans';

const ROLES: { id: AppRole; label: string }[] = [
  { id: 'child', label: '🧒 Child' },
  { id: 'parent', label: '👨‍👩‍👧 Parent' },
  { id: 'teacher', label: '🏫 Teacher' },
];

const linkBtn =
  'px-2.5 py-1.5 rounded-lg bg-[#090D16] border border-slate-700 text-slate-200 font-bold hover:border-cyan-400';

/** Who is learning (child profile), who is looking (child / parent / teacher), and the way to accounts. */
export const Class1Toolbar: React.FC<{
  chapters?: CurriculumChapter[];
  onSelectChapter?: (c: CurriculumChapter) => void;
}> = ({ chapters = [], onSelectChapter }) => {
  const state = useProgress();
  const session = useSession();
  const student = useStudentSession();
  const { plan, limits } = usePlan();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const profiles = Object.values(state.profiles).filter((p) => !p.id.startsWith('student:'));
  const signedIn = session.status === 'signed-in';
  const role = state.prefs.role;

  // A child signed in at school sees only their name, their class's lessons and a sign-out.
  if (student) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-100 font-extrabold text-sm">
          👋 {student.student.avatar} {student.student.display_name} • class {student.classCode}
        </span>
        {student.assignments.length > 0 && <span className="text-slate-300 font-bold">Your teacher’s lessons:</span>}
        {student.assignments.map((a) => {
          const ch = chapters.find((c) => c.id === a.chapter_id);
          if (!ch) return null;
          const done = state.profiles[state.activeProfileId]?.completedChapterIds.includes(ch.id);
          return (
            <button key={a.chapter_id} type="button" onClick={() => onSelectChapter?.(ch)} className={linkBtn}>
              {done ? '✓ ' : '📌 '}
              {ch.title.length > 40 ? `${ch.title.slice(0, 38)}…` : ch.title}
            </button>
          );
        })}
        <button type="button" onClick={studentSignOut} className={linkBtn}>
          Sign out of class
        </button>
      </div>
    );
  }

  // Signed-in parents add children (with consent) from Account; on a device without an account,
  // Free allows one learner here.
  const canAddLocal = !signedIn && profiles.length < limits.maxChildren;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <label className="flex items-center gap-1.5 text-slate-300 font-bold">
        Learner
        <select
          value={state.activeProfileId}
          onChange={(e) => progress.switchProfile(e.target.value)}
          className="px-2 py-1.5 rounded-lg bg-[#090D16] border border-slate-700 text-white font-bold"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (⭐{p.stars})
            </option>
          ))}
        </select>
      </label>
      {adding ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            progress.addProfile(name);
            setName('');
            setAdding(false);
          }}
          className="flex items-center gap-1"
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Child’s first name"
            className="px-2 py-1.5 rounded-lg bg-[#090D16] border border-slate-700 text-white w-36"
          />
          <button type="submit" className="px-2.5 py-1.5 rounded-lg bg-emerald-400 text-slate-950 font-extrabold">
            Add
          </button>
          <button type="button" onClick={() => setAdding(false)} className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-300">
            Cancel
          </button>
        </form>
      ) : role !== 'child' && (signedIn || !canAddLocal) ? (
        <button
          type="button"
          onClick={() => openPage(signedIn ? 'account' : 'plans')}
          className={linkBtn}
          title={signedIn ? 'Add children from your account' : `${PLANS[plan].name} allows ${limits.maxChildren} learner`}
        >
          + Add learner
        </button>
      ) : role !== 'child' ? (
        <button type="button" onClick={() => setAdding(true)} className={linkBtn}>
          + Add learner
        </button>
      ) : null}

      <div className="flex items-center gap-1 bg-[#090D16] p-1 rounded-lg border border-slate-800" role="group" aria-label="View as">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => progress.setRole(r.id)}
            aria-pressed={role === r.id}
            className={`px-2.5 py-1 rounded-md font-extrabold ${role === r.id ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {role === 'child' && cloudConfigured && (
        <button type="button" onClick={() => openPage('student')} className={linkBtn}>
          🏫 I’m in school
        </button>
      )}
      {role !== 'child' && (
        <>
          <button type="button" onClick={() => openPage('account')} className={linkBtn}>
            {signedIn ? `👤 ${session.displayName ?? 'Account'}` : '👤 Sign in'}
          </button>
          <button type="button" onClick={() => openPage('plans')} className={linkBtn}>
            💎 {plan === 'free' ? 'Plans' : PLANS[plan].name}
          </button>
        </>
      )}
      {role === 'teacher' && (
        <button type="button" onClick={() => openPage('classroom')} className={linkBtn}>
          🏫 Classroom
        </button>
      )}
      <span className="text-[10px] text-slate-500">
        {signedIn && limits.cloudSync ? 'Synced to your account' : 'Saved on this device'}
      </span>
    </div>
  );
};
