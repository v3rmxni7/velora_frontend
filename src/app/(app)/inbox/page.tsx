import { Suspense } from "react";
import { InboxView } from "@/components/inbox/inbox-view";
import { Topbar } from "@/components/shell/topbar";

export default function InboxPage() {
  return (
    <>
      <Topbar title="Inbox" />
      {/* No overflow here — the two panes scroll internally so the header/filters stay put. */}
      <main className="flex min-h-0 flex-1 flex-col p-6">
        {/* Suspense: InboxView reads ?thread / ?status via useSearchParams */}
        <Suspense fallback={null}>
          <InboxView />
        </Suspense>
      </main>
    </>
  );
}