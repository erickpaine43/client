export class RateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number }>();

  async checkLimit(key: string, maxAttempts: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingTime(key: string): number {
    const record = this.attempts.get(key);
    if (!record) return 0;
    return Math.max(0, record.resetTime - Date.now());
  }
}
