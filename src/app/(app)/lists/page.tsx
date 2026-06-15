import { ListsView } from "@/components/lists/lists-view";
import { Topbar } from "@/components/shell/topbar";

export default function ListsPage() {
  return (
    <>
      <Topbar title="Lists" />
      <main className="flex-1 overflow-auto p-6">
        <ListsView />
      </main>
    </>
  );
}
