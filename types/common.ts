// Common utility types and generic interfaces used across the application

export type ID = string | number;

export type Timestamp = string; // ISO date string

export type Status = "active" | "inactive" | "pending" | "error";

export type DisplayStatus =
  | "Running"
  | "Paused"
  | "Draft"
  | "Completed"
  | "Archived";

export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface MetricData {
  total: number;
  rate?: number;
  trend?: "up" | "down" | "stable";
}

export interface ComponentBaseProps {
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

// Server action result type for consistent error handling
export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string };
