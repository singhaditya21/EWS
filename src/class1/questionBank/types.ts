// A single practice question. Each question tests exactly one skill (see ../skills.ts).
export interface BankQuestion {
  id: string;
  skillId: string;
  prompt: string;
  options: string[];
  /** Index into options of the correct answer. */
  answer: number;
  /** Short, kind explanation shown after the first attempt. */
  explain: string;
}

/** Math questions are generated fresh each time so practice never repeats the same sums. */
export type QuestionGenerator = (seed: number) => BankQuestion;
