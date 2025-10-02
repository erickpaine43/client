import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/lib/niledb/auth';
import { z } from 'zod';

const sendEmailSchema = z.object({
  campaign_id: z.string(),
  recipient_email: z.string().email(),
  subject: z.string().min(1),
  content: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const authService = getAuthService();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _user = await authService.validateSession();

    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { campaign_id: _campaign_id, recipient_email: _recipient_email, subject: _subject, content: _content } = sendEmailSchema.parse(body);

    // For now, return mock email sent response
    const mockResponse = {
      id: 'new-mock-email-id',
      status: 'queued',
    };

    return NextResponse.json(mockResponse, { status: 202 });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 400 }
    );
  }
}
