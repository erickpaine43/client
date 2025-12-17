# Team Management Actions

## Overview

This module contains server actions for team management functionality, including team member management, role assignments, permissions, and team settings. All actions follow the established patterns for type safety, error handling, and validation.

## Actions

### Team Member Management

#### `addTeamMember`

Adds a new member to the team with specified role and permissions.

```typescript
interface AddTeamMemberArgs {
  email: string;
  role: TeamRole;
  permissions: TeamPermission[];
  sendInvitation: boolean;
}

export async function addTeamMember(
  args: AddTeamMemberArgs
): Promise<ActionResult<TeamMember>> {
  // Implementation
}
```

#### `removeTeamMember`

Removes a team member and handles cleanup of their resources.

```typescript
interface RemoveTeamMemberArgs {
  memberId: string;
  transferResourcesTo?: string;
}

export async function removeTeamMember(
  args: RemoveTeamMemberArgs
): Promise<ActionResult<void>> {
  // Implementation
}
```

#### `updateTeamMemberRole`

Updates a team member's role and associated permissions.

```typescript
interface UpdateTeamMemberRoleArgs {
  memberId: string;
  newRole: TeamRole;
  permissions: TeamPermission[];
}

export async function updateTeamMemberRole(
  args: UpdateTeamMemberRoleArgs
): Promise<ActionResult<TeamMember>> {
  // Implementation
}
```

### Team Settings

#### `updateTeamSettings`

Updates team-wide settings and preferences.

```typescript
interface UpdateTeamSettingsArgs {
  settings: Partial<TeamSettings>;
}

export async function updateTeamSettings(
  args: UpdateTeamSettingsArgs
): Promise<ActionResult<TeamSettings>> {
  // Implementation
}
```

#### `getTeamSettings`

Retrieves current team settings.

```typescript
export async function getTeamSettings(): Promise<ActionResult<TeamSettings>> {
  // Implementation
}
```

### Invitations

#### `sendTeamInvitation`

Sends an invitation to join the team.

```typescript
interface SendTeamInvitationArgs {
  email: string;
  role: TeamRole;
  message?: string;
}

export async function sendTeamInvitation(
  args: SendTeamInvitationArgs
): Promise<ActionResult<TeamInvitation>> {
  // Implementation
}
```

#### `acceptTeamInvitation`

Accepts a team invitation and creates the team member record.

```typescript
interface AcceptTeamInvitationArgs {
  invitationToken: string;
}

export async function acceptTeamInvitation(
  args: AcceptTeamInvitationArgs
): Promise<ActionResult<TeamMember>> {
  // Implementation
}
```

#### `revokeTeamInvitation`

Revokes a pending team invitation.

```typescript
interface RevokeTeamInvitationArgs {
  invitationId: string;
}

export async function revokeTeamInvitation(
  args: RevokeTeamInvitationArgs
): Promise<ActionResult<void>> {
  // Implementation
}
```

## Types

### Core Types

```typescript
interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  email: string;
  role: TeamRole;
  permissions: TeamPermission[];
  status: "active" | "inactive" | "pending";
  joinedAt: Date;
  lastActiveAt: Date;
}

interface TeamSettings {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  timezone: string;
  defaultRole: TeamRole;
  allowSelfRegistration: boolean;
  requireEmailVerification: boolean;
  maxMembers: number;
  features: TeamFeature[];
}

interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  status: "pending" | "accepted" | "expired" | "revoked";
  createdAt: Date;
}
```

### Enums

```typescript
enum TeamRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
  VIEWER = "viewer",
}

enum TeamPermission {
  MANAGE_TEAM = "manage_team",
  MANAGE_CAMPAIGNS = "manage_campaigns",
  MANAGE_DOMAINS = "manage_domains",
  MANAGE_TEMPLATES = "manage_templates",
  VIEW_ANALYTICS = "view_analytics",
  MANAGE_BILLING = "manage_billing",
}

enum TeamFeature {
  ADVANCED_ANALYTICS = "advanced_analytics",
  CUSTOM_DOMAINS = "custom_domains",
  API_ACCESS = "api_access",
  PRIORITY_SUPPORT = "priority_support",
}
```

## Usage Examples

### Adding a Team Member

```typescript
import { addTeamMember } from "@/lib/actions/team";

const handleAddMember = async (email: string, role: TeamRole) => {
  const result = await addTeamMember({
    email,
    role,
    permissions: getDefaultPermissions(role),
    sendInvitation: true,
  });

  if (result.success) {
    console.log("Team member added:", result.data);
  } else {
    console.error("Failed to add team member:", result.error);
  }
};
```

### Updating Team Settings

```typescript
import { updateTeamSettings } from "@/lib/actions/team";

const handleUpdateSettings = async (settings: Partial<TeamSettings>) => {
  const result = await updateTeamSettings({ settings });

  if (result.success) {
    console.log("Team settings updated:", result.data);
  } else {
    console.error("Failed to update settings:", result.error);
  }
};
```

### Managing Invitations

```typescript
import { sendTeamInvitation, revokeTeamInvitation } from "@/lib/actions/team";

const handleSendInvitation = async (email: string, role: TeamRole) => {
  const result = await sendTeamInvitation({
    email,
    role,
    message: "Welcome to our team!",
  });

  if (result.success) {
    console.log("Invitation sent:", result.data);
  } else {
    console.error("Failed to send invitation:", result.error);
  }
};

const handleRevokeInvitation = async (invitationId: string) => {
  const result = await revokeTeamInvitation({ invitationId });

  if (result.success) {
    console.log("Invitation revoked");
  } else {
    console.error("Failed to revoke invitation:", result.error);
  }
};
```

