import { RecentReply } from "@/types/campaign";
import { Badge } from "@/components/ui/badge";
import { UnifiedDataList } from "@/components/design-system/components/unified-data-list";

const RecentRepliesList = ({
  recentReplies,
}: {
  recentReplies: RecentReply[];
}) => {
  const renderReplyItem = (reply: RecentReply) => {
    const initials = reply.name
      .split(" ")
      .map((n) => n[0])
      .join("");
    const isPositive = reply.type === "positive";

    return (
      <div className="flex gap-3 py-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
        {/* Avatar */}
        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-muted-foreground">
            {initials}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* First line: Name • Company • Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">{reply.name}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              {reply.company}
            </span>
            <Badge
              variant="outline"
              className={
                isPositive
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
                  : "bg-muted text-muted-foreground"
              }
            >
              {isPositive ? "Interested" : "Not Interested"}
            </Badge>
          </div>

          {/* Second line: Message */}
          <p className="text-muted-foreground mt-1">{reply.message}</p>

          {/* Third line: Timestamp */}
          <p className="text-sm text-muted-foreground mt-1">{reply.time}</p>
        </div>
      </div>
    );
  };

  // TODO: Missing keyExtractor prop - this is a regression from the previous implementation
  // The UnifiedDataList component now falls back to array indices as keys, which is a React anti-pattern.
  // Previous implementation correctly used reply.email as unique key.
  //
  // Fix: Add keyExtractor prop to use reply.email (or other unique identifier) as keys:
  // keyExtractor={(item) => item.email}
  //
  // This maintains the previous behavior and prevents rendering bugs when items are reordered,
  // added, or removed from the list.
  return (
    <UnifiedDataList
      data={recentReplies}
      renderItem={renderReplyItem}
      emptyMessage="No recent replies found."
      className="border-none shadow-none"
    />
  );
};

export default RecentRepliesList;
