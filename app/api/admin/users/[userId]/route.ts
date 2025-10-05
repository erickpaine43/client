/**
 * Admin Individual User Management API Routes
 * 
 * GET /api/admin/users/[userId] - Get user details (staff only)
 * PUT /api/admin/users/[userId] - Update user (staff only)
 * 
 * These routes provide detailed user administration for staff users.
 */

import { NextResponse } from 'next/server';
import { withStaffAccess } from '@/lib/niledb/middleware';
import { withoutTenantContext } from '@/lib/niledb/client';
import { z } from 'zod';

// Validation schema for user updates
const UpdateUserSchema = z.object({
  name: z.string().min(1).max(255).trim().optional(),
  role: z.enum(['user', 'admin', 'super_admin']).optional(),
  is_penguinmails_staff: z.boolean().optional(),
});

/**
 * GET /api/admin/users/[userId]
 * Get user details (staff only)
 */
export const GET = withStaffAccess('admin')(async (request, context) => {
  try {
    const { userId } = context.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        {
          error: 'Invalid user ID format',
          code: 'INVALID_USER_ID',
        },
        { status: 400 }
      );
    }

    const user = await withoutTenantContext(async (nile) => {
      // Get user details with profile
      const userResult = await nile.db.query(
        `
        SELECT 
          u.id,
          u.email,
          u.name,
          u.given_name,
          u.family_name,
          u.picture,
          u.created,
          u.updated,
          u.email_verified,
          COALESCE(up.role, 'user') as role,
          COALESCE(up.is_penguinmails_staff, false) as is_penguinmails_staff,
          up.preferences,
          up.last_login_at,
          up.created_at as profile_created_at,
          up.updated_at as profile_updated_at
        FROM users.users u
        LEFT JOIN public.user_profiles up ON u.id = up.user_id AND up.deleted IS NULL
        WHERE u.id = $1
      `,
        [userId]
      );

      if (userResult.rows.length === 0) {
        return null;
      }

      const userData = userResult.rows[0];

      // Get user's tenants
      const tenantsResult = await nile.db.query(
        `
        SELECT 
          t.id,
          t.name,
          tu.roles,
          tu.created as joined_at
        FROM users.tenant_users tu
        JOIN public.tenants t ON tu.tenant_id = t.id
        WHERE tu.user_id = $1 AND tu.deleted IS NULL AND t.deleted IS NULL
        ORDER BY tu.created DESC
      `,
        [userId]
      );

      // Get user's companies
      const companiesResult = await nile.db.query(
        `
        SELECT 
          c.id,
          c.name,
          c.tenant_id,
          t.name as tenant_name,
          uc.role,
          uc.permissions,
          uc.created_at as joined_at
        FROM public.user_companies uc
        JOIN public.companies c ON uc.company_id = c.id
        JOIN public.tenants t ON c.tenant_id = t.id
        WHERE uc.user_id = $1 AND uc.deleted IS NULL AND c.deleted IS NULL AND t.deleted IS NULL
        ORDER BY uc.created_at DESC
      `,
        [userId]
      );

      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        givenName: userData.given_name,
        familyName: userData.family_name,
        picture: userData.picture,
        created: userData.created,
        updated: userData.updated,
        emailVerified: userData.email_verified,
        profile: {
          role: userData.role || 'user',
          isPenguinMailsStaff: userData.is_penguinmails_staff || false,
          preferences: userData.preferences || {},
          lastLoginAt: userData.last_login_at,
          createdAt: userData.profile_created_at,
          updatedAt: userData.profile_updated_at,
        },
        tenants: tenantsResult.rows,
        companies: companiesResult.rows,
        statistics: {
          tenantCount: tenantsResult.rows.length,
          companyCount: companiesResult.rows.length,
        },
      };
    });

    if (!user) {
      return NextResponse.json(
        {
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get user details:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve user details',
        code: 'ADMIN_USER_DETAILS_ERROR',
      },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/admin/users/[userId]
 * Update user (staff only)
 */
export const PUT = withStaffAccess('admin')(async (request, context) => {
  try {
    const { userId } = context.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        {
          error: 'Invalid user ID format',
          code: 'INVALID_USER_ID',
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = UpdateUserSchema.safeParse(body);

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

    const { name, role, is_penguinmails_staff } = validationResult.data;

    const updatedUser = await withoutTenantContext(async (nile) => {
      // Update user name if provided
      if (name !== undefined) {
        await nile.db.query(
          'UPDATE users.users SET name = $1, updated = NOW() WHERE id = $2',
          [name, userId]
        );
      }

      // Update or create user profile
      if (role !== undefined || is_penguinmails_staff !== undefined) {
        // Check if profile exists
        const profileCheck = await nile.db.query(
          'SELECT user_id FROM public.user_profiles WHERE user_id = $1 AND deleted IS NULL',
          [userId]
        );

        if (profileCheck.rows.length === 0) {
          // Create new profile
          await nile.db.query(
            `
            INSERT INTO public.user_profiles (user_id, role, is_penguinmails_staff, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
          `,
            [userId, role || 'user', is_penguinmails_staff || false]
          );
        } else {
          // Update existing profile
          const updateFields = [];
          const updateValues = [];
          let paramIndex = 1;

          if (role !== undefined) {
            updateFields.push(`role = $${paramIndex++}`);
            updateValues.push(role);
          }

          if (is_penguinmails_staff !== undefined) {
            updateFields.push(`is_penguinmails_staff = $${paramIndex++}`);
            updateValues.push(is_penguinmails_staff);
          }

          updateFields.push(`updated_at = NOW()`);
          updateValues.push(userId);

          await nile.db.query(
            `UPDATE public.user_profiles SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex}`,
            updateValues
          );
        }
      }

      // Get updated user data
      const result = await nile.db.query(
        `
        SELECT 
          u.id,
          u.email,
          u.name,
          u.given_name,
          u.family_name,
          u.picture,
          u.created,
          u.updated,
          u.email_verified,
          COALESCE(up.role, 'user') as role,
          COALESCE(up.is_penguinmails_staff, false) as is_penguinmails_staff
        FROM users.users u
        LEFT JOIN public.user_profiles up ON u.id = up.user_id AND up.deleted IS NULL
        WHERE u.id = $1
      `,
        [userId]
      );

      return result.rows[0];
    });

    if (!updatedUser) {
      return NextResponse.json(
        {
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        givenName: updatedUser.given_name,
        familyName: updatedUser.family_name,
        picture: updatedUser.picture,
        created: updatedUser.created,
        updated: updatedUser.updated,
        emailVerified: updatedUser.email_verified,
        profile: {
          role: updatedUser.role,
          isPenguinMailsStaff: updatedUser.is_penguinmails_staff,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update user',
        code: 'ADMIN_USER_UPDATE_ERROR',
      },
      { status: 500 }
    );
  }
});
