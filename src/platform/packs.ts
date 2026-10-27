// Paid practice packs. Their questions live on the server (premium_content) and are sent only
// to plans that include them, so they can't be read from the public app code.
import { BankQuestion, drawQuestions } from '../class1/questionBank';
import { CLASS1_BOARD_MAP } from '../class1/boardMap';
import { PlanId } from './plans';
import { getClient } from './supabase';

export interface PackInfo {
  key: string;
  title: string;
  minPlan: PlanId;
  /** Chapter the pack belongs to (shown on that chapter's Practice tab); none = shown everywhere. */
  chapterId?: string;
  /** Skill the answers count toward. */
  skillId: string;
}

export const PACKS: PackInfo[] = [
  { key: 'olympiad-pack:1', title: 'Olympiad pack 1 — logic and reasoning', minPlan: 'family_plus', skillId: 'a.reasoning' },
  {
    key: 'icse-test-pack:cls1-math-add-sub-frog',
    title: 'ICSE test pack — addition and subtraction',
    minPlan: 'family_plus',
    chapterId: 'cls1-math-add-sub-frog',
    skillId: 'm.add20',
  },
];

export const packsForChapter = (chapterId: string) => PACKS.filter((p) => !p.chapterId || p.chapterId === chapterId);

/** Free plans get a small sample round built from the open question bank. */
export const samplePack = (): BankQuestion[] => drawQuestions('a.reasoning', 3);

export const fetchPack = async (pack: PackInfo): Promise<BankQuestion[]> => {
  const client = await getClient();
  const { data, error } = await client.from('premium_content').select('payload').eq('key', pack.key).maybeSingle();
  if (error || !data) throw new Error('This pack isn’t available on your plan.');
  const qs = (data.payload as { questions?: Omit<BankQuestion, 'id' | 'skillId'>[] }).questions ?? [];
  const skillId = pack.skillId || CLASS1_BOARD_MAP[pack.chapterId ?? '']?.skills[0] || 'a.reasoning';
  return qs.map((q, i) => ({ ...q, id: `${pack.key}#${i}`, skillId }));
};
