/**
 * Company Management API Routes
 * 
 * GET /api/tenants/[tenantId]/companies - List all companies in a tenant
 * POST /api/tenants/[tenantId]/companies - Create a new company in a tenant
 * 
 * These routes handle company CRUD operations within tenant contexts.
 */

import { NextResponse } from 'next/server';
import { withTenantAccess, withResourcePermission } from '@/lib/niledb/middleware';
import { getCompanyService, type CreateCompanyData } from '@/lib/niledb/company';
import { z } from 'zod';

// Validation schema for company creation
const CreateCompanySchema = z.object({
  name: z.string().min(1).max(255).trim(),
  email: z.string().email().optional().or(z.literal('')),
  settings: z.record(z.string(), z.unknown()).optional(),
});

/**
 * GET /api/tenants/[tenantId]/companies
 * List all companies in a tenant (member access required)
 */
export const GET = withTenantAccess('member')(async (request, context) => {
  try {
    const companyService = getCompanyService();
    const { tenantId } = context.params;

    const companies = await companyService.getCompaniesForTenant(
      tenantId,
      request.user.id
    );

    return NextResponse.json({
      companies,
      count: companies.length,
      tenantId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get companies:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve companies',
        code: 'COMPANIES_FETCH_ERROR',
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/tenants/[tenantId]/companies
 * Create a new company in a tenant (admin access required)
 */
export const POST = withTenantAccess('admin')(
  withResourcePermission('company', 'write')(async (request, context) => {
    try {
      const companyService = getCompanyService();
      const { tenantId } = context.params;

      // Parse and validate request body
      const body = await request.json();
      const validationResult = CreateCompanySchema.safeParse(body);

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

      const companyData: CreateCompanyData = {
        name: validationResult.data.name,
        email: validationResult.data.email || undefined,
        settings: validationResult.data.settings || {},
      };

      const company = await companyService.createCompany(
        tenantId,
        companyData,
        request.user.id
      );

      return NextResponse.json(
        {
          message: 'Company created successfully',
          company,
          timestamp: new Date().toISOString(),
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Failed to create company:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to create company',
          code: 'COMPANY_CREATE_ERROR',
        },
        { status: 500 }
      );
    }
  })
);
