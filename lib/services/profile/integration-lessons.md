# Profile Integration Lessons Learned

## Overview

This document captures key lessons learned from integrating NileDB with the ProfilePage component, including server action patterns, authentication integration, and user experience optimizations.

## NileDB Integration Lessons

### Server Action Architecture

**Challenge**: Replacing placeholder profile functionality with real NileDB integration while maintaining security and user experience.

**Solution**: Next.js server actions with proper error handling and type safety.

```typescript
// lib/actions/profileActions.ts
export async function getUserProfile(): Promise<ActionResult<NileUser>> {
  try {
    const user = await nile.users.getSelf();

    if (!user) {
      return {
        success: false,
        error: {
          type: "auth",
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Failed to fetch user profile:", error);

    return {
      success: false,
      error: {
        type: "server",
        message: "Failed to fetch user profile",
        code: "PROFILE_FETCH_ERROR",
        details: { originalError: error.message },
      },
    };
  }
}
```

**Key Lessons**:

1. **Server-side validation** - All profile operations must be validated server-side
2. **Structured error responses** - Consistent error format across all profile actions
3. **Proper logging** - Log errors server-side without exposing sensitive information to client
4. **Type safety** - Use proper TypeScript interfaces for NileDB responses

### Data Mapping Patterns

**Challenge**: Mapping between NileDB user object structure and form data structure.

**NileDB User Structure**:

```typescript
interface NileUser {
  id: string;
  email: string;
  name?: string; // Display name
  familyName?: string; // Last name
  givenName?: string; // First name
  picture?: string; // Avatar URL
  created: string;
  updated?: string;
  emailVerified?: boolean;
  tenants: { id: string }[];
}
```

**Form Data Structure**:

```typescript
interface ProfileFormData {
  firstName: string; // Maps to givenName
  lastName: string; // Maps to familyName
  name: string; // Maps to name (display name)
  email: string; // Read-only from user data
  avatarUrl: string; // Maps to picture
}
```

**Mapping Implementation**:

```typescript
export const mapNileUserToFormData = (user: NileUser): ProfileFormData => ({
  firstName: user.givenName || "",
  lastName: user.familyName || "",
  name: user.name || "",
  email: user.email,
  avatarUrl: user.picture || "",
});

export const mapFormDataToNileUpdate = (formData: ProfileFormData) => ({
  name: formData.name.trim(),
  givenName: formData.firstName.trim(),
  familyName: formData.lastName.trim(),
  picture: formData.avatarUrl.trim() || undefined, // Don't send empty strings
});
```

**Lessons Learned**:

1. **Handle optional fields** - NileDB fields are optional, form fields should have defaults
2. **Data sanitization** - Trim whitespace and handle empty strings appropriately
3. **Bidirectional mapping** - Need both directions for form population and updates
4. **Validation consistency** - Validate data at both form and server levels

## Authentication Integration Lessons

### AuthContext Integration

**Challenge**: Integrating profile updates with existing AuthContext to maintain consistent user state.

**Solution**: Update AuthContext after successful profile changes.

```typescript
// In ProfilePage component
export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: ProfileFormData) => {
    setIsSubmitting(true);

    try {
      const result = await updateUserProfile(mapFormDataToNileUpdate(formData));

      if (result.success) {
        // Update AuthContext with fresh user data
        await refreshUser();

        toast.success('Profile updated successfully');
      } else {
        toast.error(result.error?.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use AuthContext user as fallback during loading
  const displayUser = profileData || user;

  return (
    <ProfileForm
      initialData={displayUser ? mapNileUserToFormData(displayUser) : undefined}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
```

**Key Lessons**:

1. **State synchronization** - Keep AuthContext and profile data in sync
2. **Fallback data** - Use AuthContext user data during loading states
3. **Optimistic updates** - Update UI immediately, rollback on error
4. **Loading states** - Provide clear feedback during async operations

### Session Management

**Lesson**: Handle authentication edge cases gracefully.

