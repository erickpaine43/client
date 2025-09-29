/**
 * Tenant Management API Routes
 * 
 * GET /api/tenants/[tenantId] - Get tenant information
 * PUT /api/tenants/[tenantId] - Update tenant information
 * 
 * These routes handle individual tenant operations with proper access control.
 */

import { NextResponse } from 'next/server';
import { withTenantAccess, withResourcePermission } from '@/lib/niledb/middleware';
import { getTenantService } from '@/lib/niledb/tenant';
import { z } from 'zod';

// Validation schema for tenant updates
const UpdateTenantSchema = z.object({
  name: z.string().min(1).max(255).trim().optional(),
  subscriptionPlan: z.string().optional(),
  billingStatus: z.enum(['active', 'suspended', 'cancelled']).optional(),
});

/**
 * GET /api/tenants/[tenantId]
 * Get tenant information (member access required)
 */
export const GET = withTenantAccess('member')(async (request, context) => {
  try {
    const tenantService = getTenantService();
    const { tenantId } = context.params;

    const tenant = await tenantService.getTenantById(tenantId);

    if (!tenant) {
      return NextResponse.json(
        {
          error: 'Tenant not found',
          code: 'TENANT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tenant,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get tenant:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve tenant',
        code: 'TENANT_FETCH_ERROR',
      },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/tenants/[tenantId]
 * Update tenant information (admin access required)
 */
export const PUT = withTenantAccess('admin')(
  withResourcePermission('company', 'write')(async (request, context) => {
    try {
      const tenantService = getTenantService();
      const { tenantId } = context.params;

      // Parse and validate request body
      const body = await request.json();
      const validationResult = UpdateTenantSchema.safeParse(body);

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

      const updatedTenant = await tenantService.updateTenant(
        tenantId,
        { name, subscriptionPlan, billingStatus },
        request.user.id
      );

      return NextResponse.json({
        message: 'Tenant updated successfully',
        tenant: updatedTenant,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to update tenant:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to update tenant',
          code: 'TENANT_UPDATE_ERROR',
        },
        { status: 500 }
      );
    }
  })
);
