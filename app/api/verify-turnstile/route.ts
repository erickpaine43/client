// app/api/verify-turnstile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { validateTurnstileToken } from "next-turnstile";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      console.error("TURNSTILE_SECRET_KEY is not set.");
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
    }

    const result = await validateTurnstileToken({
      token,
      secretKey,
    });

    if (!result.success) {
      const errorCodes = (result as any)['error-codes'] || [];
      console.warn("Turnstile verification failed with error codes:", errorCodes);
      return NextResponse.json({ success: false, message: "Invalid CAPTCHA" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("An error occurred during Turnstile verification:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred." }, { status: 500 });
  }
}
