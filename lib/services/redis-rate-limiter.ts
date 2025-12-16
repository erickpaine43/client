import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const MAX_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '3', 10);
const ATTEMPT_WINDOW = parseInt(process.env.LOGIN_ATTEMPT_WINDOW || '900', 10);

export interface LoginAttemptStatus {
    attempts: number;
    requiresTurnstile: boolean;
    lockoutExpiresAt?: Date;
}

export async function getLoginAttemptStatus(
    identifier: string
): Promise<LoginAttemptStatus> {
    const key = `login:attempts:${identifier}`;
    const attempts = await redis.get(key);
    const attemptCount = attempts ? parseInt(attempts, 10) : 0;

    return {
        attempts: attemptCount,
        requiresTurnstile: attemptCount >= MAX_ATTEMPTS,
        lockoutExpiresAt: attemptCount >= MAX_ATTEMPTS
            ? await getKeyExpiration(key)
            : undefined,
    };
}

export async function recordFailedAttempt(
    identifier: string
): Promise<LoginAttemptStatus> {
    const key = `login:attempts:${identifier}`;

    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, ATTEMPT_WINDOW);

    const results = await pipeline.exec();
    const attempts = results?.[0]?.[1] as number || 1;

    return {
        attempts,
        requiresTurnstile: attempts >= MAX_ATTEMPTS,
        lockoutExpiresAt: attempts >= MAX_ATTEMPTS
            ? new Date(Date.now() + ATTEMPT_WINDOW * 1000)
            : undefined,
    };
}

export async function clearFailedAttempts(identifier: string): Promise<void> {
    const key = `login:attempts:${identifier}`;
    await redis.del(key);
}

export async function isTurnstileRequired(identifier: string): Promise<boolean> {
    const status = await getLoginAttemptStatus(identifier);
    return status.requiresTurnstile;
}

async function getKeyExpiration(key: string): Promise<Date | undefined> {
    const ttl = await redis.ttl(key);
    if (ttl > 0) {
        return new Date(Date.now() + ttl * 1000);
    }
    return undefined;
}

export async function checkRedisHealth(): Promise<boolean> {
    try {
        await redis.ping();
        return true;
    } catch (error) {
        console.error('Verificación de salud de Redis falló:', error);
        return false;
    }
}