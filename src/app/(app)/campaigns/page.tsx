import { CampaignList } from "@/components/campaigns/campaign-list";
import { Topbar } from "@/components/shell/topbar";

export default function CampaignsPage() {
  return (
    <>
      <Topbar title="Campaigns" />
      <main className="flex-1 overflow-auto p-6">
        <CampaignList />
      </main>
    </>
  );
}