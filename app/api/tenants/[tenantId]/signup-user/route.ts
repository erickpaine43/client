import { NextResponse } from 'next/server';
import { withTenantAccess } from '@/lib/niledb/middleware';
import { getAuthService } from '@/lib/niledb/auth';
import { getNileClient } from '@/lib/niledb/client';
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

    // Use NileDB transaction to ensure atomicity of user profile creation and tenant assignment
    const nile = getNileClient();
    const { db } = nile;
    const client = await db.client();

    let newUser = null;
    let userCreated = false;

    try {
      await client.query('BEGIN');

      // 1. Sign up the new user in NileDB (cannot be rolled back if it succeeds)
      newUser = await authService.signUp({
        email,
        password,
        name,
        givenName,
        familyName,
      });

      if (!newUser || !newUser.id) {
        throw new Error('Failed to create new user during signup');
      }

      userCreated = true;

      // 2. Create a user profile for the new user (within transaction)
      await client.query(
        `
        INSERT INTO public.user_profiles (
          user_id,
          role,
          is_penguinmails_staff,
          preferences,
          last_login_at
        )
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        `,
        [
          newUser.id,
          'user', // Default role for new signups
          false, // isPenguinMailsStaff
          {} // preferences
        ]
      );

      // 3. Add the new user to the current tenant (within transaction)
      await client.query(
        `
        INSERT INTO users.tenant_users (tenant_id, user_id, email, roles)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (tenant_id, user_id) DO UPDATE SET
          roles = EXCLUDED.roles,
          updated = CURRENT_TIMESTAMP,
          deleted = NULL
        `,
        [tenantId, newUser.id, newUser.email, roles]
      );

      // Commit the transaction
      await client.query('COMMIT');

    } catch (error) {
      // Rollback the transaction
      await client.query('ROLLBACK');

      // If user was created but transaction failed, we need cleanup
      // Note: NileDB auth signup might not be reversible, so we log this issue
      if (userCreated) {
        console.warn('Transaction failed after user creation. User created but not fully set up:', {
          userId: newUser?.id,
          email: newUser?.email,
          tenantId
        });
        // Consider implementing user deletion logic here if NileDB supports it
      }

      throw error; // Re-throw the original error
    } finally {
      // Always release the client back to the pool
      await client.release();
    }

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
