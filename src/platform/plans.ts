// Freemium plans. The free tier keeps every Class 1 chapter, lab and chapter quiz open to
// every child; paid tiers add convenience (sync, more children), depth (packs) and insight
// (reports, teacher tools). Prices are in rupees and include 18% GST.

export type PlanId = 'free' | 'family' | 'family_plus' | 'classroom' | 'school';
export type BillingPeriod = 'monthly' | 'yearly';

export interface PlanLimits {
  /** Child profiles a parent can keep (teachers use class rosters instead). */
  maxChildren: number;
  /** Progress synced to the account and across devices. */
  cloudSync: boolean;
  /** Practice rounds per child per day; Infinity = unlimited. */
  practiceRoundsPerDay: number;
  reports: 'basic' | 'full' | 'full_with_advice';
  weeklySummary: boolean;
  worksheetBoards: ('CBSE' | 'ICSE')[];
  /** Server-delivered extra content. */
  icseTestPacks: boolean;
  olympiadPacks: 'sample' | 'full';
  audioPacks: boolean;
  teacherTools: boolean;
  maxClasses: number;
  maxStudentsPerClass: number;
}

export interface PlanInfo {
  id: PlanId;
  name: string;
  audience: string;
  /** Rupees incl. GST. null = free or quoted. */
  price: { monthly: number | null; yearly: number | null; unit?: string };
  limits: PlanLimits;
  highlights: string[];
}

const UNLIMITED = Number.POSITIVE_INFINITY;

const FREE_LIMITS: PlanLimits = {
  maxChildren: 1,
  cloudSync: false,
  practiceRoundsPerDay: 3,
  reports: 'basic',
  weeklySummary: false,
  worksheetBoards: ['CBSE'],
  icseTestPacks: false,
  olympiadPacks: 'sample',
  audioPacks: false,
  teacherTools: false,
  maxClasses: 0,
  maxStudentsPerClass: 0,
};

export const PLANS: Record<PlanId, PlanInfo> = {
  free: {
    id: 'free',
    name: 'Free',
    audience: 'Every child',
    price: { monthly: 0, yearly: 0 },
    limits: FREE_LIMITS,
    highlights: [
      'All 34 Class 1 chapters, labs and quizzes',
      '1 child, progress saved on this device',
      '3 practice rounds a day',
      'Basic progress report',
      'CBSE activity sheets',
    ],
  },
  family: {
    id: 'family',
    name: 'Family',
    audience: 'Parents',
    price: { monthly: 99, yearly: 799 },
    limits: {
      ...FREE_LIMITS,
      maxChildren: 3,
      cloudSync: true,
      practiceRoundsPerDay: UNLIMITED,
      reports: 'full',
      weeklySummary: true,
      worksheetBoards: ['CBSE', 'ICSE'],
    },
    highlights: [
      'Up to 3 children, synced across phones and tablets',
      'Unlimited practice and daily review',
      'Full report + weekly email summary',
      'CBSE and ICSE worksheets',
    ],
  },
  family_plus: {
    id: 'family_plus',
    name: 'Family Plus',
    audience: 'Parents who want more',
    price: { monthly: 199, yearly: 1499 },
    limits: {
      ...FREE_LIMITS,
      maxChildren: 5,
      cloudSync: true,
      practiceRoundsPerDay: UNLIMITED,
      reports: 'full_with_advice',
      weeklySummary: true,
      worksheetBoards: ['CBSE', 'ICSE'],
      icseTestPacks: true,
      olympiadPacks: 'full',
      audioPacks: true,
    },
    highlights: [
      'Everything in Family, up to 5 children',
      'Skill-by-skill advice in reports',
      'ICSE test packs and Olympiad packs',
      'Recorded Hindi and mother-tongue audio packs (as they are released)',
    ],
  },
  classroom: {
    id: 'classroom',
    name: 'Classroom',
    audience: 'Teachers',
    price: { monthly: 249, yearly: 1999, unit: 'per teacher' },
    limits: {
      ...FREE_LIMITS,
      maxChildren: 1,
      cloudSync: true,
      practiceRoundsPerDay: UNLIMITED,
      reports: 'full_with_advice',
      weeklySummary: false,
      worksheetBoards: ['CBSE', 'ICSE'],
      icseTestPacks: true,
      olympiadPacks: 'full',
      audioPacks: true,
      teacherTools: true,
      maxClasses: 5,
      maxStudentsPerClass: 45,
    },
    highlights: [
      'Up to 5 classes of 45 children',
      'Class codes and picture passwords — no child accounts',
      'Assign lessons, record observations, class reports',
      'Holistic Progress Card export, worksheets with answer keys',
    ],
  },
  school: {
    id: 'school',
    name: 'School',
    audience: 'Whole schools',
    price: { monthly: null, yearly: 300, unit: 'per student / year' },
    limits: {
      ...FREE_LIMITS,
      maxChildren: 1,
      cloudSync: true,
      practiceRoundsPerDay: UNLIMITED,
      reports: 'full_with_advice',
      worksheetBoards: ['CBSE', 'ICSE'],
      icseTestPacks: true,
      olympiadPacks: 'full',
      audioPacks: true,
      teacherTools: true,
      maxClasses: UNLIMITED,
      maxStudentsPerClass: 60,
    },
    highlights: [
      'Classroom for every teacher in the school',
      'School admin: teachers, seats and invoices',
      'GST invoice to the school',
      'Data processing agreement for the school',
    ],
  },
};

/** Order used to pick the best plan when a user has several (own + school). */
export const PLAN_RANK: PlanId[] = ['free', 'family', 'family_plus', 'classroom', 'school'];

export const limitsFor = (plan: PlanId) => PLANS[plan].limits;

export const formatPrice = (rupees: number | null) =>
  rupees === null ? 'Quote' : rupees === 0 ? '₹0' : `₹${rupees.toLocaleString('en-IN')}`;
