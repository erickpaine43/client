interface TurnstileResponse {
    success: boolean;
    'error-codes'?: string[];
    challenge_ts?: string;
    hostname?: string;
}

export interface TurnstileValidationResult {
    success: boolean;
    error?: string;
    errorCode?: string;
}

export async function validateTurnstileToken(
    token: string,
    remoteIp?: string
): Promise<TurnstileValidationResult> {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
        console.error('TURNSTILE_SECRET_KEY no configurado');
        return {
            success: false,
            error: 'Turnstile no configurado',
            errorCode: 'TURNSTILE_NOT_CONFIGURED',
        };
    }

    if (!token || token.trim() === '') {
        return {
            success: false,
            error: 'Se requiere token de Turnstile',
            errorCode: 'MISSING_TURNSTILE_TOKEN',
        };
    }

    try {
        const formData = new URLSearchParams();
        formData.append('secret', secretKey);
        formData.append('response', token);

        if (remoteIp) {
            formData.append('remoteip', remoteIp);
        }

        const response = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            }
        );

        if (!response.ok) {
            console.error('Error de API de Turnstile:', response.status, response.statusText);
            return {
                success: false,
                error: 'Falló la validación del token de Turnstile',
                errorCode: 'TURNSTILE_API_ERROR',
            };
        }

        const data: TurnstileResponse = await response.json();

        if (!data.success) {
            const errorCode = data['error-codes']?.[0] || 'UNKNOWN_ERROR';
            return {
                success: false,
                error: getTurnstileErrorMessage(errorCode),
                errorCode: errorCode.toUpperCase(),
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Error de validación de Turnstile:', error);
        return {
            success: false,
            error: 'Falló la validación del token de Turnstile',
            errorCode: 'VALIDATION_ERROR',
        };
    }
}

function getTurnstileErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
        'missing-input-secret': 'Error de configuración. Por favor contacta soporte.',
        'invalid-input-secret': 'Error de configuración. Por favor contacta soporte.',
        'missing-input-response': 'Por favor completa el desafío de seguridad.',
        'invalid-input-response': 'Desafío de seguridad falló. Por favor intenta de nuevo.',
        'bad-request': 'Solicitud inválida. Por favor actualiza e intenta de nuevo.',
        'timeout-or-duplicate': 'Desafío de seguridad expirado. Por favor intenta de nuevo.',
    };

    return errorMessages[errorCode] || 'Validación de seguridad falló. Por favor intenta de nuevo.';
}

export function isTurnstileConfigured(): boolean {
    return !!(
        process.env.TURNSTILE_SECRET_KEY &&
        process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    );
}