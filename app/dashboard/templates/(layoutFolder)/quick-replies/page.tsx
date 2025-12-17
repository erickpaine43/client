import QuickReplyItem from "@/components/templates/quick-replies/quick-replay-item";
import { Input } from "@/components/ui/input";
import { getQuickReplies } from "@/lib/actions/templates";

// Force dynamic rendering since this page uses authentication
export const dynamic = "force-dynamic";

async function page() {
  const result = await getQuickReplies();

  if (!result.success) {
    return <div>Error: {result.error?.message || "Unknown error"}</div>;
  }

  const quickReplies = result.data || [];

  return (
    <div className="p-4 space-y-4">
      <div>
        <Input placeholder="Search Templates" />
      </div>
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-400px)]">
        {quickReplies.map((template) => (
          <QuickReplyItem key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
export default page;