```typescript
export async function updateUserProfile(
  profileData: Partial<NileUser>
): Promise<ActionResult<NileUser>> {
  try {
    // Verify user is authenticated
    const currentUser = await nile.users.getSelf();
    if (!currentUser) {
      return {
        success: false,
        error: {
          type: "auth",
          message: "Authentication required",
          code: "AUTH_REQUIRED",
        },
      };
    }

    // Update profile
    const updatedUser = await nile.users.updateSelf(profileData);

    return { success: true, data: updatedUser };
  } catch (error) {
    // Handle specific NileDB errors
    if (error.status === 401) {
      return {
        success: false,
        error: {
          type: "auth",
          message: "Session expired. Please log in aga",
          code: "SESSION_EXPIRED",
        },
      };
    }

    if (error.status === 403) {
      return {
        success: false,
        error: {
          type: "auth",
          message: "Insufficient permissions",
          code: "INSUFFICIENT_PERMISSIONS",
        },
      };
    }

    return {
      success: false,
      error: {
        type: "server",
        message: "Failed to update profile",
        code: "PROFILE_UPDATE_ERROR",
      },
    };
  }
}
```

## User Experience Lessons

### Loading State Management

**Challenge**: Providing smooth user experience during async operations.

**Solution**: Progressive loading with skeleton states.

```typescript
export function ProfilePage() {
  const [profileData, setProfileData] = useState<NileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      const result = await getUserProfile();

      if (result.success) {
        setProfileData(result.data);
      } else {
        setError(result.error?.message || 'Failed to load profile');
      }

      setIsLoading(false);
    };

    loadProfile();
  }, []);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return <ProfileForm data={profileData} />;
}

// Skeleton component for loading state
function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse" />
        <div className="space-y-2">
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-48 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="w-full h-10 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
```

**Lessons Learned**:

1. **Progressive loading** - Show skeleton while loading, then populate with data
2. **Error recovery** - Provide retry mechanisms for failed operations
3. **Loading indicators** - Clear visual feedback for all async operations
4. **Graceful degradation** - Handle partial data gracefully

### Form Validation and UX

**Challenge**: Providing real-time validation feedback while maintaining good UX.

**Solution**: Client-side validation with server-side verification.

```typescript
export function ProfileForm({ initialData, onSubmit, isSubmitting }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>(
    initialData || getEmptyFormData()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.length > 50) return 'First name must be less than 50 characters';
        return null;

      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.length > 50) return 'Last name must be less than 50 characters';
        return null;

      case 'name':
        if (!value.trim()) return 'Display name is required';
        if (value.length > 100) return 'Display name must be less than 100 characters';
        return null;

      case 'avatarUrl':
        if (value && !isValidUrl(value)) return 'Please enter a valid URL';
        return null;

      default:
        return null;
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validate field if it's been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error || '' }));
    }
  };

  const handleFieldBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="First Name"
        name="firstName"
        value={formData.firstName}
        onChange={handleFieldChange}
        onBlur={handleFieldBlur}
        error={touched.firstName ? errors.firstName : undefined}
        required
      />

      <FormField
        label="Last Name"
        name="lastName"
        value={formData.lastName}
        onChange={handleFieldChange}
        onBlur={handleFieldBlur}
        error={touched.lastName ? errors.lastName : undefined}
        required
      />

      <button
        type="submit"
        disabled={isSubmitting || Object.values(errors).some(Boolean)}
        className="btn-primary"
      >
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
```

**Lessons Learned**:

1. **Real-time validation** - Validate fields as user types, but only show errors after blur
2. **Clear error messages** - Specific, actionable error messages
3. **Disabled states** - Disable submit button when form is invalid or submitting
4. **Visual feedback** - Clear indication of required fields and validation state

## Error Handling Patterns

### Comprehensive Error Categories

**Lesson**: Handle different types of errors with appropriate user messaging.

```typescript
export function useProfileActions() {
  const handleError = (error: ActionError) => {
    switch (error.type) {
      case "auth":
        if (error.code === "SESSION_EXPIRED") {
          toast.error("Your session has expired. Please log in again.");
          // Redirect to login
          window.location.href = "/login";
        } else {
          toast.error("Authentication required. Please log in.");
        }
        break;

      case "validation":
        toast.error(`Validation error: ${error.message}`);
        // Highlight specific field if provided
        if (error.field) {
          highlightField(error.field);
        }
        break;

      case "network":
        toast.error(
          "Network error. Please check your connection and try again."
        );
        break;

      case "server":
        toast.error("Server error. Please try again later.");
        break;

      case "rate_limit":
        toast.error("Too many requests. Please wait a moment and try again.");
        break;

      default:
        toast.error("An unexpected error occurred.");
    }
  };

  return { handleError };
}
```

