/**
 * User Profile Management API Routes
 * 
 * GET /api/profile - Get current user profile
 * PUT /api/profile - Update current user profile
 * 
 * These routes handle user profile operations for authenticated users.
 */

import { NextResponse } from 'next/server';
import { withAuthentication } from '@/lib/niledb/middleware';
import { getAuthService } from '@/lib/niledb/auth';
import { z } from 'zod';

// Validation schema for profile updates
const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(255).trim().optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
});

/**
 * GET /api/profile
 * Get current user profile
 */
export const GET = withAuthentication(async (request, _context) => {
  try {
    const authService = getAuthService();
    
    // Get user with profile information
    const userWithProfile = await authService.getUserWithProfile(request.user.id);

    if (!userWithProfile) {
      return NextResponse.json(
        {
          error: 'User profile not found',
          code: 'PROFILE_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile: userWithProfile,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve user profile',
        code: 'PROFILE_FETCH_ERROR',
      },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/profile
 * Update current user profile
 */
export const PUT = withAuthentication(async (request, _context) => {
  try {
    const authService = getAuthService();

    // Parse and validate request body
    const body = await request.json();
    const validationResult = UpdateProfileSchema.safeParse(body);

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

    const { name, preferences } = validationResult.data;

    // Update user profile
    const updatedUser = await authService.updateUserProfile(request.user.id, {
      name,
      preferences,
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedUser,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update user profile',
        code: 'PROFILE_UPDATE_ERROR',
      },
      { status: 500 }
    );
  }
});
