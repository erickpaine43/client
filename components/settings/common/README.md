# Settings Common Components

This directory contains comprehensive error states, loading indicators, and success notifications for all settings components, implementing task 14 from the settings integration specification.

## Components Overview

### 1. SettingsLoadingSkeleton

A comprehensive loading skeleton component that provides consistent loading states across all settings pages.

**Variants:**

- `form` - For form-based settings pages
- `table` - For table-based components (team management)
- `cards` - For card-based layouts (billing, usage)
- `profile` - For profile settings with avatar selector
- `notifications` - For notification preferences
- `security` - For security recommendations
- `appearance` - For appearance settings

**Usage:**

```tsx
import { SettingsLoadingSkeleton } from "@/components/settings/common";

// Basic form loading
<SettingsLoadingSkeleton variant="form" itemCount={4} />

// Table loading with header
<SettingsLoadingSkeleton variant="table" showHeader={true} itemCount={5} />

// Profile loading
<SettingsLoadingSkeleton variant="profile" />
```

### 2. SettingsErrorState

A comprehensive error handling component that provides consistent error states with retry mechanisms.

**Error Types:**

- `network` - Connection/network errors
- `auth` - Authentication errors
- `validation` - Input validation errors
- `server` - Server-side errors
- `permission` - Permission denied errors
- `timeout` - Request timeout errors
- `generic` - General errors

**Variants:**

- `alert` - Standard alert format (default)
- `card` - Card-based error display
- `inline` - Inline error display

**Features:**

- Automatic retry mechanisms
- Error type-specific icons and styling
- Retry count tracking
- Network-specific recovery options
- Contextual help text

**Usage:**

```tsx
import { SettingsErrorState } from "@/components/settings/common";

<SettingsErrorState
  error="Failed to load settings"
  errorType="network"
  onRetry={() => refetch()}
  retryLoading={isRetrying}
  canRetry={retryCount < 3}
  variant="card"
  showDetails
/>;
```

### 3. SettingsSuccessNotification

Comprehensive success notification system using Sonner toast library.

**Success Types:**

- `save` - General save operations
- `update` - Update operations
- `create` - Create operations
- `delete` - Delete operations
- `upload` - File upload operations
- `invite` - Team invitations
- `generic` - General success

**Specialized Functions:**

- `showProfileUpdateSuccess()`
- `showNotificationPreferencesSuccess()`
- `showBillingUpdateSuccess()`
- `showSecurityUpdateSuccess()`
- `showAppearanceUpdateSuccess()`
- `showTeamMemberSuccess(action, memberName)`

**Usage:**

```tsx
import {
  showSaveSuccess,
  showTeamMemberSuccess,
} from "@/components/settings/common";

// Simple save success
showSaveSuccess("Settings saved successfully");

// Team member action
showTeamMemberSuccess("added", "John Doe");
```

### 4. SettingsPageWrapper

Page-level wrapper components that provide consistent layout, error boundaries, and offline indicators.

**Specialized Wrappers:**

- `ProfilePageWrapper`
- `NotificationsPageWrapper`
- `BillingPageWrapper`
- `TeamPageWrapper`
- `SecurityPageWrapper`
- `AppearancePageWrapper`

**Features:**

- Automatic error boundaries
- Offline status indicators
- Consistent page headers
- Suspense boundaries with appropriate loading states

**Usage:**

```tsx
import { ProfilePageWrapper } from "@/components/settings/common";

<ProfilePageWrapper>
  <ProfileForm />
</ProfilePageWrapper>;
```

## Implementation Examples

### Updated Components

The following components have been updated to use the new error states and loading indicators:

1. **BillingSettings.tsx**
   - Added loading states for billing data fetching
   - Implemented error handling with retry mechanisms
   - Added success notifications for plan changes and payment updates

2. **AppearanceSettings.tsx**
   - Added loading states for preference loading
   - Implemented error handling for sync failures
   - Added success notifications for all preference updates
   - Added loading indicators for individual preference changes

