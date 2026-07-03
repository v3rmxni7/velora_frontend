import { SavedLeads } from "@/components/leads/saved-leads";
import { SearchSection } from "@/components/leads/search-section";
import { Topbar } from "@/components/shell/topbar";

export default function LeadDiscoveryPage() {
  return (
    <>
      <Topbar title="Find leads" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <SearchSection />
          <SavedLeads />
        </div>
      </main>
    </>
  );
}