import React from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold,
  Code,
  Italic,
  Link,
  Mail,
  Trash2,
  Underline,
} from "lucide-react";

export interface EmailStep {
  id: string;
  type: "email" | "wait";
  subject?: string;
  content?: string;
  delay?: number;
  delayUnit?: "hours" | "days";
  condition?: "always" | "no_reply";
}

interface EmailStepProps {
  step: EmailStep;
  index: number;
  updateStep: (index: number, updates: Partial<EmailStep>) => void;
  removeStep: (index: number) => void;
  focusedTextareaIndex: React.MutableRefObject<number | null>;
}

function EmailStep({
  step,
  index,
  updateStep,
  removeStep,
  focusedTextareaIndex,
}: EmailStepProps) {
  const [isPreviewMode, setIsPreviewMode] = React.useState(false);

  function removeStepHandler() {
    removeStep(index);
  }
  function updateStepHandler(
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    const { name, value } = e.target;
    updateStep(index, { [name]: value });
  }

  function insertFormatting(format: string) {
    const textarea = document.querySelector(
      `[data-step-index="${index}"]`
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const currentContent = step.content || "";

    let newContent = "";
    let formatWrapper = "";

    switch (format) {
      case "bold":
        formatWrapper = selectedText ? `**${selectedText}**` : "**text**";
        break;
      case "italic":
        formatWrapper = selectedText ? `*${selectedText}*` : "*text*";
        break;
      case "underline":
        formatWrapper = selectedText ? `<u>${selectedText}</u>` : "<u>text</u>";
        break;
      case "link":
        formatWrapper = selectedText
          ? `[${selectedText}](url)`
          : "[link text](url)";
        break;
      case "code":
        formatWrapper = selectedText ? "`${selectedText}`" : "`code`";
        break;
    }

    newContent =
      currentContent.substring(0, start) +
      formatWrapper +
      currentContent.substring(end);
    updateStep(index, { content: newContent });

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formatWrapper.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  function renderPreview(content: string) {
    if (!content) return "";

    // Convert markdown-style formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      .replace(/\n/g, "<br>");
  }
  return (
    <div className="bg-card dark:bg-card rounded-2xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-100 dark:bg-orange-500/20">
            <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Email {Math.floor(index / 2) + 1}
            </h3>
            <p className="text-sm text-muted-foreground">Step {index + 1}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={removeStepHandler}
          className="p-2 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">
            Subject Line
          </Label>
          <div className="flex space-x-2">
            <Input
              type="text"
              value={step.subject || ""}
              name="subject"
              onChange={updateStepHandler}
              placeholder="e.g. Quick question about {Company}'s software strategy"
              className="w-full px-4 py-3 border border-input rounded-xl "
            />
            <Button variant="outline" className="whitespace-nowrap">
              Import Template
            </Button>
          </div>
        </div>
        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">
            Email Content
          </Label>
          <div className="border border-border rounded-xl">
            <div className="flex justify-between items-center p-2 border-b border-border">
              <div className="flex space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting("bold")}
                  className="p-2 h-8 w-8"
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting("italic")}
                  className="p-2 h-8 w-8"
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting("underline")}
                  className="p-2 h-8 w-8"
                >
                  <Underline className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting("link")}
                  className="p-2 h-8 w-8"
                >
                  <Link className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting("code")}
                  className="p-2 h-8 w-8"
                >
                  <Code className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={!isPreviewMode ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setIsPreviewMode(false)}
                >
                  Edit
                </Button>
                <Button
                  variant={isPreviewMode ? "default" : "ghost"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setIsPreviewMode(true)}
                >
                  Preview
                </Button>
              </div>
            </div>
            {!isPreviewMode ? (
              <Textarea
                rows={6}
                name="content"
                value={step.content || ""}
                onChange={updateStepHandler}
                onFocus={() => (focusedTextareaIndex.current = index)}
                data-step-index={index}
                placeholder="Write your email here... Use {First Name}, {Company}, etc. for personalization."
                className="border-0 focus:ring-0 px-4 py-3 rounded-none rounded-b-xl resize-none focus:border-none"
              />
            ) : (
              <div
                className="px-4 py-3 min-h-[144px] rounded-none rounded-b-xl bg-muted/50 dark:bg-muted/30 border-0"
                dangerouslySetInnerHTML={{
                  __html: renderPreview(
                    step.content || "No content to preview"
                  ),
                }}
              />
            )}
          </div>

          {/* Personalization Tags */}
          <div className="mt-4">
            <Label className="block text-sm font-medium text-foreground mb-2">
              Personalization Tags
            </Label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "First Name", value: "{First Name}" },
                { label: "Last Name", value: "{Last Name}" },
                { label: "Company", value: "{Company}" },
                { label: "Job Title", value: "{Job Title}" },
                { label: "Industry", value: "{Industry}" },
                { label: "City", value: "{City}" },
                { label: "Website", value: "{Website}" },
                { label: "Company Size", value: "{Company Size}" },
                { label: "My First Name", value: "{My First Name}" },
                { label: "My Company", value: "{My Company}" },
              ].map((tag) => (
                <Button
                  key={tag.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  name="content"
                  onClick={() => {
                    if (focusedTextareaIndex.current === index) {
                      const currentContent = step.content || "";
                      const updatedContent = currentContent
                        ? `${currentContent} ${tag.value}`
                        : tag.value;
                      updateStep(index, { content: updatedContent });
                    }
                  }}
                  className="text-xs px-2 py-1 border-border text-foreground hover:bg-accent dark:hover:bg-accent"
                >
                  {tag.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        {index > 0 && (
          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Send Condition
            </Label>
            <Select
              name="condition"
              value={step.condition || "no_reply"}
              onValueChange={(value) =>
                updateStep(index, {
                  condition: value as "always" | "no_reply",
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_reply">Only if no reply</SelectItem>
                <SelectItem value="always">Always send</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
export default EmailStep;
