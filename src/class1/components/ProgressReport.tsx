import React from 'react';
import { SchoolBoard } from '../../types/curriculum.types';
import { useActiveProfile } from '../progressStore';
import { LEVEL_DESCRIPTOR, LEVEL_LABEL, SkillLevel, percent, summarise } from '../progressModel';
import { SUBJECT_LABELS } from '../skills';
import { CURRICULUM_DATA } from '../../data/curriculum';

const LEVEL_STYLE: Record<SkillLevel, string> = {
  'not-started': 'bg-slate-800 text-slate-400 border-slate-700',
  beginning: 'bg-rose-500/15 text-rose-200 border-rose-400/50',
  developing: 'bg-amber-500/15 text-amber-200 border-amber-400/50',
  proficient: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/50',
};

/**
 * Progress for the active child, built only from saved attempts.
 * CBSE view follows the Holistic Progress Card idea (descriptors, no marks);
 * ICSE view adds a percentage from first-attempt quiz answers, as ICSE schools usually report.
 */
export const ProgressReport: React.FC<{ board: SchoolBoard; compact?: boolean }> = ({ board, compact }) => {
  const profile = useActiveProfile();
  const subjects = summarise(profile, board);
  const anything = Object.keys(profile.skills).length + Object.keys(profile.quizFirstAttempts).length > 0;

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-white">
              {profile.name} — Class 1 {board === 'CBSE' ? 'Holistic Progress' : 'Term Progress'}
            </h3>
            <p className="text-xs text-slate-400">
              {board === 'CBSE'
                ? 'Descriptors, not marks. This is a home/app record to support the teacher’s Holistic Progress Card (which the teacher fills in using Beginner / Proficient / Advanced).'
                : 'Scores are from first attempts only; repeat tries don’t change them.'}{' '}
              Saved on this device only.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold print:hidden"
          >
            🖨️ Print / Save as PDF
          </button>
        </div>
      )}

      {!anything && (
        <p className="p-3 rounded-xl bg-[#090D16] border border-slate-800 text-xs text-slate-300">
          Nothing recorded yet. Answer a quiz or play a Practice round and progress will appear here.
        </p>
      )}

      <div className={`grid gap-2.5 ${compact ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
        {subjects.map((s) => {
          const pct = percent(s.quizCorrect, s.quizAnswered);
          const done = s.chaptersTotal ? Math.round((s.chaptersDone / s.chaptersTotal) * 100) : 0;
          return (
            <div key={s.subject} className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-extrabold text-white">{SUBJECT_LABELS[s.subject]}</div>
                {board === 'ICSE' && (
                  <div className="text-xs font-mono font-black text-violet-200">
                    {pct === null ? '—' : `${pct}%`}
                    <span className="text-[10px] text-slate-400 font-normal"> ({s.quizCorrect}/{s.quizAnswered})</span>
                  </div>
                )}
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Lessons done</span>
                  <span>
                    {s.chaptersDone}/{s.chaptersTotal}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${done}%` }} />
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {s.skills.map((k) => (
                  <span
                    key={k.id}
                    title={`${LEVEL_LABEL[k.level]}: ${LEVEL_DESCRIPTOR[k.level]}`}
                    className={`px-1.5 py-0.5 rounded-md border text-[10px] font-semibold ${LEVEL_STYLE[k.level]}`}
                  >
                    {k.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!compact && Object.keys(profile.observations).length > 0 && (
        <div className="p-3 rounded-xl bg-[#090D16] border border-violet-500/40 space-y-1.5">
          <div className="text-[11px] font-bold uppercase text-violet-300">Teacher / parent observations</div>
          {Object.entries(profile.observations).map(([chapterId, o]) => (
            <div key={chapterId} className="text-xs text-slate-200 flex flex-wrap gap-x-2">
              <span className={`px-1.5 rounded-md border text-[10px] font-semibold ${LEVEL_STYLE[o.level]}`}>{LEVEL_LABEL[o.level]}</span>
              <span className="font-semibold">{CURRICULUM_DATA.find((c) => c.id === chapterId)?.title ?? chapterId}</span>
              {o.note && <span className="text-slate-400">— {o.note}</span>}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 text-[10px]">
        {(Object.keys(LEVEL_LABEL) as SkillLevel[]).map((l) => (
          <span key={l} className={`px-1.5 py-0.5 rounded-md border ${LEVEL_STYLE[l]}`}>
            {LEVEL_LABEL[l]} — {LEVEL_DESCRIPTOR[l]}
          </span>
        ))}
      </div>
    </div>
  );
};
