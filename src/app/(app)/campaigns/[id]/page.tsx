import { CampaignDetail } from "@/components/campaigns/campaign-detail";
import { Topbar } from "@/components/shell/topbar";

// Next 16: route params are async.
export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <Topbar title="Campaign" />
      <main className="flex-1 overflow-auto p-6">
        <CampaignDetail id={id} />
      </main>
    </>
  );
}