### Retry Mechanisms

**Lesson**: Implement smart retry logic for transient failures.

```typescript
export async function updateProfileWithRetry(
  profileData: Partial<NileUser>,
  maxRetries: number = 3
): Promise<ActionResult<NileUser>> {
  let lastError: ActionError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await updateUserProfile(profileData);

    if (result.success) {
      return result;
    }

    lastError = result.error!;

    // Don't retry auth or validation errors
    if (lastError.type === "auth" || lastError.type === "validation") {
      break;
    }

    // Don't retry on last attempt
    if (attempt === maxRetries) {
      break;
    }

    // Wait before retry (exponential backoff)
    await new Promise((resolve) =>
      setTimeout(resolve, Math.pow(2, attempt) * 1000)
    );
  }

  return {
    success: false,
    error: {
      ...lastError,
      message: `${lastError.message} (after ${maxRetries + 1} attempts)`,
    },
  };
}
```

## Testing Lessons

### Server Action Testing

**Lesson**: Test server actions with proper mocking and error scenarios.

```typescript
// __tests__/profileActions.test.ts
import { getUserProfile, updateUserProfile } from "../profileActions";

// Mock NileDB
jest.mock("@niledatabase/server", () => ({
  nile: {
    users: {
      getSelf: jest.fn(),
      updateSelf: jest.fn(),
    },
  },
}));

describe("Profile Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserProfile", () => {
    it("should return user profile successfully", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        givenName: "Test",
        familyName: "User",
      };

      (nile.users.getSelf as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserProfile();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
    });

    it("should handle user not found", async () => {
      (nile.users.getSelf as jest.Mock).mockResolvedValue(null);

      const result = await getUserProfile();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe("auth");
      expect(result.error?.code).toBe("USER_NOT_FOUND");
    });

    it("should handle NileDB errors", async () => {
      (nile.users.getSelf as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const result = await getUserProfile();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe("server");
    });
  });
});
```

### Component Integration Testing

**Lesson**: Test component integration with server actions using React Testing Library.

```typescript
// __tests__/ProfilePage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfilePage } from '../ProfilePage';
import * as profileActions from '../profileActions';

jest.mock('../profileActions');

describe('ProfilePage', () => {
  it('should load and display user profile', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      givenName: 'Test',
      familyName: 'User'
    };

    (profileActions.getUserProfile as jest.Mock).mockResolvedValue({
      success: true,
      data: mockUser
    });

    render(<ProfilePage />);

    // Should show loading initially
    expect(screen.getByTestId('profile-skeleton')).toBeInTheDocument();

    // Should show form after loading
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
      expect(screen.getByDisplayValue('User')).toBeInTheDocument();
    });
  });

  it('should handle profile update', async () => {
    // Setup initial load
    (profileActions.getUserProfile as jest.Mock).mockResolvedValue({
      success: true,
      data: { givenName: 'Test', familyName: 'User' }
    });

    // Setup update
    (profileActions.updateUserProfile as jest.Mock).mockResolvedValue({
      success: true,
      data: { givenName: 'Updated', familyName: 'User' }
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
    });

    // Update first name
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'Updated' }
    });

    // Submit form
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(profileActions.updateUserProfile).toHaveBeenCalledWith({
        givenName: 'Updated',
        familyName: 'User'
      });
    });
  });
});
```

## Key Takeaways

1. **Server Action Security**: Always validate and sanitize data server-side, never trust client input

2. **Data Mapping**: Create clear, bidirectional mapping functions between external APIs and internal data structures

3. **Error Handling**: Implement comprehensive error handling with specific error types and user-friendly messages

4. **State Management**: Keep AuthContext and profile data synchronized for consistent user experience

5. **Loading States**: Provide clear visual feedback during all async operations with skeleton loading

6. **Form Validation**: Implement both client-side and server-side validation with real-time feedback

7. **Retry Logic**: Implement smart retry mechanisms for transient failures, but not for auth/validation errors

8. **Testing Strategy**: Test both server actions and component integration with proper mocking

9. **User Experience**: Focus on progressive loading, clear error messages, and graceful degradation

10. **Authentication Integration**: Handle session expiration and authentication edge cases gracefully

These lessons provide a solid foundation for integrating external services with React components while maintaining security, performance, and user experience standards.
