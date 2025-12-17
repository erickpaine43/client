import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/lib/niledb/auth';
import { z } from 'zod';

const createCampaignSchema = z.object({
  name: z.string().min(1),
  scheduled_at: z.string().optional(),
});

export async function GET(_request: NextRequest) {
  try {
    const authService = getAuthService();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _user = await authService.validateSession();

    // For now, return mock campaigns data
    const mockCampaigns = [
      {
        id: 'mock-campaign-id',
        name: 'Mock Campaign',
        company_id: 'mock-company-id',
        status: 'draft',
        scheduled_at: null,
      },
    ];

    return NextResponse.json(mockCampaigns, { status: 200 });
  } catch (error) {
    console.error('Get campaigns error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authService = getAuthService();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _user = await authService.validateSession();

    const body = await request.json();
    const { name, scheduled_at } = createCampaignSchema.parse(body);

    // For now, return mock created campaign
    const mockCampaign = {
      id: 'new-mock-campaign-id',
      name: name,
      company_id: 'mock-company-id',
      status: 'draft',
      scheduled_at: scheduled_at || null,
    };

    return NextResponse.json(mockCampaign, { status: 201 });
  } catch (error) {
    console.error('Create campaign error:', error);
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 400 }
    );
  }
}
