import React from 'react';
import { LegalSection, POLICY_VERSION, PRIVACY_POLICY, TERMS_OF_SERVICE } from '../legal';
import { Card, PageShell } from './PageShell';

export const LegalPage: React.FC<{ kind: 'privacy' | 'terms' }> = ({ kind }) => {
  const sections: LegalSection[] = kind === 'privacy' ? PRIVACY_POLICY : TERMS_OF_SERVICE;
  return (
    <PageShell title={kind === 'privacy' ? 'Privacy Policy' : 'Terms of Service'} subtitle={`Version ${POLICY_VERSION}`}>
      <Card className="max-w-3xl">
        {sections.map((s) => (
          <section key={s.heading} className="space-y-1.5">
            <h2 className="text-base font-extrabold text-white">{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p} className="text-sm text-slate-200 leading-relaxed">
                {p}
              </p>
            ))}
          </section>
        ))}
      </Card>
    </PageShell>
  );
};
