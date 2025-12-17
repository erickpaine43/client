# Profile Service

## Overview

The Profile Service provides user profile management functionality, including fetching, updating, and validating user profile data. It integrates with NileDB for authentication and user data storage, following consistent patterns for server actions, error handling, and data validation.

## Architecture

### Core Components

- **Server Actions**: Handle profile operations server-side with proper validation and error handling
- **Data Mapping**: Bidirectional mapping between NileDB user objects and form data structures
- **Authentication Integration**: Seamless integration with AuthContext for state management
- **Form Validation**: Client-side validation with server-side verification
- **Error Handling**: Comprehensive error categorization and user-friendly messaging

### Key Features

- User profile fetching and updating
- Authentication state synchronization
- Real-time form validation
- Progressive loading states
- Comprehensive error handling with retry mechanisms

## API Reference

### Server Actions

#### `getUserProfile(): Promise<ActionResult<NileUser>>`

Fetches the current user's profile data from NileDB.

```typescript
const result = await getUserProfile();

if (result.success) {
  console.log('User profile:', result.data);
} else {
  console.error('Error:', result.error.message);
}
```

#### `updateUserProfile(profileData: Partial<NileUser>): Promise<ActionResult<NileUser>>`

Updates the current user's profile data.

```typescript
const result = await updateUserProfile({
  name: 'John Doe',
  givenName: 'John',
  familyName: 'Doe'
});

if (result.success) {
  console.log('Profile updated:', result.data);
}
```

### Data Types

#### `NileUser`

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

#### `ProfileFormData`

```typescript
interface ProfileFormData {
  firstName: string;
  lastName: string;
  name: string; // Display name
  email: string; // Read-only
  avatarUrl: string;
}
```

#### `ActionResult<T>`

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ActionError };
```

#### `ActionError`

```typescript
interface ActionError {
  type: 'auth' | 'validation' | 'network' | 'server' | 'rate_limit';
  message: string;
  code: string;
  field?: string; // For validation errors
  details?: any;
}
```

## Usage Examples

### Basic Profile Fetching

```typescript
import { getUserProfile } from '@/lib/actions/profileActions';

export function ProfilePage() {
  const [profile, setProfile] = useState<NileUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const result = await getUserProfile();
      if (result.success) {
        setProfile(result.data);
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  if (loading) return <ProfileSkeleton />;
  if (!profile) return <ErrorState message="Failed to load profile" />;

  return <ProfileForm initialData={mapNileUserToFormData(profile)} />;
}
```

### Profile Updates with Auth Sync

```typescript
import { updateUserProfile } from '@/lib/actions/profileActions';
import { useAuth } from '@/context/AuthContext';

export function ProfileForm({ initialData, onSuccess }) {
  const { refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: ProfileFormData) => {
    setIsSubmitting(true);

    try {
      const result = await updateUserProfile(
        mapFormDataToNileUpdate(formData)
      );

      if (result.success) {
        await refreshUser(); // Sync AuthContext
        onSuccess?.();
        toast.success('Profile updated successfully');
      } else {
        toast.error(result.error.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
```

## Data Mapping

### NileDB to Form Data

```typescript
export const mapNileUserToFormData = (user: NileUser): ProfileFormData => ({
  firstName: user.givenName || '',
  lastName: user.familyName || '',
  name: user.name || '',
  email: user.email,
  avatarUrl: user.picture || '',
});
```

### Form Data to NileDB Update

```typescript
export const mapFormDataToNileUpdate = (formData: ProfileFormData) => ({
  name: formData.name.trim(),
  givenName: formData.firstName.trim(),
  familyName: formData.lastName.trim(),
  picture: formData.avatarUrl.trim() || undefined,
});
```

## Error Handling

### Error Categories

- **auth**: Authentication-related errors (401, 403)
- **validation**: Form validation errors
- **network**: Network connectivity issues
- **server**: Server-side errors (500)
- **rate_limit**: Rate limiting errors

### Error Handling Hook

```typescript
import { useProfileActions } from '@/hooks/useProfileActions';

export function ProfileComponent() {
  const { handleError } = useProfileActions();

  const updateProfile = async (data) => {
    const result = await updateUserProfile(data);

    if (!result.success) {
      handleError(result.error);
    }
  };

  // Component JSX
}
```

## Validation Rules

### Field Validation

- **firstName**: Required, max 50 characters
- **lastName**: Required, max 50 characters
- **name**: Required, max 100 characters (display name)
- **avatarUrl**: Optional, must be valid URL if provided
- **email**: Read-only, validated by NileDB

### Client-Side Validation

```typescript
const validateField = (name: string, value: string): string | null => {
  switch (name) {
    case 'firstName':
    case 'lastName':
      if (!value.trim()) return `${name} is required`;
      if (value.length > 50) return `${name} must be less than 50 characters`;
      return null;

    case 'name':
      if (!value.trim()) return 'Display name is required';
      if (value.length > 100) return 'Display name must be less than 100 characters`;
      return null;

    case 'avatarUrl':
      if (value && !isValidUrl(value)) return 'Please enter a valid URL';
      return null;

    default:
      return null;
  }
};
```

## Testing

### Unit Tests

```typescript
describe('Profile Service', () => {
  describe('mapNileUserToFormData', () => {
    it('should map user data correctly', () => {
      const user: NileUser = {
        id: '1',
        email: 'john@example.com',
        givenName: 'John',
        familyName: 'Doe',
        name: 'John Doe',
        picture: 'https://example.com/avatar.jpg'
      };

      const result = mapNileUserToFormData(user);

      expect(result).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        email: 'john@example.com',
        avatarUrl: 'https://example.com/avatar.jpg'
      });
    });
  });
});
```

### Integration Tests

```typescript
describe('Profile Actions', () => {
  it('should update user profile', async () => {
    const mockUser = { id: '1', email: 'john@example.com' };
    // Mock NileDB calls
    const result = await updateUserProfile({ name: 'Updated Name' });

    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Updated Name');
  });
});
```

## Security Considerations

- All profile operations are performed server-side
- Authentication is verified before any operations
- Input validation prevents malicious data
- Sensitive information is not logged
- Rate limiting prevents abuse

## Performance

- Profile data is cached where appropriate
- Optimistic updates provide immediate UI feedback
- Progressive loading prevents layout shifts
- Retry mechanisms handle transient failures

## Lessons Learned

See [integration-lessons.md](./integration-lessons.md) for detailed lessons learned from implementing the profile service integration with NileDB.

## Related Documentation

- [Authentication Guide](../../docs/development/authentication.md)
- [Server Actions Best Practices](../../docs/development/README.md)
- [Error Handling Patterns](../../docs/development/README.md)
- [Form Validation Guide](../../docs/development/README.md)
