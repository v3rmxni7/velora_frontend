import { Topbar } from "@/components/shell/topbar";

export default function LeadDiscoveryPage() {
  return (
    <>
      <Topbar title="Find leads" />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-border bg-card">
          <p className="text-sm text-muted-foreground">
            Lead search lands here next — describe who you sell to and Velora finds them.
          </p>
        </div>
      </main>
    </>
  );
}