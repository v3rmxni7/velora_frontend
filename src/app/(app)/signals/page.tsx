import { SignalsCatalog } from "@/components/signals/signals-catalog";
import { Topbar } from "@/components/shell/topbar";

export default function SignalsPage() {
  return (
    <>
      <Topbar title="Signals" />
      <main className="flex-1 overflow-auto p-6">
        <SignalsCatalog />
      </main>
    </>
  );
}
