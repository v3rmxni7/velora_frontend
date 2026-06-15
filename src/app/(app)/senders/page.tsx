import { SendersView } from "@/components/senders/senders-view";
import { Topbar } from "@/components/shell/topbar";

export default function SendersPage() {
  return (
    <>
      <Topbar title="Senders & Mailboxes" />
      <main className="flex-1 overflow-auto p-6">
        <SendersView />
      </main>
    </>
  );
}