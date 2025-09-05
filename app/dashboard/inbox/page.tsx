import ConversationsList from "@/components/inbox/components/ConversationsList";
import InboxFilter from "@/components/inbox/filters/InboxFilter";
import SmartInsights from "@/components/inbox/components/smart-insights";
import { conversations } from "@/lib/data/Inbox.mock";
// Define filter functions
const filterConversations = (convs: typeof conversations, params: Record<string, string | string[] | undefined>) => {
  let filtered = [...convs];

  // Status filter
  const status = params.filter as string;
  if (status && status !== "all") {
    if (status === "unread") {
      filtered = filtered.filter(c => c.status === "unread");
    } else if (status === "sent") {
      // Assume 'sent' logic, perhaps based on some logic not in mock
    } else if (status === "archived") {
      // etc.
    }
  }

  // Campaign filter
  const campaigns = params.campaigns as string[] | undefined;
  if (campaigns && Array.isArray(campaigns) && campaigns.length > 0) {
    filtered = filtered.filter(c => campaigns.includes(c.campaign));
  }

  // Tag filter
  const tags = params.tags as string[] | undefined;
  if (tags && Array.isArray(tags) && tags.length > 0) {
    filtered = filtered.filter(c => tags.includes(c.tag.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())));
  }

  // Time filter - basic implementation
  const time = params.time as string;
  if (time && time !== "all") {
    const now = new Date();
    filtered = filtered.filter(c => {
      const convTime = new Date(c.time);
      if (time === "today") {
        return convTime.toDateString() === now.toDateString();
      } else if (time === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return convTime >= weekAgo;
      } else if (time === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return convTime >= monthAgo;
      }
      return true;
    });
  }

  return filtered;
};

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filteredConversations = filterConversations(conversations, params);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-tl-2xl overflow-hidden flex flex-col">
        <SmartInsights />
        <InboxFilter />
      </div>
      <div className="col-span-2">
        <ConversationsList conversations={filteredConversations} _searchParams={params} />
      </div>
    </div>
  );
}
