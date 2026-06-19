import { BillingView } from "@/components/billing/billing-view";
import { Topbar } from "@/components/shell/topbar";

export default function BillingPage() {
  return (
    <>
      <Topbar title="Billing" />
      <main className="flex-1 overflow-auto p-6">
        <BillingView />
      </main>
    </>
  );
}
