import {createClient} from "redis";

export const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

export const initRedisConfig = () => {
    redisClient.connect().then(r => console.log('successfully connected to redis'));
}