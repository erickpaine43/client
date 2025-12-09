"use client";
import { Row } from "@tanstack/react-table";
import { Email } from "@/app/[locale]/dashboard/inbox/schemas/schemas";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button/button";
import {
  Eye,
  EyeClosed,
  MailOpen,
  MoreVertical,
  SquareArrowDown,
  Trash2Icon,
} from "lucide-react";
import { showCustomToast } from "@/components/ui/custom/custom-toast";
import {
  hideEmailAction,
  markEmailAsReadAction,
  softDeleteEmailAction,
} from "@/app/[locale]/dashboard/inbox/actions";
import { redirect } from "next/navigation";

type IdType = string | number | undefined;
export function InboxColumnAction({
  refetch,
  row,
  id,
}: {
  refetch: () => void;
  row?: Row<Email>;
  id?: string | number;
}) {
  const emailId = row?.original?.id || id;

  const markAsReadMutation = async (id: IdType) => {
    try {
      await markEmailAsReadAction(id);

      showCustomToast({
        title: "Email marked as read",
        description: `Email has been marked as read`,
        icon: <MailOpen className="text-black" />,
      });
      refetch();
    } catch (error) {
      showCustomToast({
        title: "Error",
        description: `Failed to mark email as read`,
        icon: <EyeClosed className="text-red-500" />,
      });
      console.error("Error marking email as read:", error);
    }
  };
  const deleteEmailMutation = async (id: IdType) => {
    try {
      await softDeleteEmailAction(id);
      showCustomToast({
        title: "Email deleted",
        description: `Email has been deleted`,
        icon: <Trash2Icon className="text-black" />,
      });
      refetch();
    } catch (error) {
      showCustomToast({
        title: "Error",
        description: `Failed to delete email`,
        icon: <Trash2Icon className="text-red-500" />,
      });
      console.error("Error deleting email:", error);
    }
  };
  const hideEmailMutation = async (id: IdType) => {
    try {
      await hideEmailAction(id);
      showCustomToast({
        title: "Email hidden",
        description: `Email has been hidden`,
        icon: <SquareArrowDown className="text-black" />,
      });
      refetch();
    } catch (error) {
      showCustomToast({
        title: "Error",
        description: `Failed to hide email`,
        icon: <SquareArrowDown className="text-red-500" />,
      });
      console.error("Error hiding email:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="text-black bold" align="end">
        <DropdownMenuItem onClick={() => markAsReadMutation(emailId)}>
          <MailOpen className="text-black" />
          Mark as read
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => deleteEmailMutation(emailId)}>
          <Trash2Icon className="text-black" />
          Delete
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => redirect(`/dashboard/inbox/${emailId}`)}
        >
          <Eye className="text-black" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => hideEmailMutation(emailId)}>
          <SquareArrowDown className="text-black" />
          Hide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
