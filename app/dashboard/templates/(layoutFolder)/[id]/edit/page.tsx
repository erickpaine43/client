import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { getTemplateById, updateTemplate } from "@/lib/actions/templateActions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getTemplateById(id);
  if (!result.success || !result.data) {
    notFound();
  }
  const currentTemplate = result.data;
  const { name, category, content, subject } = currentTemplate;

  return (
    <div className="p-3">
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <div className="flex  gap-2 items-start">
              <Link href="/dashboard/templates">
                <Button
                  variant="link"
                  size="icon"
                  asChild
                  className="text-gray-400"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
              </Link>
              <div className="flex flex-col gap-2">
                <CardTitle className="text-lg">{name}</CardTitle>
                <CardDescription>{category}</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/templates/${id}`}>Cancel</Link>
              </Button>
              <Button type="submit" form="edit-form">Save Changes</Button>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-6">
          <form action={updateTemplate} id="edit-form">
            <input type="hidden" name="id" value={id} />
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Template Name
              </h3>
              <Input
                className="text-gray-900"
                defaultValue={name}
                name="name"
                required
              />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Subject Line
              </h3>
              <Input
                className="text-gray-900"
                defaultValue={subject}
                name="subject"
                required
              />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Email Content
              </h3>
              <Textarea
                className="text-gray-900 h-64"
                defaultValue={content}
                name="content"
                required
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default page;
