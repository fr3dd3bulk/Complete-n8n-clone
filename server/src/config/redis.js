import { createClient } from 'redis';

let redisClient = null;

const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = createClient({
      url: redisUrl,
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Connected');
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    console.error('❌ Error connecting to Redis:', error.message);
    process.exit(1);
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

// Get connection for BullMQ (returns connection config, not client)
const getRedisConnection = async () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  // Parse URL for BullMQ connection
  const url = new URL(redisUrl);
  
  return {
    host: url.hostname,
    port: parseInt(url.port) || 6379,
  };
};

export { connectRedis, getRedisClient, getRedisConnection };
