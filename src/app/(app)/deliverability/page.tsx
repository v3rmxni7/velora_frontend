import { DeliverabilityView } from "@/components/deliverability/deliverability-view";
import { Topbar } from "@/components/shell/topbar";

export default function DeliverabilityPage() {
  return (
    <>
      <Topbar title="Deliverability" />
      <main className="flex-1 overflow-auto p-6">
        <DeliverabilityView />
      </main>
    </>
  );
}