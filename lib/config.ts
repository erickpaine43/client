// Configuration file for environment variables
import { getNileConfig } from './niledb/config';

export const config = {
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development',
  },
  niledb: {
    // NileDB configuration is managed by the dedicated NileDB config module
    // Use getNileConfig() to access NileDB configuration
    enabled: !!(process.env.NILEDB_USER && process.env.NILEDB_PASSWORD && process.env.NILEDB_API_URL),
  },
  stripe: {
    portalUrl: process.env.NEXT_PUBLIC_STRIPE_PORTAL_URL || 'https://billing.stripe.com/p/login/test_...',
    checkoutUrl: process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL || 'https://checkout.stripe.com/pay/test_...',
  },
  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
    enabled: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
    enabled: !!process.env.GEMINI_API_KEY,
  },
} as const;

// Helper function to get NileDB configuration
export const getNileDBConfig = () => {
  try {
    return getNileConfig();
  } catch (error) {
    console.warn('NileDB configuration not available:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};
