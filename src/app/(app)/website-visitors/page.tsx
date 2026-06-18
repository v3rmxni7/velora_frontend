import { Topbar } from "@/components/shell/topbar";
import { WebsiteVisitorsView } from "@/components/website-visitors/website-visitors-view";

export default function WebsiteVisitorsPage() {
  return (
    <>
      <Topbar title="Website visitors" />
      <main className="flex-1 overflow-auto p-6">
        <WebsiteVisitorsView />
      </main>
    </>
  );
}
