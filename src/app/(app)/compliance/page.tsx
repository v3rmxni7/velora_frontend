import { ComplianceView } from "@/components/compliance/compliance-view";
import { Topbar } from "@/components/shell/topbar";

export default function CompliancePage() {
  return (
    <>
      <Topbar title="Compliance" />
      <main className="flex-1 overflow-auto p-6">
        <ComplianceView />
      </main>
    </>
  );
}
