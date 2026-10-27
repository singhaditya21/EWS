// Board overlays for the shared Class 1 core.
// The 34 chapters are shared; this map says, for each board, whether a chapter is part of
// that board's Class 1 syllabus, where it sits in that board's order, and which skills it teaches.
import { SchoolBoard } from '../types/curriculum.types';

/**
 * core        – taught in this board's Class 1 syllabus / textbook.
 * integrated  – no separate textbook chapter; the theme is met inside another subject's book.
 * extension   – goes a little beyond this board's Class 1 syllabus.
 * enrichment  – not part of this board's Class 1 syllabus at all (optional practice).
 */
export type BoardStatus = 'core' | 'integrated' | 'extension' | 'enrichment';

export interface BoardPlacement {
  status: BoardStatus;
  /** Position within the subject for this board (1 = first). */
  order: number;
}

export interface Class1ChapterMeta {
  skills: string[];
  CBSE: BoardPlacement;
  ICSE: BoardPlacement;
  /** Teacher sign-off. Everything starts as pending until a practising Class 1 teacher reviews it. */
  review: { status: 'pending' | 'reviewed'; reviewer?: string; date?: string };
}

export const BOARD_STATUS_LABEL: Record<BoardStatus, string> = {
  core: 'Core',
  integrated: 'Integrated theme',
  extension: 'Extension',
  enrichment: 'Enrichment',
};

const pending = { status: 'pending' as const };
const meta = (
  skills: string[],
  cbse: [BoardStatus, number],
  icse: [BoardStatus, number]
): Class1ChapterMeta => ({
  skills,
  CBSE: { status: cbse[0], order: cbse[1] },
  ICSE: { status: icse[0], order: icse[1] },
  review: pending,
});

// CBSE order follows NCERT Joyful Mathematics 1 / Mridang 1 / Sarangi 1 chapter order.
// ICSE order follows a typical ICSE-school Class 1 term plan (schools choose their own books).
export const CLASS1_BOARD_MAP: Record<string, Class1ChapterMeta> = {
  // Mathematics
  'cls1-math-spatial-furry-cat': meta(['m.position'], ['core', 1], ['core', 1]),
  'cls1-math-shapes-roll-slide': meta(['m.shapes', 'm.patterns'], ['core', 2], ['core', 7]),
  'cls1-math-numbers-comparison': meta(['m.count20', 'm.compare', 'm.make10'], ['core', 3], ['core', 2]),
  'cls1-math-add-sub-frog': meta(['m.add20', 'm.sub20'], ['core', 4], ['core', 4]),
  'cls1-math-measurement-balance': meta(['m.measure'], ['core', 5], ['core', 9]),
  'cls1-math-abacus': meta(['m.placevalue', 'm.skipcount'], ['core', 6], ['core', 5]),
  'cls1-math-patterns-pictograph': meta(['m.patterns', 'm.data'], ['core', 7], ['core', 8]),
  'cls1-math-clock-money': meta(['m.time', 'm.money'], ['core', 8], ['core', 10]),
  'cls1-math-ordinals-groups-data': meta(['m.groups', 'm.ordinal', 'm.data'], ['core', 9], ['core', 11]),
  'cls1-math-word-problems-tables': meta(['m.wordproblem', 'm.tables'], ['extension', 10], ['core', 12]),
  'cls1-math-vertical-staircase': meta(['m.order', 'm.evenodd'], ['extension', 11], ['core', 6]),
  'cls1-math-ordinals-fractions': meta(['m.ordinal', 'm.order', 'm.halves'], ['extension', 12], ['core', 3]),

  // English — Mridang 1 builds listening and reading through stories and poems; formal grammar
  // terms (nouns, pronouns, adjectives) are typical of ICSE-school grammar books, not Mridang.
  'cls1-eng-mridang-stories': meta(['e.listening'], ['core', 1], ['core', 6]),
  'cls1-eng-phonics-vowels': meta(['e.letters', 'e.cvc', 'e.article'], ['core', 2], ['core', 1]),
  'cls1-eng-nouns-this-that': meta(['e.nouns', 'e.thisthat'], ['extension', 3], ['core', 2]),
  'cls1-eng-grammar-opposites': meta(['e.opposites', 'e.verbs', 'e.plurals'], ['extension', 4], ['core', 3]),
  'cls1-eng-pronouns-adjectives': meta(['e.pronouns', 'e.adjectives'], ['extension', 5], ['core', 4]),
  'cls1-eng-digraphs-sentences': meta(['e.digraphs', 'e.sentences'], ['extension', 6], ['core', 5]),

  // Hindi
  'cls1-hindi-varnamala': meta(['h.swar', 'h.vyanjan', 'h.ginti'], ['core', 1], ['core', 1]),
  'cls1-hindi-shabd-train': meta(['h.shabd'], ['core', 2], ['core', 2]),
  'cls1-hindi-barahkhadi-vyakaran': meta(['h.matra', 'h.vilom', 'h.vachan'], ['core', 3], ['core', 3]),

  // EVS — CBSE has no Class 1 EVS textbook; these themes appear inside Mridang and school activities.
  'cls1-evs-body-senses': meta(['v.body', 'v.hygiene'], ['integrated', 1], ['core', 1]),
  'cls1-evs-plants-living': meta(['v.living', 'v.plants'], ['integrated', 2], ['core', 5]),
  'cls1-evs-animals-food-safety': meta(['v.animals', 'v.food', 'v.safety'], ['integrated', 3], ['core', 6]),
  'cls1-evs-houses-food': meta(['v.houses', 'v.food'], ['integrated', 4], ['core', 3]),
  'cls1-evs-seasons-sky': meta(['v.seasons', 'v.sky'], ['integrated', 5], ['core', 8]),
  'cls1-evs-clothes-places-games': meta(['v.seasons', 'v.neighbourhood', 'v.games'], ['integrated', 6], ['core', 4]),
  'cls1-evs-water-air-habits': meta(['v.waterair', 'v.hygiene'], ['integrated', 7], ['core', 2]),
  'cls1-evs-helpers-transport': meta(['v.helpers', 'v.transport'], ['integrated', 8], ['core', 7]),
  'cls1-evs-india-manners': meta(['v.india', 'v.manners'], ['integrated', 9], ['core', 9]),

  // Computer Studies — taught as a subject in ICSE schools; not prescribed by NCERT for Class 1.
  'cls1-comp-smart-machine': meta(['c.machines', 'c.parts'], ['enrichment', 1], ['core', 1]),
  'cls1-comp-paint-manners': meta(['c.paint', 'c.labsafety'], ['enrichment', 2], ['core', 2]),

  // Arts, music & logic
  'cls1-arts-colors-music': meta(['a.colours', 'a.music'], ['core', 1], ['core', 1]),
  'cls1-olympiad-reasoning-gym': meta(['a.reasoning'], ['enrichment', 2], ['enrichment', 2]),
};

