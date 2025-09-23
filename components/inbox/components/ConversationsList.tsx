import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, getRelativeTime, getTagColor } from "@/lib/utils";
import { Eye, MoreHorizontal, Pin, Star } from "lucide-react";
import Link from "next/link";
import ConversationsListHeader from "./ConversationsListHeader";

import { Conversation } from "@/types";

function ConversationsList({
  conversations: filteredConversations,
}: {
  conversations: Conversation[];
}) {
  return (
    <div className="flex flex-col h-full w-full">
      <ConversationsListHeader title="All Conversations" />

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-4">
          {filteredConversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/dashboard/inbox/${conversation.id}`}
              className="block"
            >
              <Card
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all duration-200 group p-0"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-semibold text-white">
                          {conversation.avatar}
                        </span>
                      </div>
                      {conversation.status === "unread" && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {conversation.name}
                          </h3>
                          {conversation.isStarred && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                          {conversation.isPinned && (
                            <Pin className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {getRelativeTime(conversation.time)}
                        </span>
                      </div>

                      <h4 className="font-medium text-gray-900 mb-2">
                        {conversation.subject}
                      </h4>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {conversation.preview}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-sm font-medium",
                              getTagColor(conversation.tag)
                            )}
                          >
                            {conversation.tag.replace("-", " ")}
                          </Badge>
                          <Badge variant="secondary" className="text-sm">
                            {conversation.campaign}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600"
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
export default ConversationsList;
