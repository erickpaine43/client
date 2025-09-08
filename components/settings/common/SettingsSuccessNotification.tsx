"use client";

import { toast } from "sonner";
import {
  CheckCircle,
  Check,
  Save,
  Upload,
  Trash2,
  UserPlus,
  Settings,
} from "lucide-react";

export type SuccessType =
  | "save"
  | "update"
  | "create"
  | "delete"
  | "upload"
  | "invite"
  | "generic";

interface SuccessNotificationOptions {
  title?: string;
  description?: string;
  type?: SuccessType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function showSuccessNotification({
  title,
  description,
  type = "generic",
  duration = 4000,
  action,
}: SuccessNotificationOptions) {
  const getDefaultTitle = () => {
    switch (type) {
      case "save":
        return "Settings saved";
      case "update":
        return "Updated successfully";
      case "create":
        return "Created successfully";
      case "delete":
        return "Deleted successfully";
      case "upload":
        return "Upload complete";
      case "invite":
        return "Invitation sent";
      default:
        return "Success";
    }
  };

  const getDefaultDescription = () => {
    switch (type) {
      case "save":
        return "Your settings have been saved successfully.";
      case "update":
        return "Your changes have been applied.";
      case "create":
        return "The item has been created successfully.";
      case "delete":
        return "The item has been removed.";
      case "upload":
        return "Your file has been uploaded successfully.";
      case "invite":
        return "The invitation has been sent successfully.";
      default:
        return "The operation completed successfully.";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "save":
        return <Save className="h-4 w-4" />;
      case "update":
        return <Settings className="h-4 w-4" />;
      case "create":
        return <Check className="h-4 w-4" />;
      case "delete":
        return <Trash2 className="h-4 w-4" />;
      case "upload":
        return <Upload className="h-4 w-4" />;
      case "invite":
        return <UserPlus className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  toast.success(title || getDefaultTitle(), {
    description: description || getDefaultDescription(),
    duration,
    icon: getIcon(),
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
  });
}

// Specialized success notification functions
export function showSaveSuccess(customMessage?: string) {
  showSuccessNotification({
    type: "save",
    description: customMessage,
  });
}

export function showUpdateSuccess(itemName?: string) {
  showSuccessNotification({
    type: "update",
    title: itemName ? `${itemName} updated` : undefined,
    description: itemName
      ? `${itemName} has been updated successfully.`
      : undefined,
  });
}

export function showCreateSuccess(itemName?: string) {
  showSuccessNotification({
    type: "create",
    title: itemName ? `${itemName} created` : undefined,
    description: itemName
      ? `${itemName} has been created successfully.`
      : undefined,
  });
}

export function showDeleteSuccess(itemName?: string) {
  showSuccessNotification({
    type: "delete",
    title: itemName ? `${itemName} deleted` : undefined,
    description: itemName
      ? `${itemName} has been removed successfully.`
      : undefined,
  });
}

export function showInviteSuccess(email?: string) {
  showSuccessNotification({
    type: "invite",
    description: email ? `Invitation sent to ${email}` : undefined,
  });
}

export function showUploadSuccess(fileName?: string) {
  showSuccessNotification({
    type: "upload",
    description: fileName ? `${fileName} uploaded successfully` : undefined,
  });
}

// Settings-specific success notifications
export function showProfileUpdateSuccess() {
  showSuccessNotification({
    type: "update",
    title: "Profile updated",
    description: "Your profile information has been saved successfully.",
  });
}

export function showNotificationPreferencesSuccess() {
  showSuccessNotification({
    type: "save",
    title: "Notification preferences saved",
    description: "Your notification settings have been updated.",
  });
}

export function showBillingUpdateSuccess() {
  showSuccessNotification({
    type: "update",
    title: "Billing information updated",
    description: "Your billing details have been saved successfully.",
  });
}

export function showSecurityUpdateSuccess() {
  showSuccessNotification({
    type: "update",
    title: "Security settings updated",
    description: "Your security preferences have been saved.",
  });
}

export function showAppearanceUpdateSuccess() {
  showSuccessNotification({
    type: "save",
    title: "Appearance settings saved",
    description: "Your interface preferences have been applied.",
  });
}

export function showTeamMemberSuccess(
  action: "added" | "updated" | "removed",
  memberName?: string
) {
  const actionMap = {
    added: "create",
    updated: "update",
    removed: "delete",
  } as const;

  showSuccessNotification({
    type: actionMap[action],
    title: `Team member ${action}`,
    description: memberName
      ? `${memberName} has been ${action} successfully.`
      : `Team member has been ${action} successfully.`,
  });
}
