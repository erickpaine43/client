import { Button } from "@/components/ui/button";
import { getConversationCount } from "@/lib/actions/inbox";
import { RefreshCw, Settings } from "lucide-react";

export default async function ConversationsListHeader({
  title = "All Conversations",
}: {
  title?: string;
}) {
  const countResult = await getConversationCount();
  const count = countResult.success ? countResult.data || 0 : 0;
  return (
    <div className="p-2 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({count})
          </span>
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
