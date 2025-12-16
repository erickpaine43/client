import { NextRequest, NextResponse } from 'next/server';
import { getLoginAttemptStatus } from '@/lib/auth/rate-limit';


export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email es requerido' },
                { status: 400 }
            );
        }

        const identifier = email.trim().toLowerCase();
        const status = await getLoginAttemptStatus(identifier);

        return NextResponse.json({
            attempts: status.attempts,
            requiresTurnstile: status.requiresTurnstile,
            lockoutExpiresAt: status.lockoutExpiresAt?.toISOString(),
        });
    } catch (error) {
        console.error('Error obteniendo estado de intentos:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}