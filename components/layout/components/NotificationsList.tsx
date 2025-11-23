"use client";
import { Button } from "@/components/ui/button/button";
import { Notification } from "@/types/notification";
import { Bell } from "lucide-react";
import NotificationListItem from "./NotificationListItem";

function NotificationsList({
  notifications,
}: {
  notifications: Notification[];
}) {
  const markAllAsRead = () => {};

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  return (
    <>
      {/* Header */}
      <div className=" p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="link">
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h4 className="text-sm font-medium text-foreground mb-1">
              No notifications
            </h4>
            <p className="text-sm text-muted-foreground">
              You&apos;re all caught up!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-border bg-gray-50 dark:bg-muted/30">
          <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
            View all notifications
          </button>
        </div>
      )}
    </>
  );
}
export default NotificationsList;
