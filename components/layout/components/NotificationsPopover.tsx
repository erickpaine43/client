"use client";

import { Button } from "@/components/ui/button";
import { PopoverContent } from "@/components/ui/popover";
import { Notification } from "@/types/notification";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import NotificationsList from "./NotificationsList";
import { getNotifications } from "@/lib/actions/notificationsActions";
// Use server action for notifications data
function NotificationsPopover() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(
        data.notifications.filter((n) => !n.isRead).length
      );
    };
    fetchNotifications();
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className=" group relative">
          <Bell className="w-5 h-5 font-bold   group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 bg-white border border-gray-200 p-0 rounded-xl shadow-lg  max-h-96 overflow-hidden">
        <NotificationsList notifications={notifications} />
      </PopoverContent>
    </Popover>
  );
}
export default NotificationsPopover;
