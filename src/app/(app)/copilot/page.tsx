import { CopilotView } from "@/components/copilot/copilot-view";
import { Topbar } from "@/components/shell/topbar";

export default function CopilotPage() {
  return (
    <>
      <Topbar title="Ava" />
      {/* No outer overflow — the panes scroll internally so the composer stays anchored. */}
      <main className="flex min-h-0 flex-1 flex-col p-6">
        <CopilotView />
      </main>
    </>
  );
}
