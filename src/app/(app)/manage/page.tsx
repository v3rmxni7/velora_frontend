import { ManageHub } from "@/components/manage/manage-hub";
import { Topbar } from "@/components/shell/topbar";

export default function ManagePage() {
  return (
    <>
      <Topbar title="Manage Ava" />
      <main className="flex-1 overflow-auto p-6">
        <ManageHub />
      </main>
    </>
  );
}
