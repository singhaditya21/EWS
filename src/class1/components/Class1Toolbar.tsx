import React, { useState } from 'react';
import { AppRole, progress, useProgress } from '../progressStore';

const ROLES: { id: AppRole; label: string }[] = [
  { id: 'child', label: '🧒 Child' },
  { id: 'parent', label: '👨‍👩‍👧 Parent' },
  { id: 'teacher', label: '🏫 Teacher' },
];

/** Who is learning (child profile) and who is looking (child / parent / teacher view). */
export const Class1Toolbar: React.FC = () => {
  const state = useProgress();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const profiles = Object.values(state.profiles);

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
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="px-2.5 py-1.5 rounded-lg bg-[#090D16] border border-slate-700 text-slate-300 font-bold"
        >
          + Add learner
        </button>
      )}
      <div className="flex items-center gap-1 bg-[#090D16] p-1 rounded-lg border border-slate-800" role="group" aria-label="View as">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => progress.setRole(r.id)}
            aria-pressed={state.prefs.role === r.id}
            className={`px-2.5 py-1 rounded-md font-extrabold ${
              state.prefs.role === r.id ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <span className="text-[10px] text-slate-500">Saved on this device only</span>
    </div>
  );
};
