import { NextResponse } from "next/server";
import { checkLoginAttempts, incrementLoginAttempts, resetLoginAttempts } from "@/lib/auth/rate-limit";
import { validateTurnstileToken } from "@/lib/auth/turnstile";
import { nile } from "@/lib/niledb/client"; 
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  turnstileToken: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = LoginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ 
                message: "Invalid request body", 
                errors: validation.error.issues 
            }, { status: 400 });
        }
        const { email, password, turnstileToken } = validation.data;  // ✅ Tipos seguros

        const identifier = String(email).trim().toLowerCase();

        // 1. Check Rate Limit
        const { requiresTurnstile } = await checkLoginAttempts(identifier);

        if (requiresTurnstile) {
            if (!turnstileToken) {
                return NextResponse.json({
                    message: "Missing Turnstile token",
                    requiresTurnstile: true,
                    userLockedBehindTurnstile: true,
                }, { status: 403 });
            }

            const turnstileResult = await validateTurnstileToken(turnstileToken);
            if (!turnstileResult.success) {
                return NextResponse.json({
                    message: "Invalid Turnstile token",
                    requiresTurnstile: true,
                    userLockedBehindTurnstile: true,
                }, { status: 403 });
            }
        }

        // 2. Authenticate with Nile SDK
        try {
            const user = await nile.auth.signIn("email", { email, password });
            
            await resetLoginAttempts(identifier);
            return NextResponse.json({ user });

        } catch (error: any) {
           
            if (error.message?.includes('invalid') || error.message?.includes('credentials')) {
                const attempts = await incrementLoginAttempts(identifier);
                return NextResponse.json({
                    message: "Invalid credentials",
                    attempts,
                    requiresTurnstile: (await checkLoginAttempts(identifier)).requiresTurnstile,
                }, { status: 401 });
            }
            
            throw error;
        }

    } catch (error) {
        console.error("Login wrapper error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
