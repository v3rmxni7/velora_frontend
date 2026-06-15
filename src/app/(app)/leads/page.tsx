import { LeadsBrowser } from "@/components/leads/leads-browser";
import { Topbar } from "@/components/shell/topbar";

export default function LeadsPage() {
  return (
    <>
      <Topbar title="Leads" />
      <main className="flex-1 overflow-auto p-6">
        <LeadsBrowser />
      </main>
    </>
  );
}
