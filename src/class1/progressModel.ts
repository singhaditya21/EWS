// Turns saved activity into the numbers parents and teachers see. Everything is derived
// from real attempts; nothing is shown as "done" unless the child actually did it.
import { SchoolBoard } from '../types/curriculum.types';
import { CLASS1_BOARD_MAP } from './boardMap';
import { CLASS1_SKILLS, Class1Subject, SKILL_BY_ID } from './skills';
import { ObservationLevel, ProfileData, SkillRecord } from './progressStore';

export type SkillLevel = 'not-started' | ObservationLevel;

export const LEVEL_LABEL: Record<SkillLevel, string> = {
  'not-started': 'Not started',
  beginning: 'Beginning',
  developing: 'Developing',
  proficient: 'Proficient',
};

export const LEVEL_DESCRIPTOR: Record<SkillLevel, string> = {
  'not-started': 'Has not tried this yet',
  beginning: 'Needs a grown-up’s help',
  developing: 'Can do it with a little help',
  proficient: 'Can do it on their own',
};

export const skillLevel = (rec: SkillRecord | undefined): SkillLevel => {
  if (!rec || rec.attempts === 0) return 'not-started';
  const acc = rec.correct / rec.attempts;
  if (rec.attempts >= 3 && acc >= 0.8 && rec.box >= 3) return 'proficient';
  if (acc >= 0.5) return 'developing';
  return 'beginning';
};

/** Chapters that count for a board's Class 1 report (enrichment is optional, so left out). */
export const boardChapterIds = (board: SchoolBoard) =>
  Object.entries(CLASS1_BOARD_MAP)
    .filter(([, m]) => m[board].status !== 'enrichment')
    .map(([id]) => id);

export const chapterSubject = (chapterId: string): Class1Subject | undefined => {
  const first = CLASS1_BOARD_MAP[chapterId]?.skills[0];
  return first ? SKILL_BY_ID[first]?.subject : undefined;
};

export interface SubjectSummary {
  subject: Class1Subject;
  chaptersTotal: number;
  chaptersDone: number;
  quizAnswered: number;
  quizCorrect: number;
  skills: { id: string; label: string; level: SkillLevel }[];
}

export const summarise = (profile: ProfileData, board: SchoolBoard): SubjectSummary[] => {
  const chapterIds = boardChapterIds(board);
  const subjects = [...new Set(CLASS1_SKILLS.map((s) => s.subject))];
  return subjects
    .map((subject) => {
      const chapters = chapterIds.filter((id) => chapterSubject(id) === subject);
      const skillIds = [...new Set(chapters.flatMap((id) => CLASS1_BOARD_MAP[id].skills))];
      const attempts = Object.values(profile.quizFirstAttempts).filter((a) => chapters.includes(a.chapterId));
      return {
        subject,
        chaptersTotal: chapters.length,
        chaptersDone: chapters.filter((id) => profile.completedChapterIds.includes(id)).length,
        quizAnswered: attempts.length,
        quizCorrect: attempts.filter((a) => a.correct).length,
        skills: skillIds.map((id) => ({ id, label: SKILL_BY_ID[id].label, level: skillLevel(profile.skills[id]) })),
      };
    })
    .filter((s) => s.chaptersTotal > 0);
};

/** ICSE-style percentage from first-attempt quiz answers; null until something is answered. */
export const percent = (correct: number, answered: number) =>
  answered === 0 ? null : Math.round((correct / answered) * 100);
