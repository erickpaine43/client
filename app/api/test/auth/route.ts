import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/nile';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession();

    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
}
