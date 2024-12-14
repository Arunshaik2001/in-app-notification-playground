import { createClient, RedisClientType } from 'redis';

// Redis client instance
const redisUrl: string = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisCacheConfig: RedisClientType = createClient({ url: redisUrl });

redisCacheConfig.on('error', (err: Error) => {
    console.error('Redis connection error:', err);
});
