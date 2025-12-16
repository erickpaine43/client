export async function validateTurnstileToken(token: string): Promise<boolean> {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
        console.error("TURNSTILE_SECRET_KEY is not set");
        return false;
    }

    try {
        const formData = new FormData();
        formData.append("secret", secretKey);
        formData.append("response", token);

        const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
        const result = await fetch(url, {
            body: formData,
            method: "POST",
        });

        const outcome = await result.json();
        if (!outcome.success) {
            console.error("Turnstile validation failed:", outcome);
        }
        return outcome.success;
    } catch (error) {
        console.error("Error validating Turnstile token:", error);
        return false;
    }
}
