"use client";

import { CoachingSection } from "./coaching-section";
import { KbSection } from "./kb-section";
import { ProofSection } from "./proof-section";

// The agent's knowledge base — coaching + proof + sources. This is the real data that feeds the
// anti-hallucination grounding engine, so every edit here changes what the agent can say.
export function ManageKnowledge() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <CoachingSection />
      <ProofSection />
      <KbSection />
    </div>
  );
}
