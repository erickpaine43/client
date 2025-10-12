import { NextResponse } from 'next/server';
import { withTenantAccess } from '@/lib/niledb/middleware';
import { getTenantService } from '@/lib/niledb/tenant';
import { getAuthService } from '@/lib/niledb/auth';
import { z } from 'zod';

// Validation schema for signing up a new user and adding to tenant
const SignUpUserToTenantSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().optional(),
  givenName: z.string().optional(),
  familyName: z.string().optional(),
  roles: z.array(z.string()).default(['member']),
});

/**
 * POST /api/tenants/[tenantId]/signup-user
 * Sign up a new user and add them to the tenant (admin access required)
 */
export const POST = withTenantAccess('admin')(async (request, context) => {
  try {
    const tenantService = getTenantService();
    const authService = getAuthService();
    const { tenantId } = await context.params;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = SignUpUserToTenantSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, password, name, givenName, familyName, roles } = validationResult.data;

    // 1. Sign up the new user in NileDB
    const newUser = await authService.signUp({
      email,
      password,
      name,
      givenName,
      familyName,
    });

    if (!newUser || !newUser.id) {
      throw new Error('Failed to create new user during signup');
    }

    // 2. Create a user profile for the new user
    await authService.createUserProfile(newUser.id, {
      role: 'user', // Default role for new signups
      isPenguinMailsStaff: false,
    });

    // 3. Add the new user to the current tenant
    await tenantService.addUserToTenant(
      newUser.id,
      tenantId,
      roles,
      request.user.id // User performing the action
    );

    return NextResponse.json(
      {
        message: 'User signed up and added to tenant successfully',
        userId: newUser.id,
        email: newUser.email,
        tenantId,
        roles,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to sign up user and add to tenant:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to sign up user and add to tenant',
        code: 'SIGNUP_ADD_USER_TO_TENANT_ERROR',
      },
      { status: 500 }
    );
  }
});
