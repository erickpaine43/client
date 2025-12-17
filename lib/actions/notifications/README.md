# Notifications Module

This module provides comprehensive notification management functionality, split from the original `notificationActions.ts` file for better organization and maintainability.

## Module Structure

```
lib/actions/notifications/
├── index.ts              # Main entry point and public API
├── preferences.ts        # Notification preference management
├── history.ts           # Notification history operations
├── schedules.ts         # Notification scheduling functionality
├── __tests__/           # Test suite
│   ├── index.test.ts    # Main module tests
│   ├── preferences.test.ts # Preference management tests
│   ├── history.test.ts  # History management tests
│   ├── schedules.test.ts # Schedule management tests
│   ├── integration.test.ts # Integration tests
│   └── utils.test.ts    # Utility function tests
└── README.md           # This documentation
```

## Features

### 1. Notification Preferences Management (`preferences.ts`)

- **Email Notifications**: Manage email notification settings for campaigns, reports, alerts, etc.
- **In-App Notifications**: Control real-time alerts and system notifications
- **Push Notifications**: Configure desktop and mobile push notification settings
- **Validation**: Comprehensive validation for all preference types
- **Bulk Updates**: Support for updating multiple preference categories at once

#### Key Functions:

- `updateEmailNotifications()` - Update email-specific preferences
- `updateInAppNotifications()` - Update in-app notification settings
- `updatePushNotifications()` - Configure push notification settings
- `resetNotificationPreferences()` - Reset to default settings
- `getNotificationPreferencesSummary()` - Get preference statistics

### 2. Notification History Management (`history.ts`)

- **History Retrieval**: Get paginated notification history
- **Read Status Management**: Mark notifications as read/unread
- **Search Functionality**: Search notifications with filters
- **Statistics**: Get notification statistics and metrics
- **Cleanup Operations**: Delete old notifications

#### Key Functions:

- `getNotificationHistory()` - Get paginated notification history
- `markNotificationsAsRead()` - Mark specific notifications as read
- `markAllNotificationsAsRead()` - Mark all notifications as read
- `searchNotificationHistory()` - Search with filters and pagination
- `getNotificationStatistics()` - Get comprehensive statistics
- `getUnreadNotificationCount()` - Get count of unread notifications

### 3. Notification Scheduling (`schedules.ts`)

- **Schedule Management**: Create, update, and delete notification schedules
- **Multiple Schedule Types**: Support for weekly reports, monthly reports, and custom reminders
- **Timezone Support**: Full timezone handling for scheduled notifications
- **Next Run Calculation**: Calculate next execution times for schedules
- **Schedule Validation**: Comprehensive validation for schedule parameters

#### Key Functions:

- `getNotificationSchedules()` - Get all user schedules
- `upsertNotificationSchedule()` - Create or update a schedule
- `deleteNotificationSchedule()` - Remove a schedule
- `toggleNotificationSchedule()` - Enable/disable schedules
- `createCustomReminder()` - Create custom reminder schedules
- `getNextScheduledNotifications()` - Get upcoming notification times

### 4. Main Module (`index.ts`)

- **Unified API**: Single entry point for all notification operations
- **Helper Functions**: Utility functions for data conversion
- **Type Exports**: Re-exports all necessary types
- **Backward Compatibility**: Maintains compatibility with existing code

#### Helper Functions:

- `preferencesToFormValues()` - Convert preferences to form-friendly format
- `formValuesToPreferences()` - Convert form data back to preferences
- `preferencesToSettingsProps()` - Convert for UI component props

## Architecture Features

### 1. Standardized Error Handling

- Uses core error handling utilities (`ErrorFactory`)
- Consistent error types and messages
- Proper error categorization (auth, validation, server, etc.)

### 2. Authentication & Authorization

- Integrated with core auth utilities
- Rate limiting for all operations
- User and company context validation
- Permission checking where applicable

### 3. Rate Limiting

- Contextual rate limiting (user, company, IP, global)
- Different limits for read vs write operations
- Configurable rate limit windows
- Automatic cleanup of expired rate limit entries

### 4. Validation

- Comprehensive input validation
- Type-safe validation functions
- Field-specific error messages
- Business rule validation (e.g., push notification platform requirements)

### 5. Testing

- Comprehensive test suite with 19 passing tests
- Unit tests for utility functions
- Integration tests for data consistency
- Validation tests for all input scenarios
- Mock-free utility testing to avoid dependency issues

## Usage Examples

### Basic Preference Management

```typescript
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/actions/notifications";

// Get current preferences
const preferences = await getNotificationPreferences();

// Update email preferences
const result = await updateNotificationPreferences({
  email: {
    newReplies: true,
    campaignUpdates: false,
  },
});
```

### History Management

```typescript
import {
  getNotificationHistory,
  markNotificationsAsRead,
  searchNotificationHistory,
} from "@/lib/actions/notifications";

// Get recent notifications
const history = await getNotificationHistory(10, 0);

// Mark as read
await markNotificationsAsRead(["notif-1", "notif-2"]);

// Search notifications
const results = await searchNotificationHistory("campaign", {
  channel: "email",
  status: "delivered",
});
```

### Schedule Management

```typescript
import {
  upsertNotificationSchedule,
  getNextScheduledNotifications,
} from "@/lib/actions/notifications";

// Create weekly report schedule
await upsertNotificationSchedule({
  type: "weeklyReports",
  schedule: {
    frequency: "weekly",
    dayOfWeek: 1, // Monday
    time: "09:00",
    timezone: "America/New_York",
  },
  enabled: true,
});

// Get upcoming notifications
const upcoming = await getNextScheduledNotifications();
```

## Migration from Legacy Code

The original `notificationActions.ts` file has been updated to re-export all functions from the new module structure, ensuring backward compatibility. However, new code should import from the specific modules:

```typescript
// Old (still works)
import { getNotificationPreferences } from "@/lib/actions/notifications";

// New (recommended)
import { getNotificationPreferences } from "@/lib/actions/notifications";
```

## Type Safety

All functions maintain strict TypeScript typing with:

- Proper return types using `ActionResult<T>`
- Input validation with detailed error messages
- Type-safe preference structures
- Comprehensive interface definitions

## Performance Considerations

- **Rate Limiting**: Prevents abuse and ensures system stability
- **Pagination**: Efficient handling of large notification histories
- **Caching**: Ready for caching layer integration
- **Validation**: Early validation prevents unnecessary database operations
- **Modular Loading**: Dynamic imports reduce initial bundle size

## Future Enhancements

The modular structure supports easy extension for:

- Real-time notification delivery
- Advanced filtering and search
- Notification templates
- A/B testing for notification content
- Analytics and reporting
- Integration with external notification services

## Dependencies

- Core action utilities (`lib/actions/core/`)
- Authentication utilities (`lib/utils/auth`)
- Notification mock data (`lib/data/notifications.mock`)
- Settings types (`types/settings`)

## Testing

Run the test suite:

```bash
npm test lib/actions/notifications/__tests__/utils.test.ts
```

The test suite includes:

- 19 passing tests
- Utility function validation
- Data conversion consistency
- Input validation scenarios
- Edge case handling
