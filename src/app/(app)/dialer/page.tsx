import { DialerView } from "@/components/dialer/dialer-view";
import { Topbar } from "@/components/shell/topbar";

export default function DialerPage() {
  return (
    <>
      <Topbar title="Dialer" />
      <main className="flex-1 overflow-auto p-6">
        <DialerView />
      </main>
    </>
  );
}
