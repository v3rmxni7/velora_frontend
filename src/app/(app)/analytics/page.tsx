import { AnalyticsHub } from "@/components/analytics/analytics-hub";
import { Topbar } from "@/components/shell/topbar";

export default function AnalyticsPage() {
  return (
    <>
      <Topbar title="Analytics" />
      <main className="flex-1 overflow-auto p-6">
        <AnalyticsHub />
      </main>
    </>
  );
}
