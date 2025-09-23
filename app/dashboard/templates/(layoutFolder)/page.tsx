import TemplateItem from "@/components/templates/template-item";
import { Input } from "@/components/ui/input";
import { getTemplates } from "@/lib/actions/templates";

// Force dynamic rendering for authentication checks
export const dynamic = "force-dynamic";

async function Page() {
  const result = await getTemplates();

  if (!result.success) {
    return (
      <div className="p-4">
        <p className="text-destructive">
          Error loading templates: {result.error?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  const templates = result.data;

  return (
    <div className="p-4 space-y-4 h-full">
      <div>
        <Input placeholder="Search Templates" />
      </div>
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-400px)]">
        {templates &&
          templates.map((template) => (
            <TemplateItem key={template.id} template={template} />
          ))}
      </div>
    </div>
  );
}
export default Page;