## Validation

### Input Validation

```typescript
import { z } from "zod";

const addTeamMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(TeamRole),
  permissions: z.array(z.nativeEnum(TeamPermission)),
  sendInvitation: z.boolean(),
});

const updateTeamSettingsSchema = z.object({
  settings: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    timezone: z.string().optional(),
    defaultRole: z.nativeEnum(TeamRole).optional(),
    allowSelfRegistration: z.boolean().optional(),
    requireEmailVerification: z.boolean().optional(),
    maxMembers: z.number().min(1).max(1000).optional(),
  }),
});
```

### Permission Validation

```typescript
function validateTeamPermissions(
  currentUser: TeamMember,
  targetMember: TeamMember,
  action: string
): boolean {
  // Owners can do anything
  if (currentUser.role === TeamRole.OWNER) {
    return true;
  }

  // Admins can manage members but not other admins or owners
  if (currentUser.role === TeamRole.ADMIN) {
    if (
      targetMember.role === TeamRole.OWNER ||
      targetMember.role === TeamRole.ADMIN
    ) {
      return false;
    }
    return currentUser.permissions.includes(TeamPermission.MANAGE_TEAM);
  }

  // Members and viewers cannot manage team
  return false;
}
```

## Error Handling

### Common Error Types

```typescript
enum TeamActionError {
  INSUFFICIENT_PERMISSIONS = "insufficient_permissions",
  MEMBER_NOT_FOUND = "member_not_found",
  INVITATION_EXPIRED = "invitation_expired",
  MEMBER_LIMIT_REACHED = "member_limit_reached",
  INVALID_ROLE = "invalid_role",
  EMAIL_ALREADY_INVITED = "email_already_invited",
  CANNOT_REMOVE_OWNER = "cannot_remove_owner",
}
```

### Error Handling Examples

```typescript
export async function addTeamMember(
  args: AddTeamMemberArgs
): Promise<ActionResult<TeamMember>> {
  try {
    // Validate permissions
    const currentUser = await getCurrentTeamMember();
    if (!validateTeamPermissions(currentUser, null, "add_member")) {
      return {
        success: false,
        error: {
          code: TeamActionError.INSUFFICIENT_PERMISSIONS,
          message: "You do not have permission to add team members",
        },
      };
    }

    // Check member limit
    const currentMemberCount = await getTeamMemberCount();
    const teamSettings = await getTeamSettings();

    if (currentMemberCount >= teamSettings.maxMembers) {
      return {
        success: false,
        error: {
          code: TeamActionError.MEMBER_LIMIT_REACHED,
          message: "Team member limit reached",
        },
      };
    }

    // Check if email is already invited
    const existingInvitation = await getInvitationByEmail(args.email);
    if (existingInvitation && existingInvitation.status === "pending") {
      return {
        success: false,
        error: {
          code: TeamActionError.EMAIL_ALREADY_INVITED,
          message: "This email address already has a pending invitation",
        },
      };
    }

    // Create team member or invitation
    const result = await createTeamMemberOrInvitation(args);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "unknown_error",
        message: error.message,
      },
    };
  }
}
```

## Testing

### Unit Tests

```typescript
import { addTeamMember, updateTeamMemberRole } from "../team-actions";
import { TeamRole, TeamPermission } from "../types";

describe("Team Actions", () => {
  describe("addTeamMember", () => {
    it("should add a team member with valid permissions", async () => {
      const args = {
        email: "test@example.com",
        role: TeamRole.MEMBER,
        permissions: [TeamPermission.VIEW_ANALYTICS],
        sendInvitation: true,
      };

      const result = await addTeamMember(args);

      expect(result.success).toBe(true);
      expect(result.data?.email).toBe("test@example.com");
      expect(result.data?.role).toBe(TeamRole.MEMBER);
    });

    it("should fail when user lacks permissions", async () => {
      // Mock current user as viewer
      mockCurrentUser({ role: TeamRole.VIEWER });

      const args = {
        email: "test@example.com",
        role: TeamRole.MEMBER,
        permissions: [],
        sendInvitation: true,
      };

      const result = await addTeamMember(args);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("insufficient_permissions");
    });
  });

  describe("updateTeamMemberRole", () => {
    it("should update team member role", async () => {
      const args = {
        memberId: "member-123",
        newRole: TeamRole.ADMIN,
        permissions: [
          TeamPermission.MANAGE_TEAM,
          TeamPermission.VIEW_ANALYTICS,
        ],
      };

      const result = await updateTeamMemberRole(args);

      expect(result.success).toBe(true);
      expect(result.data?.role).toBe(TeamRole.ADMIN);
    });
  });
});
```

## Best Practices

1. **Permission Validation**: Always validate user permissions before performing team actions
2. **Audit Logging**: Log all team management actions for security and compliance
3. **Email Validation**: Validate email addresses before sending invitations
4. **Resource Cleanup**: Handle resource transfer when removing team members
5. **Rate Limiting**: Implement rate limiting for invitation sending
6. **Expiration Handling**: Set appropriate expiration times for invitations

## Related Documentation

- [Team Types](../../../types/team.ts)
- [Authentication Patterns](../../../docs/development/authentication.md)
- [Action Patterns](../README.md)
- [Settings Actions](../settings/README.md)
