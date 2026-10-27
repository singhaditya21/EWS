import React from 'react';
import { openPage } from '../nav';
import { PLANS, PlanId } from '../plans';

/** Small, calm upsell shown where a paid feature would be. Never shown as a pop-up to a child. */
export const UpgradeNotice: React.FC<{ feature: string; plan: PlanId; compact?: boolean }> = ({ feature, plan, compact }) => (
  <div
    className={`rounded-xl border border-violet-500/40 bg-violet-950/30 text-violet-100 ${
      compact ? 'px-3 py-2 text-xs' : 'p-4 text-sm'
    } flex flex-wrap items-center justify-between gap-2`}
  >
    <span>
      🔒 {feature} is part of <strong>{PLANS[plan].name}</strong>.
    </span>
    <button
      type="button"
      onClick={() => openPage('plans')}
      className="px-3 py-1.5 rounded-lg bg-violet-500 text-white text-xs font-extrabold"
    >
      See plans
    </button>
  </div>
);
