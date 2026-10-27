import React, { useMemo, useState } from 'react';
import { BankQuestion, drawQuestions } from '../questionBank';
import { CLASS1_BOARD_MAP } from '../boardMap';
import { SKILL_BY_ID } from '../skills';
import { dueSkillIds, progress, today, useActiveProfile } from '../progressStore';
import { speakText } from '../../utils/speech';
import { playPop, playSuccessChime, playFanfare } from '../../utils/soundEffects';

type PracticeKind = 'lesson' | 'review';
const ROUND_SIZE = 6;

/** Skills to review today: due ones first, then shaky ones, then skills from finished lessons. */
const reviewSkills = (profile: ReturnType<typeof useActiveProfile>) => {
  const due = dueSkillIds(profile);
  const shaky = Object.entries(profile.skills)
    .filter(([, r]) => r.attempts > 0 && r.correct / r.attempts < 0.7)
    .map(([id]) => id);
  const fromDone = profile.completedChapterIds.flatMap((id) => CLASS1_BOARD_MAP[id]?.skills ?? []);
  return [...new Set([...due, ...shaky, ...fromDone])];
};

const buildRound = (skills: string[]): BankQuestion[] => {
  if (skills.length === 0) return [];
  const per = Math.max(1, Math.ceil(ROUND_SIZE / skills.length));
  const pool = skills.flatMap((s) => drawQuestions(s, per));
  return pool.sort(() => Math.random() - 0.5).slice(0, ROUND_SIZE);
};

/**
 * A short practice round. Only the first tap on each question counts toward the child's
 * skill record; a wrong first tap shows the right answer and a kind explanation.
 */
export const PracticeSession: React.FC<{ chapterId: string }> = ({ chapterId }) => {
  const profile = useActiveProfile();
  const [kind, setKind] = useState<PracticeKind>('lesson');
  const [roundKey, setRoundKey] = useState(0);
  const lessonSkills = CLASS1_BOARD_MAP[chapterId]?.skills ?? [];
  const reviewList = useMemo(() => reviewSkills(profile), [profile]);
  const skills = kind === 'lesson' ? lessonSkills : reviewList;

  // A new round is drawn only when the child starts one, not on every progress update.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const round = useMemo(() => buildRound(skills), [kind, roundKey, chapterId]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const restart = (next: PracticeKind) => {
    setKind(next);
    setRoundKey((k) => k + 1);
    setIdx(0);
    setPicked(null);
    setScore(0);
  };

  const q = round[idx];
  const finished = round.length > 0 && idx >= round.length;

  const choose = (i: number) => {
    if (!q || picked !== null) return;
    setPicked(i);
    const ok = i === q.answer;
    progress.recordSkillResult(q.skillId, ok, chapterId);
    if (ok) {
      setScore((s) => s + 1);
      playSuccessChime();
      speakText('Correct!');
    } else {
      playPop();
      speakText(q.explain);
    }
  };

  const next = () => {
    setPicked(null);
    const n = idx + 1;
    setIdx(n);
    if (n >= round.length) {
      playFanfare();
      if (score >= Math.ceil(round.length / 2)) progress.awardStar(`practice:${kind}:${chapterId}:${today()}`);
    }
  };

  return (
    <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-extrabold text-white">⭐ Practice</h3>
          <p className="text-xs text-slate-400">
            {kind === 'lesson'
              ? `Questions on: ${lessonSkills.map((s) => SKILL_BY_ID[s]?.label).join(', ')}`
              : 'Today’s review mixes skills that are due, skills that need more practice, and finished lessons.'}
          </p>
        </div>
        <div className="flex gap-1.5">
          {(['lesson', 'review'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => restart(k)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold border ${
                kind === k ? 'bg-cyan-500 text-slate-950 border-white' : 'bg-[#090D16] text-slate-300 border-slate-700'
              }`}
            >
              {k === 'lesson' ? 'This lesson' : `Daily review${reviewList.length ? ` (${reviewList.length})` : ''}`}
            </button>
          ))}
        </div>
      </div>

      {round.length === 0 && (
        <p className="p-4 rounded-xl bg-[#090D16] border border-slate-800 text-sm text-slate-300">
          {kind === 'review'
            ? 'Nothing to review yet. Finish a lesson or practise this lesson first!'
            : 'Practice questions for this lesson are coming soon.'}
        </p>
      )}

      {q && !finished && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Question {idx + 1} of {round.length}
            </span>
            <span className="font-mono">⭐ {score}</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#090D16] border border-cyan-500/40 flex items-start justify-between gap-3">
            <p className="text-lg sm:text-xl font-bold text-white leading-relaxed break-words">{q.prompt}</p>
            <button
              type="button"
              onClick={() => speakText(q.prompt, { force: true })}
              className="shrink-0 px-3 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-sm font-bold"
              aria-label="Read the question aloud"
            >
              🔊
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {q.options.map((opt, i) => {
              const state =
                picked === null
                  ? 'bg-[#111827] border-slate-700 text-white hover:border-cyan-400'
                  : i === q.answer
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100'
                  : i === picked
                  ? 'bg-rose-500/20 border-rose-400 text-rose-100'
                  : 'bg-[#111827]/50 border-slate-800 text-slate-500';
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => choose(i)}
                  className={`min-h-[56px] px-4 py-3 rounded-2xl border-2 text-lg font-extrabold text-left transition-all ${state}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#090D16] border border-slate-800">
              <p className="text-sm text-slate-200">
                <strong className={picked === q.answer ? 'text-emerald-300' : 'text-amber-300'}>
                  {picked === q.answer ? '🎉 Correct! ' : '💡 Let’s learn: '}
                </strong>
                {q.explain}
              </p>
              <button
                type="button"
                onClick={next}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-sm font-extrabold"
              >
                {idx + 1 < round.length ? 'Next →' : 'Finish'}
              </button>
            </div>
          )}
        </div>
      )}

      {finished && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-400/50 text-center space-y-3">
          <div className="text-3xl">{score === round.length ? '🏆' : score >= round.length / 2 ? '🌟' : '💪'}</div>
          <p className="text-lg font-extrabold text-white">
            {score} out of {round.length} right!
          </p>
          <p className="text-sm text-slate-300">
            {score === round.length
              ? 'Perfect round!'
              : score >= round.length / 2
              ? 'Well done — keep practising to make it perfect.'
              : 'Good effort! Play the lesson again, then try another round.'}
          </p>
          <button
            type="button"
            onClick={() => restart(kind)}
            className="px-4 py-2.5 rounded-xl bg-emerald-400 text-slate-950 text-sm font-extrabold"
          >
            Play another round
          </button>
        </div>
      )}
    </div>
  );
};
