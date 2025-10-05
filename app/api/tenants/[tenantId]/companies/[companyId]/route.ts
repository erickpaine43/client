/**
 * Individual Company Management API Routes
 * 
 * GET /api/tenants/[tenantId]/companies/[companyId] - Get a specific company
 * PUT /api/tenants/[tenantId]/companies/[companyId] - Update a company
 * DELETE /api/tenants/[tenantId]/companies/[companyId] - Delete a company
 * 
 * These routes handle individual company operations with proper access control.
 */

import { NextResponse } from 'next/server';
import { withTenantAccess, withResourcePermission } from '@/lib/niledb/middleware';
import { getCompanyService, type UpdateCompanyData } from '@/lib/niledb/company';
import { z } from 'zod';

// Validation schema for company updates
const UpdateCompanySchema = z.object({
  name: z.string().min(1).max(255).trim().optional(),
  email: z.string().email().optional().or(z.literal('')),
  settings: z.record(z.string(), z.unknown()).optional(),
});

/**
 * GET /api/tenants/[tenantId]/companies/[companyId]
 * Get a specific company by ID (member access required)
 */
export const GET = withTenantAccess('member')(async (request, context) => {
  try {
    const companyService = getCompanyService();
    const { tenantId, companyId } = context.params;

    const company = await companyService.getCompanyById(
      tenantId,
      companyId,
      request.user.id
    );

    if (!company) {
      return NextResponse.json(
        {
          error: 'Company not found',
          code: 'COMPANY_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      company,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get company:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve company',
        code: 'COMPANY_FETCH_ERROR',
      },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/tenants/[tenantId]/companies/[companyId]
 * Update a company (admin access required)
 */
export const PUT = withTenantAccess('admin')(
  withResourcePermission('company', 'write')(async (request, context) => {
    try {
      const companyService = getCompanyService();
      const { tenantId, companyId } = context.params;

      // Parse and validate request body
      const body = await request.json();
      const validationResult = UpdateCompanySchema.safeParse(body);

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

      const updateData: UpdateCompanyData = {};
      if (validationResult.data.name !== undefined) {
        updateData.name = validationResult.data.name;
      }
      if (validationResult.data.email !== undefined) {
        updateData.email = validationResult.data.email || undefined;
      }
      if (validationResult.data.settings !== undefined) {
        updateData.settings = validationResult.data.settings;
      }

      const company = await companyService.updateCompany(
        tenantId,
        companyId,
        updateData,
        request.user.id
      );

      return NextResponse.json({
        message: 'Company updated successfully',
        company,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to update company:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to update company',
          code: 'COMPANY_UPDATE_ERROR',
        },
        { status: 500 }
      );
    }
  })
);

/**
 * DELETE /api/tenants/[tenantId]/companies/[companyId]
 * Delete a company (owner access required)
 */
export const DELETE = withTenantAccess('owner')(
  withResourcePermission('company', 'delete')(async (request, context) => {
    try {
      const companyService = getCompanyService();
      const { tenantId, companyId } = context.params;

      await companyService.deleteCompany(
        tenantId,
        companyId,
        request.user.id
      );

      return NextResponse.json({
        message: 'Company deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to delete company:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to delete company',
          code: 'COMPANY_DELETE_ERROR',
        },
        { status: 500 }
      );
    }
  })
);
