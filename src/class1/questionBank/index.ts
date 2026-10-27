import { BankQuestion } from './types';
import { MATH_GENERATORS } from './math';
import { ENGLISH_QUESTIONS } from './english';
import { HINDI_QUESTIONS } from './hindi';
import { EVS_QUESTIONS } from './evs';
import { COMPUTER_QUESTIONS } from './computer';
import { ARTS_QUESTIONS } from './arts';

export type { BankQuestion } from './types';
export { MATH_GENERATORS } from './math';

export const CURATED_QUESTIONS: BankQuestion[] = [
  ...ENGLISH_QUESTIONS,
  ...HINDI_QUESTIONS,
  ...EVS_QUESTIONS,
  ...COMPUTER_QUESTIONS,
  ...ARTS_QUESTIONS,
];

const shuffled = <T,>(xs: T[]) => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Draws `count` questions for a skill: generated for math, shuffled from the bank otherwise. */
export const drawQuestions = (skillId: string, count: number): BankQuestion[] => {
  const gen = MATH_GENERATORS[skillId];
  if (gen) {
    const base = Math.floor(Math.random() * 1e9);
    const out: BankQuestion[] = [];
    const seen = new Set<string>();
    for (let i = 0; out.length < count && i < count * 6; i++) {
      const next = gen(base + i);
      if (seen.has(next.prompt)) continue;
      seen.add(next.prompt);
      out.push(next);
    }
    return out;
  }
  return shuffled(CURATED_QUESTIONS.filter((x) => x.skillId === skillId))
    .slice(0, count)
    .map((q) => {
      // Shuffle option order too, so the right answer isn't remembered by position.
      const order = shuffled(q.options.map((_, i) => i));
      return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
    });
};

export const questionCountForSkill = (skillId: string) =>
  MATH_GENERATORS[skillId] ? Infinity : CURATED_QUESTIONS.filter((x) => x.skillId === skillId).length;
