import { redirect } from "next/navigation";
import ClientsContent from "./content";
import { getClientsPage } from "./actions";

export default async function ClientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { campaignId } = await params;
  const { page } = await searchParams;
  if (!campaignId) {
    redirect("/dashboard/campaigns");
  }
  const data = await getClientsPage(campaignId, Number(page) || 1);

  return (
    <ClientsContent
      initialClients={data.clients}
      totalPages={data.pages}
      campaignId={campaignId}
      initialPage={Number(page) || 1}
    />
  );
}
