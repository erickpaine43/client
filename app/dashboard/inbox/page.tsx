import ConversationsList from "@/components/inbox/ConversationsList";
import InboxFilter from "@/components/inbox/filters/InboxFilter";
import SmartInsights from "@/components/inbox/smart-insights";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-tl-2xl overflow-hidden flex flex-col">
        <SmartInsights />
        <InboxFilter />
      </div>
      <div className="col-span-2">
        <ConversationsList _searchParams={params} />
      </div>
    </div>
  );
}
