"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTemplates } from "@/lib/actions/templates";
import { cn } from "@/lib/utils";
import { Template } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function Default() {
  const { id } = useParams();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const result = await getTemplates();
        if (result.success && result.data) {
          setTemplates(result.data);
        } else {
          setError("Failed to load templates");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while loading templates");
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  if (!id) {
    router.push("/dashboard/templates");
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-gray-50 p-2 px-4 border-r border-gray-200 w-72 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Templates</h3>
          <Link href="/dashboard/templates">
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          <div className="animate-pulse">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 p-2 px-4 border-r border-gray-200 w-72 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Templates</h3>
          <Link href="/dashboard/templates">
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>
        </div>
        <div className="text-red-500 text-center p-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-2 px-4 border-r border-gray-200 w-72 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Templates</h3>
        <Link href="/dashboard/templates">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
      </div>
      <div className="space-y-3">
        {templates.map((template) => (
          <QuickReplaySmallItem
            key={template.id}
            template={template}
            active={String(id) === String(template.id)}
          />
        ))}
      </div>
    </div>
  );
}
function QuickReplaySmallItem({
  template,
  active,
}: {
  template: Template;
  active: boolean;
}) {
  return (
    <Card
      className={cn({
        [`border-l-3 bg-blue-100 rounded-l-md border-l-blue-500`]: active,
      })}
    >
      <Link href={`/dashboard/templates/${template.id}`}>
        <CardHeader>
          <CardTitle
            className={cn({
              "text-blue-500": active,
            })}
          >
            {template.name}
          </CardTitle>
          <CardDescription className="text-nowrap text-ellipsis overflow-hidden">
            {template.content}
          </CardDescription>
        </CardHeader>
      </Link>
    </Card>
  );
}

export default Default;
