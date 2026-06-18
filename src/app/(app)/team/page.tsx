import { Topbar } from "@/components/shell/topbar";
import { TeamView } from "@/components/team/team-view";

export default function TeamPage() {
  return (
    <>
      <Topbar title="Team" />
      <main className="flex-1 overflow-auto p-6">
        <TeamView />
      </main>
    </>
  );
}
