import Redis from "ioredis";

let redisClient: Redis | null = null;

/**
 * Get a singleton Redis client instance.
 * Creates the client on first call and reuses it for subsequent calls.
 */
export function getRedisClient(): Redis | null {
  console.log('🔍 Redis client status check - current client:', redisClient ? redisClient.status : 'null');

  if (redisClient && redisClient.status === 'ready') {
    console.log('✅ Returning existing ready Redis client');
    return redisClient;
  }

  // Clean up existing client if it's in a bad state
  if (redisClient && redisClient.status !== 'ready') {
    console.log('🧹 Cleaning up Redis client with status:', redisClient.status);
    redisClient.disconnect();
    redisClient = null;
  }

  const redisUrl =
    process.env.REDIS_URL ||
    (process.env.NODE_ENV === "development" ? "redis://localhost:6379" : "");

  console.log('🔗 Redis URL:', redisUrl);

  if (!redisUrl) {
    console.warn("⚠️ Redis not configured. Set REDIS_URL environment variable.");
    return null;
  }

  try {
    console.log('🔨 Creating new Redis client...');
    redisClient = new Redis(redisUrl);
    console.log("✅ Redis client configured successfully, status:", redisClient.status);

    // Handle connection events
    redisClient.on('connect', () => {
      console.log('🔌 Redis client connecting...');
    });

    redisClient.on('ready', () => {
      console.log('🎉 Redis client connected and ready');
    });

    redisClient.on('error', (error) => {
      console.error('❌ Redis client error:', error);
      console.error('❌ Redis client status:', redisClient?.status);
      // Reset client on error so it can be recreated
      redisClient = null;
    });

    redisClient.on('close', () => {
      console.log('🔌 Redis client connection closed');
    });

    return redisClient;
  } catch (error) {
    console.error("❌ Failed to create Redis client:", error);
    return null;
  }
}

/**
 * Create a new Redis client instance (not recommended for most use cases).
 * Use getRedisClient() instead for connection reuse.
 */
export function createRedisClient(): Redis | null {
  const redisUrl =
    process.env.REDIS_URL ||
    (process.env.NODE_ENV === "development" ? "redis://localhost:6380" : "");

  if (!redisUrl) {
    console.warn("Redis not configured. Set REDIS_URL environment variable.");
    return null;
  }

  try {
    const client = new Redis(redisUrl);
    console.log("New Redis client created successfully");
    return client;
  } catch (error) {
    console.error("Failed to create Redis client:", error);
    return null;
  }
}

/**
 * Close the Redis client connection
 */
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
    console.log("Redis client disconnected");
  }
}