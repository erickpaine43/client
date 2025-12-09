/**
 * Utility functions for domain-related UI components
 */

/**
 * Get status color classes for domain warmup status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "WARMED":
      return "bg-green-100 text-green-800 border-green-200";
    case "WARMING":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "PAUSED":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "NOT_STARTED":
      return "bg-gray-100 dark:bg-muted text-gray-800 dark:text-foreground border-gray-200 dark:border-border";
    default:
      return "bg-gray-100 dark:bg-muted text-gray-800 dark:text-foreground border-gray-200 dark:border-border";
  }
}
