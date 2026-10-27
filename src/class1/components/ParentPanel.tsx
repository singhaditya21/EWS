import React from 'react';
import { CurriculumChapter, SchoolBoard } from '../../types/curriculum.types';
import { CLASS1_LESSON_PLANS } from '../lessonPlans';
import { useActiveProfile } from '../progressStore';
import { skillLevel } from '../progressModel';
import { SKILL_BY_ID } from '../skills';
import { sortForBoard, placementFor } from '../boardMap';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** "What did my child do this week" plus a home activity for the current lesson. */
export const ParentPanel: React.FC<{
  chapter: CurriculumChapter;
  chapters: CurriculumChapter[];
  board: SchoolBoard;
  onSelectChapter?: (c: CurriculumChapter) => void;
}> = ({ chapter, chapters, board, onSelectChapter }) => {
  const profile = useActiveProfile();
  const since = Date.now() - WEEK_MS;
  const week = profile.activity.filter((a) => new Date(a.at).getTime() >= since);
  const answers = week.filter((a) => a.kind === 'quiz' || a.kind === 'practice');
  const right = answers.filter((a) => a.correct).length;
  const stars = week.filter((a) => a.kind === 'star').length;
  const finished = week.filter((a) => a.kind === 'complete').length;

  const levels = Object.entries(profile.skills).map(([id, rec]) => ({ id, level: skillLevel(rec) }));
  const strong = levels.filter((l) => l.level === 'proficient').map((l) => SKILL_BY_ID[l.id]?.label).filter(Boolean);
  const needsHelp = levels.filter((l) => l.level === 'beginning').map((l) => SKILL_BY_ID[l.id]?.label).filter(Boolean);

  const nextLesson = sortForBoard(
    chapters.filter((c) => c.classLevel === 1 && placementFor(c.id, board)?.status !== 'enrichment'),
    board
  ).find((c) => !profile.completedChapterIds.includes(c.id) && c.id !== chapter.id);
  const plan = CLASS1_LESSON_PLANS[chapter.id];

  const stat = (label: string, value: string) => (
    <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 text-center">
      <div className="text-xl font-black text-white">{value}</div>
      <div className="text-[11px] text-slate-400">{label}</div>
    </div>
  );

  return (
    <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-4 sm:p-5 space-y-4">
      <div>
        <h3 className="text-base font-extrabold text-white">👨‍👩‍👧 {profile.name}’s week</h3>
        <p className="text-xs text-slate-400">Last 7 days on this device.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stat('questions answered', String(answers.length))}
        {stat('answered right', answers.length ? `${Math.round((right / answers.length) * 100)}%` : '—')}
        {stat('stars earned', String(stars))}
        {stat('lessons finished', String(finished))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-sm">
        <div className="p-3.5 rounded-xl bg-[#090D16] border border-emerald-500/40">
          <div className="text-[11px] font-bold uppercase text-emerald-300 mb-1">Going well</div>
          <p className="text-slate-200">{strong.length ? strong.join(', ') : 'Keep practising — strengths will show up here.'}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-[#090D16] border border-amber-500/40">
          <div className="text-[11px] font-bold uppercase text-amber-300 mb-1">Could use your help</div>
          <p className="text-slate-200">{needsHelp.length ? needsHelp.join(', ') : 'Nothing worrying yet.'}</p>
        </div>
      </div>

      {plan && (
        <div className="p-3.5 rounded-xl bg-[#090D16] border border-cyan-500/40 space-y-1">
          <div className="text-[11px] font-bold uppercase text-cyan-300">🏠 10-minute home activity: {chapter.title}</div>
          <p className="text-sm text-slate-200 leading-relaxed">{plan.homeActivity}</p>
        </div>
      )}

      {nextLesson && onSelectChapter && (
        <button
          type="button"
          onClick={() => onSelectChapter(nextLesson)}
          className="w-full p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-left text-sm text-cyan-100 font-bold"
        >
          Suggested next lesson ({board}): {nextLesson.title} →
        </button>
      )}
    </div>
  );
};
