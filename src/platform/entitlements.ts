// What the current viewer is allowed to use.
import { PlanId, PLANS, PlanLimits } from './plans';
import { cloudConfigured } from './config';
import { useSession } from './session';
import { useStudentSession } from './student';

/**
 * Until paid plans are switched on (no backend configured), nothing that works today is taken
 * away: the device-only features stay unlocked. Only server-delivered packs need a real plan.
 */
const PRE_LAUNCH_LIMITS: PlanLimits = {
  ...PLANS.family_plus.limits,
  cloudSync: false,
  weeklySummary: false,
  icseTestPacks: false,
  olympiadPacks: 'sample',
  audioPacks: false,
  teacherTools: true,
  maxClasses: 0,
  maxStudentsPerClass: 0,
};

/**
 * Plan in effect right now. A child signed in at school gets the class's practice allowances;
 * on a device with no account (or no backend), everyone is on Free.
 */
export const usePlan = (): { plan: PlanId; limits: PlanLimits; signedIn: boolean; student: boolean } => {
  const session = useSession();
  const student = useStudentSession();
  const plan: PlanId = student ? 'classroom' : session.status === 'signed-in' ? session.plan : 'free';
  const limits = cloudConfigured ? PLANS[plan].limits : PRE_LAUNCH_LIMITS;
  return { plan, limits, signedIn: session.status === 'signed-in', student: Boolean(student) };
};

export const planAtLeast = (plan: PlanId, needed: PlanId) => {
  const rank: Record<PlanId, number> = { free: 0, family: 1, family_plus: 2, classroom: 3, school: 4 };
  return rank[plan] >= rank[needed];
};
