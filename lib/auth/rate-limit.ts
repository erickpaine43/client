import { getRedisClient } from "@/lib/cache/redis-client";

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || "3", 10);
const LOCKOUT_DURATION = parseInt(process.env.LOGIN_ATTEMPT_WINDOW || "900", 10);

export interface RateLimitResult {
    attempts: number;
    requiresTurnstile: boolean;
}

export interface LoginAttemptStatus extends RateLimitResult {
    lockoutExpiresAt?: Date;
}

const getRateLimitKey = (identifier: string) => `login:attempts:${identifier}`;

export async function checkLoginAttempts(identifier: string): Promise<RateLimitResult> {
    const redis = getRedisClient();
    if (!redis) {
        console.warn("Redis not available, skipping rate limit check");
        return { attempts: 0, requiresTurnstile: false };
    }

    const key = getRateLimitKey(identifier);
    const fileAttempts = await redis.get(key);
    const attempts = fileAttempts ? parseInt(fileAttempts, 10) : 0;

    return {
        attempts,
        requiresTurnstile: attempts >= MAX_LOGIN_ATTEMPTS,
    };
}

export async function getLoginAttemptStatus(identifier: string): Promise<LoginAttemptStatus> {
    const redis = getRedisClient();
    if (!redis) {
        return { attempts: 0, requiresTurnstile: false };
    }

    const key = getRateLimitKey(identifier);
    const rawAttempts = await redis.get(key);
    const attempts = rawAttempts ? parseInt(rawAttempts, 10) : 0;
    const requiresTurnstile = attempts >= MAX_LOGIN_ATTEMPTS;

    if (!requiresTurnstile) {
        return { attempts, requiresTurnstile };
    }

    const ttlSeconds = await redis.ttl(key);
    const lockoutExpiresAt = ttlSeconds > 0 ? new Date(Date.now() + ttlSeconds * 1000) : undefined;
    return { attempts, requiresTurnstile, lockoutExpiresAt };
}

export async function incrementLoginAttempts(identifier: string): Promise<number> {
    const redis = getRedisClient();
    if (!redis) return 0;

    const key = getRateLimitKey(identifier);
    const attempts = await redis.incr(key);

    // Set expiry if it's a new key, or ensure it expires eventually
    if (attempts === 1) {
        await redis.expire(key, LOCKOUT_DURATION);
    }

    return attempts;
}

export async function resetLoginAttempts(identifier: string): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    const key = getRateLimitKey(identifier);
    await redis.del(key);
}
