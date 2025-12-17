/**
 * Next.js Global Middleware
 * 
 * Handles global request processing including security headers,
 * request logging, and basic validation for the NileDB backend.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logError } from './lib/niledb/errors';

// Security headers configuration
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

// CORS configuration
const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400', // 24 hours
} as const;

// Rate limiting configuration
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class GlobalRateLimiter {
  private requests = new Map<string, RateLimitEntry>();
  private readonly windowMs = 60 * 1000; // 1 minute
  private readonly maxRequests = 100; // per minute per IP

  check(ip: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Clean up old entries
    this.cleanup(windowStart);
    
    const entry = this.requests.get(ip);
    
    if (!entry) {
      this.requests.set(ip, { count: 1, resetTime: now + this.windowMs });
      return { allowed: true };
    }
    
    if (entry.resetTime <= now) {
      this.requests.set(ip, { count: 1, resetTime: now + this.windowMs });
      return { allowed: true };
    }
    
    if (entry.count >= this.maxRequests) {
      return { 
        allowed: false, 
        resetTime: entry.resetTime 
      };
    }
    
    entry.count++;
    return { allowed: true };
  }

  private cleanup(windowStart: number): void {
    for (const [key, entry] of this.requests.entries()) {
      if (entry.resetTime <= windowStart) {
        this.requests.delete(key);
      }
    }
  }
}

const globalRateLimiter = new GlobalRateLimiter();

// Request logging
interface RequestLog {
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  ip: string;
  timestamp: string;
  duration?: number;
  statusCode?: number;
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         request.headers.get('cf-connecting-ip') ||
         'unknown';
}

function logRequest(log: RequestLog): void {
  // Only log API requests and errors
  if (log.url.includes('/api/') || (log.statusCode && log.statusCode >= 400)) {
    console.info('Request Log:', log);
  }
}

// Security validation
function validateRequest(request: NextRequest): { valid: boolean; error?: string } {
  // Check for suspicious patterns
  const url = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';

  // Block common attack patterns
  const suspiciousPatterns = [
    /\.\./,  // Path traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /javascript:/i,  // JavaScript injection
    /data:/i,  // Data URI attacks
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(userAgent)) {
      return {
        valid: false,
        error: 'Suspicious request pattern detected',
      };
    }
  }

  // Validate content length for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
      return {
        valid: false,
        error: 'Request body too large',
      };
    }
  }

  return { valid: true };
}

// CORS handling
function handleCORS(request: NextRequest): NextResponse | null {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'http://localhost:3000',
      'https://localhost:3000',
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ].filter(Boolean);

    const response = new NextResponse(null, { status: 200 });

    // Set CORS headers
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  return null;
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const ip = getClientIP(request);
  const url = request.nextUrl.pathname;

  // Create request log
  const requestLog: RequestLog = {
    requestId,
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || undefined,
    ip,
    timestamp: new Date().toISOString(),
  };

  try {
    // Handle CORS preflight
    const corsResponse = handleCORS(request);
    if (corsResponse) {
      return corsResponse;
    }

    // Security validation
    const validation = validateRequest(request);
    if (!validation.valid) {
      logError(
        new Error(`Security validation failed: ${validation.error}`),
        { requestId, ip, url, operation: 'security_validation' },
        'warn'
      );

      return new NextResponse(
        JSON.stringify({
          error: 'Request blocked for security reasons',
          code: 'SECURITY_VIOLATION',
          requestId,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...SECURITY_HEADERS,
          },
        }
      );
    }

    // Rate limiting for API routes
    if (url.startsWith('/api/')) {
      const rateCheck = globalRateLimiter.check(ip);
      if (!rateCheck.allowed) {
        const resetTime = new Date(rateCheck.resetTime!).toISOString();
        
        logError(
          new Error('Rate limit exceeded'),
          { requestId, ip, url, operation: 'rate_limiting' },
          'warn'
        );

        return new NextResponse(
          JSON.stringify({
            error: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            resetTime,
            requestId,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((rateCheck.resetTime! - Date.now()) / 1000).toString(),
              ...SECURITY_HEADERS,
            },
          }
        );
      }
    }

    // Continue with the request
    const response = NextResponse.next();

    // Add security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add request ID header
    response.headers.set('X-Request-ID', requestId);

    // Log successful request
    requestLog.duration = Date.now() - startTime;
    requestLog.statusCode = response.status;
    logRequest(requestLog);

    return response;

  } catch (error) {
    // Log middleware error
    logError(
      error,
      { requestId, ip, url, operation: 'middleware' },
      'error'
    );

    requestLog.duration = Date.now() - startTime;
    requestLog.statusCode = 500;
    logRequest(requestLog);

    return new NextResponse(
      JSON.stringify({
        error: 'Internal server error',
        code: 'MIDDLEWARE_ERROR',
        requestId,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...SECURITY_HEADERS,
        },
      }
    );
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
