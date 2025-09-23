import { getMessages, type Message } from "@/lib/actions/inbox";
import { getRelativeTime, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function ConversationMessages() {
  const messages = await getMessages();

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-muted/30">
      {(Array.isArray(messages)
        ? messages
        : messages.success
          ? messages.data || []
          : []
      ).map((message: Message) => (
        <div
          key={message.id}
          className={cn(
            "flex",
            message.type === "outgoing" ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "flex items-start space-x-3 max-w-2xl",
              message.type === "outgoing" && "flex-row-reverse space-x-reverse"
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {message.sender?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium">{message.sender}</span>
                <Badge variant="secondary" className="text-xs">
                  {getRelativeTime(message.time)}
                </Badge>
              </div>

              <Card
                className={cn(
                  "p-4",
                  message.type === "outgoing"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card"
                )}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
              </Card>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