3. **SecurityRecommendations.tsx**
   - Added loading states for security data fetching
   - Implemented error handling with refresh functionality
   - Added dynamic security recommendations from server
   - Added success notifications for security updates

4. **ComplianceSettings.tsx**
   - Added comprehensive loading states
   - Implemented error handling with retry mechanisms
   - Added form validation error handling
   - Added success notifications for compliance updates

5. **AccountSettings.tsx**
   - Added loading states for profile data fetching
   - Implemented error handling for profile loading failures
   - Added proper error boundaries

6. **NotificationsSettings.tsx** (already had good patterns)
   - Enhanced with consistent error types
   - Improved success notification patterns

7. **TeamMembersTable.tsx** (already had good patterns)
   - Enhanced with consistent loading skeleton
   - Improved error state consistency

## Error Handling Patterns

### Server Action Integration

All components now integrate with the `useServerAction` hook for consistent error handling:

```tsx
const dataAction = useServerAction(() => fetchData(), {
  onError: (error) => {
    console.error("Failed to load data:", error);
  },
});

// Loading state
if (dataAction.loading && !dataAction.data) {
  return <SettingsLoadingSkeleton variant="form" />;
}

// Error state
if (dataAction.error) {
  return (
    <SettingsErrorState
      error={dataAction.error}
      errorType="network"
      onRetry={() => dataAction.execute()}
      retryLoading={dataAction.loading}
      canRetry={dataAction.canRetry}
      variant="card"
      showDetails
    />
  );
}
```

### Form Validation Errors

Field-specific validation errors are handled through form state:

```tsx
if (result.field) {
  form.setError(result.field as keyof FormValues, {
    message: result.error,
  });
} else {
  // Show general error toast
}
```

### Success Notifications

Consistent success patterns across all settings:

```tsx
const handleSave = async (data) => {
  try {
    const result = await saveSettings(data);
    if (result.success) {
      showSaveSuccess("Settings updated successfully");
    }
  } catch (error) {
    // Error handling
  }
};
```

## Offline Support

All components include offline status awareness:

- Offline indicators when connection is lost
- Automatic retry when connection is restored
- Graceful degradation of functionality
- Clear messaging about offline limitations

## Accessibility Features

- Proper ARIA labels for loading states
- Screen reader friendly error messages
- Keyboard navigation support for retry buttons
- High contrast error state indicators
- Focus management during state transitions

## Performance Considerations

- Lazy loading of components with Suspense
- Efficient skeleton loading patterns
- Debounced retry mechanisms
- Optimistic updates where appropriate
- Minimal re-renders during loading states

## Testing Considerations

Components are designed to be easily testable:

- Clear loading/error/success states
- Predictable retry mechanisms
- Mockable server actions
- Isolated error boundaries
- Consistent prop interfaces

## Migration Guide

To update existing settings components:

1. Import the common components:

   ```tsx
   import {
     SettingsLoadingSkeleton,
     SettingsErrorState,
     showSaveSuccess,
   } from "@/components/settings/common";
   ```

2. Add loading states:

   ```tsx
   if (loading) {
     return <SettingsLoadingSkeleton variant="form" />;
   }
   ```

3. Add error states:

   ```tsx
   if (error) {
     return (
       <SettingsErrorState
         error={error}
         errorType="network"
         onRetry={retry}
         variant="card"
       />
     );
   }
   ```

4. Add success notifications:

   ```tsx
   const handleSave = async () => {
     // ... save logic
     showSaveSuccess();
   };
   ```

5. Wrap with page wrapper:
   ```tsx
   <SettingsPageWrapper loadingVariant="form">
     {/* Your component */}
   </SettingsPageWrapper>
   ```

This implementation provides a comprehensive foundation for consistent error states, loading indicators, and success notifications across all settings components, meeting all requirements of task 14.
