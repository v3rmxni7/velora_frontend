import { ConnectionsView } from "@/components/connections/connections-view";
import { Topbar } from "@/components/shell/topbar";

export default function ConnectionsPage() {
  return (
    <>
      <Topbar title="Connections" />
      <main className="flex-1 overflow-auto p-6">
        <ConnectionsView />
      </main>
    </>
  );
}
