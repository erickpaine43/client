/**
 * Tenant Management API Routes
 * 
 * POST /api/tenants - Create a new tenant
 * 
 * These routes handle tenant creation for authenticated users.
 */

import { NextResponse } from 'next/server';
import { withAuthentication } from '@/lib/niledb/middleware';
import { getTenantService } from '@/lib/niledb/tenant';
import { z } from 'zod';

// Validation schema for tenant creation
const CreateTenantSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  subscriptionPlan: z.string().optional(),
  billingStatus: z.enum(['active', 'suspended', 'cancelled']).optional(),
});

/**
 * POST /api/tenants
 * Create a new tenant (authenticated users only)
 */
export const POST = withAuthentication(async (request, _context) => {
  try {
    const tenantService = getTenantService();
    const body = await request.json();

    // Validate request body
    const validationResult = CreateTenantSchema.safeParse(body);
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

    const { name, subscriptionPlan, billingStatus } = validationResult.data;

    const tenant = await tenantService.createTenant(
      name,
      request.user.id, // Creator becomes owner
      { subscriptionPlan, billingStatus }
    );

    return NextResponse.json(
      {
        message: 'Tenant created successfully',
        tenant,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create tenant:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create tenant',
        code: 'TENANT_CREATE_ERROR',
      },
      { status: 500 }
    );
  }
});
