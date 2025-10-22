// app/api/verify-turnstile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { validateTurnstileToken } from "next-turnstile";
import { v4 } from "uuid";


export async function POST(req: NextRequest) {
  const { token } = await req.json();
  console.log("Verifying Turnstile token:", token);

  const result = await validateTurnstileToken({
    token,
    secretKey: process.env.TURNSTILE_SECRET_KEY!,
    idempotencyKey: v4(),
    sandbox: process.env.NODE_ENV === "development",
  });

  console.log("Turnstile verification result:", result);
  console.log("Turnstile secret loaded:", process.env.TURNSTILE_SECRET_KEY);

  if (!result.success) {
    return NextResponse.json({ success: false, message: "Invalid CAPTCHA" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
