import moment from "moment-timezone";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isValidTimeRange = (
  firstSendTime: string,
  secondSendTime: string,
) => {
  const [startHour, startMinute] = firstSendTime.split(":").map(Number);
  const [endHour, endMinute] = secondSendTime.split(":").map(Number);

  if (
    isNaN(startHour) ||
    isNaN(startMinute) ||
    isNaN(endHour) ||
    isNaN(endMinute)
  ) {
    return true;
  }

  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;

  return endTimeInMinutes >= startTimeInMinutes;
};

export function calculateMaxEmails(
  startTime: string,
  endTime: string,
  delayMinutes: number,
) {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const totalStartMinutes = startHours * 60 + startMinutes;
  const totalEndMinutes = endHours * 60 + endMinutes;

  const totalMinutes = totalEndMinutes - totalStartMinutes;
  const maxEmails = Math.floor(totalMinutes / delayMinutes);

  return Math.max(maxEmails, 0);
}
export const allTimezones = moment.tz.names().map((tz) => {
  const offset = moment.tz(tz).utcOffset();
  const sign = offset >= 0 ? "+" : "-";
  const absOffset = Math.abs(offset);
  const hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
  const minutes = String(absOffset % 60).padStart(2, "0");
  const formattedOffset = `UTC${sign}${hours}:${minutes}`;
  return {
    label: `${formattedOffset} (${tz.replace("_", " ")})`,
    value: tz,
  };
});

export const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60),
  );

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

// Password strength types
export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: "red" | "yellow" | "green";
  feedback: string[];
}

// Password validation functions
export const validatePasswordRequirements = (password: string) => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  return requirements;
};

// Password strength calculation
export const calculatePasswordStrength = (
  password: string,
): PasswordStrength => {
  if (password.length === 0) {
    return {
      score: 0,
      label: "Very Weak",
      color: "red",
      feedback: ["Enter a password"],
    };
  }

  const requirements = validatePasswordRequirements(password);
  const score = Object.values(requirements).filter(Boolean).length;

  let label: string;
  let color: "red" | "yellow" | "green";
  const feedback: string[] = [];

  // Generate feedback messages
  if (!requirements.length) feedback.push("Use at least 8 characters");
  if (!requirements.uppercase) feedback.push("Add uppercase letter");
  if (!requirements.lowercase) feedback.push("Add lowercase letter");
  if (!requirements.number) feedback.push("Add number");
  if (!requirements.special) feedback.push("Add special character");

  // Determine strength level
  if (score === 0) {
    label = "Very Weak";
    color = "red";
    if (password.length > 0) {
      feedback.unshift("Very weak password");
    }
  } else if (score <= 2) {
    label = "Weak";
    color = "red";
    feedback.unshift("Weak password");
  } else if (score <= 3) {
    label = "Fair";
    color = "yellow";
    feedback.unshift("Fair password strength");
  } else if (score <= 4) {
    label = "Good";
    color = "green";
    feedback.unshift("Good password strength");
  } else {
    label = "Strong";
    color = "green";
    feedback.unshift("Strong password");
  }

  return {
    score,
    label,
    color,
    feedback,
  };
};

// Utility function to check if password meets minimum requirements
export const isPasswordStrongEnough = (password: string): boolean => {
  const strength = calculatePasswordStrength(password);
  return strength.score >= 3; // At least "Fair" strength required
};

// Debounce utility function
export const debounce = <T extends (...args: any[]) => any>( // eslint-disable-line @typescript-eslint/no-explicit-any
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Profile mapping interfaces
export interface NileUser {
  id: string;
  email: string;
  name?: string;
  familyName?: string;
  givenName?: string;
  picture?: string;
  created: string;
  updated?: string;
  emailVerified?: boolean;
  tenants: string[]; // Fixed: should match library type
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  avatarUrl: string;
  timezone: string;
  language: string;
}

// Mapping functions
export const mapNileUserToFormData = (user: NileUser): ProfileFormData => ({
  firstName: user.givenName || "",
  lastName: user.familyName || "",
  name: user.name || "",
  email: user.email,
  avatarUrl: user.picture || "",
  timezone: "UTC", // Default timezone
  language: "en", // Default language
});

export const mapFormDataToNileUpdate = (formData: Partial<ProfileFormData>) => {
  const result: Record<string, string | undefined> = {};

  if (formData.name !== undefined)
    result.name = formData.name.trim() || undefined;
  if (formData.firstName !== undefined)
    result.givenName = formData.firstName.trim() || undefined;
  if (formData.lastName !== undefined)
    result.familyName = formData.lastName.trim() || undefined;
  if (formData.avatarUrl !== undefined)
    result.picture = formData.avatarUrl.trim() || undefined;

  return result;
};

// Validation function
export const validateProfileUpdateData = (data: {
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
}) => {
  const errors: string[] = [];

  if (
    data.name !== undefined &&
    data.name !== "" &&
    typeof data.name !== "string"
  ) {
    errors.push("Name must be a string");
  }
  if (
    data.givenName !== undefined &&
    data.givenName !== "" &&
    typeof data.givenName !== "string"
  ) {
    errors.push("First name must be a string");
  }
  if (
    data.familyName !== undefined &&
    data.familyName !== "" &&
    typeof data.familyName !== "string"
  ) {
    errors.push("Last name must be a string");
  }
  if (
    data.picture !== undefined &&
    data.picture !== "" &&
    typeof data.picture !== "string"
  ) {
    errors.push("Picture must be a string");
  }

  return { isValid: errors.length === 0, errors };
};

// Tag color utility for inbox conversations
export const getTagColor = (tag: string) => {
  switch (tag) {
    case "interested":
      return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
    case "not-interested":
      return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
    case "maybe-later":
      return "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100";
    case "replied":
      return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
    case "follow-up":
      return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100";
    case "hot-lead":
      return "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
  }
};
