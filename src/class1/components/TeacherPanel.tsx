import React, { useState } from 'react';
import { CurriculumChapter, SchoolBoard } from '../../types/curriculum.types';
import { CLASS1_LESSON_PLANS } from '../lessonPlans';
import { BOARD_STATUS_LABEL, CLASS1_BOARD_MAP } from '../boardMap';
import { SKILL_BY_ID } from '../skills';
import { ObservationLevel, progress, useActiveProfile } from '../progressStore';
import { LEVEL_DESCRIPTOR, LEVEL_LABEL } from '../progressModel';
import { printWorksheet } from '../worksheet';
import { usePlan } from '../../platform/entitlements';
import { UpgradeNotice } from '../../platform/components/UpgradeNotice';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="p-3.5 rounded-xl bg-[#090D16] border border-slate-800 space-y-1.5">
    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">{title}</div>
    <div className="text-sm text-slate-200 leading-relaxed">{children}</div>
  </div>
);

export const TeacherPanel: React.FC<{
  chapter: CurriculumChapter;
  board: SchoolBoard;
  onProjector: () => void;
}> = ({ chapter, board, onProjector }) => {
  const plan = CLASS1_LESSON_PLANS[chapter.id];
  const meta = CLASS1_BOARD_MAP[chapter.id];
  const profile = useActiveProfile();
  const { limits } = usePlan();
  const icseSheets = limits.worksheetBoards.includes('ICSE');
  const saved = profile.observations[chapter.id];
  const [note, setNote] = useState(saved?.note ?? '');

  return (
    <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-white">🏫 Teacher lesson plan</h3>
          <p className="text-xs text-slate-400">
            {board} • {meta ? BOARD_STATUS_LABEL[meta[board].status] : ''} •{' '}
            {chapter.syllabusAlignment[board === 'CBSE' ? 'cbseChapter' : 'icseChapter']}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {limits.teacherTools && (
            <button
              type="button"
              onClick={onProjector}
              className="px-3 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-extrabold"
            >
              📽️ Projector mode
            </button>
          )}
          <button
            type="button"
            onClick={() => printWorksheet('CBSE', chapter)}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold border ${
              board === 'CBSE' ? 'bg-amber-400 text-slate-950 border-white' : 'bg-[#090D16] text-slate-300 border-slate-700'
            }`}
          >
            🖨️ CBSE activity sheet
          </button>
          <button
            type="button"
            disabled={!icseSheets}
            title={icseSheets ? undefined : 'ICSE tests are part of paid plans'}
            onClick={() => printWorksheet('ICSE', chapter)}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold border ${
              board === 'ICSE' ? 'bg-amber-400 text-slate-950 border-white' : 'bg-[#090D16] text-slate-300 border-slate-700'
            }`}
          >
            {icseSheets ? '' : '🔒 '}🖨️ ICSE practice test + key
          </button>
        </div>
      </div>
      {!limits.teacherTools && (
        <UpgradeNotice feature="Projector mode, observations and class tools" plan="classroom" compact />
      )}

      {plan ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <Section title="Learning objectives">
            <ul className="list-disc pl-4 space-y-0.5">
              {plan.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </Section>
          <Section title="Materials">{plan.materials.join(' • ')}</Section>
          <Section title="Warm-up (5 min)">{plan.warmUp}</Section>
          <Section title="Main activity (15–20 min)">{plan.activity}</Section>
          <Section title="Check understanding (2–3 min)">{plan.check}</Section>
          <Section title="Extra support">{plan.support}</Section>
        </div>
      ) : (
        <p className="text-sm text-slate-300">No lesson plan for this chapter yet.</p>
      )}

      {limits.teacherTools && (
      <div className="p-3.5 rounded-xl bg-[#090D16] border border-violet-500/40 space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-violet-300">
          Observation for {profile.name} (goes into the progress report)
        </div>
        <p className="text-xs text-slate-400">
          Skills: {meta?.skills.map((s) => SKILL_BY_ID[s]?.label).join(', ')}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(['beginning', 'developing', 'proficient'] as ObservationLevel[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => progress.setObservation(chapter.id, lvl, note)}
              title={LEVEL_DESCRIPTOR[lvl]}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold border ${
                saved?.level === lvl ? 'bg-violet-500 text-white border-white' : 'bg-[#111827] text-slate-300 border-slate-700'
              }`}
            >
              {LEVEL_LABEL[lvl]}
            </button>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => saved && progress.setObservation(chapter.id, saved.level, note)}
          placeholder="Optional note, e.g. ‘counts to 20 confidently, mixes up 6 and 9’"
          className="w-full min-h-[60px] p-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-slate-100"
        />
        {saved && (
          <p className="text-[11px] text-slate-400">
            Saved {new Date(saved.at).toLocaleDateString()} — {LEVEL_LABEL[saved.level]}
          </p>
        )}
      </div>
      )}
    </div>
  );
};
