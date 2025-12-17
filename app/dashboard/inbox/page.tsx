import ConversationsList from "@/components/inbox/components/ConversationsList";
import InboxFilter from "@/components/inbox/filters/InboxFilter";
import SmartInsights from "@/components/inbox/components/smart-insights";
import { getFilteredConversations } from "@/lib/actions/inbox";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const conversationsResult = await getFilteredConversations(params);

  // Handle ActionResult properly
  const conversations =
    conversationsResult.success && conversationsResult.data
      ? conversationsResult.data
      : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-tl-2xl overflow-hidden flex flex-col">
        <SmartInsights />
        <InboxFilter />
      </div>
      <div className="col-span-2">
        <ConversationsList conversations={conversations} />
      </div>
    </div>
  );
}