export const placementFor = (chapterId: string, board: SchoolBoard) => CLASS1_BOARD_MAP[chapterId]?.[board];

const SUBJECT_ORDER = ['m.', 'e.', 'h.', 'v.', 'c.', 'a.'];
const subjectRank = (chapterId: string) => {
  const first = CLASS1_BOARD_MAP[chapterId]?.skills[0] ?? '';
  const i = SUBJECT_ORDER.findIndex((p) => first.startsWith(p));
  return i < 0 ? SUBJECT_ORDER.length : i;
};

/**
 * Orders chapters for a board: Class 1 chapters by subject, then by that board's sequence.
 * Chapters outside Class 1 keep their original relative order (the sort is stable).
 */
export const sortForBoard = <T extends { id: string; classLevel?: number }>(chapters: T[], board: SchoolBoard): T[] =>
  [...chapters].sort((a, b) => {
    if (a.classLevel !== 1 || b.classLevel !== 1) return 0;
    return (
      subjectRank(a.id) - subjectRank(b.id) ||
      (CLASS1_BOARD_MAP[a.id]?.[board].order ?? 0) - (CLASS1_BOARD_MAP[b.id]?.[board].order ?? 0)
    );
  });

const SUBJECT_SHORT: Record<string, string> = { 'm.': 'Math', 'e.': 'English', 'h.': 'Hindi', 'v.': 'EVS', 'c.': 'Computer', 'a.': 'Arts' };

/** "Class 1 • Math 3" — the chapter's position in the active board's sequence. */
export const class1Label = (chapterId: string, board: SchoolBoard) => {
  const m = CLASS1_BOARD_MAP[chapterId];
  if (!m) return null;
  const prefix = Object.keys(SUBJECT_SHORT).find((p) => m.skills[0]?.startsWith(p)) ?? '';
  return `Class 1 • ${SUBJECT_SHORT[prefix] ?? ''} ${m[board].order}`;
};

export const STATUS_BADGE_STYLE: Record<BoardStatus, string> = {
  core: 'bg-cyan-500/15 text-cyan-200 border-cyan-500/40',
  integrated: 'bg-teal-500/15 text-teal-200 border-teal-500/40',
  extension: 'bg-amber-500/15 text-amber-200 border-amber-500/40',
  enrichment: 'bg-slate-700/40 text-slate-300 border-slate-600',
};
