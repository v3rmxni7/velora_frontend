"use client";

import { useState } from "react";
import { CopilotChat } from "./copilot-chat";
import { ThreadList } from "./thread-list";

// Full-screen two-pane copilot: thread list (left) + the shared chat (right). "New chat" clears the
// selection → the chat shows its empty/suggested state; the first send lazily creates + selects the
// thread. The React Query cache here is the same one the C2 drawer reads, so they stay in sync.
export function CopilotView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <div className="w-72 shrink-0">
        <ThreadList
          selectedId={selectedId}
          onSelect={setSelectedId}
          onNew={() => setSelectedId(null)}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-border bg-card">
        <CopilotChat threadId={selectedId} onSelectThread={setSelectedId} />
      </div>
    </div>
  );
}
