import { Topbar } from "@/components/shell/topbar";

export default function EngagePage() {
  return (
    <>
      <Topbar title="Tasks" />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-border bg-card">
          <p className="text-sm text-muted-foreground">
            Drafts to review land here — each one grounded in verified facts.
          </p>
        </div>
      </main>
    </>
  );
}