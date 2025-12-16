import { NextResponse } from "next/server";
import { checkLoginAttempts, incrementLoginAttempts, resetLoginAttempts } from "@/lib/auth/rate-limit";
import { validateTurnstileToken } from "@/lib/services/turnstile-validator";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, turnstileToken } = body;

        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        }

        const identifier = String(email).trim().toLowerCase();

        // 1. Check Rate Limit
        const { requiresTurnstile } = await checkLoginAttempts(identifier);

        if (requiresTurnstile) {
            if (!turnstileToken) {
                return NextResponse.json(
                    {
                        message: "Missing Turnstile token",
                        errorCode: "MISSING_TURNSTILE_TOKEN",
                        requiresTurnstile: true,
                        userLockedBehindTurnstile: true,
                    },
                    { status: 403 }
                );
            }

            const turnstileResult = await validateTurnstileToken(turnstileToken);
            if (!turnstileResult.success) {
                return NextResponse.json(
                    {
                        message: "Invalid Turnstile token",
                        errorCode: "INVALID_TURNSTILE_TOKEN",
                        requiresTurnstile: true,
                        userLockedBehindTurnstile: true,
                        turnstileErrorCode: turnstileResult.errorCode || "INVALID_TURNSTILE_TOKEN",
                    },
                    { status: 403 }
                );
            }
        }

        // 2. Authenticate with Nile
        // We can't easily "forward" the request to the Nile handler because it expects a standard request structure 
        // and might read cookies etc.
        // Instead, we use the Nile server SDK to login.

        // Note: nile.auth.login is not always exposed directly in the server SDK depending on version.
        // If it's not, we have to call the API endpoint.
        // However, looking at docs, usually we can use `nile.api.auth.login` or similar.
        // Or we just proxy the request to the local Nile instance.

        // Let's try attempting login via the Nile SDK if possible. 
        // If not, we proxy to /api/auth/login provided by Nile handler? 
        // No, that handler is what we are likely replacing or wrapping.

        // Using the Nile SDK to login usually sets a cookie on the response.
        // `nile.auth.login` doesn't exist on the server instance typically for *credential* login returning a session.
        // It exists on the *browser* client.

        // Strategy: Proxy the request to the internal Nile auth handler logic
        // OR: Use the API URL to perform login and relay the cookie.

        const apiUrl = process.env.NILEDB_API_URL || "http://localhost:3005";
        // Usually /auth/login or /api/v1/auth/login

        const loginRes = await fetch(`${apiUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, database: "oltp" }) // Assuming database needed
        });

        // If login fails
        if (!loginRes.ok) {
            const attempts = await incrementLoginAttempts(identifier);
            return NextResponse.json(
                {
                    message: "Invalid credentials",
                    errorCode: "INVALID_CREDENTIALS",
                    attempts,
                    requiresTurnstile: (await checkLoginAttempts(identifier)).requiresTurnstile,
                },
                { status: 401 }
            );
        }

        // If login succeeds
        await resetLoginAttempts(identifier);

        // Relay the response (especially Set-Cookie headers)
        const data = await loginRes.json();
        const response = NextResponse.json(data);

        // Copy Set-Cookie headers
        const setCookie = loginRes.headers.get("set-cookie");
        if (setCookie) {
            response.headers.set("Set-Cookie", setCookie);
        }

        return response;

    } catch (error) {
        console.error("Login wrapper error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
