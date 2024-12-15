import {redisCacheConfig} from "../config/redisCacheConfig";
import {Notification} from "@repo/types";

export const setupRedisCache = async (): Promise<void> => {
    try {
        await redisCacheConfig.connect();
        console.log('Connected to Redis cache client');
    } catch (err) {
        console.error('Error connecting to Redis cache client:', err);
    }
};

export const redisCacheHandler = {
    async getNotificationsFromCache(subId: string): Promise<Notification[]> {
        try {
            const data = await redisCacheConfig.hGet("notifications", subId);
            return data ? JSON.parse(data) : [];
        } catch (err) {
            return [];
        }
    },

    async setNotificationsInCache(subId: string, notifications: Notification[]): Promise<void> {
        try{
            await redisCacheConfig.hSet("notifications", subId, JSON.stringify(notifications));
        } catch (err) {
            console.error('Error setting notifications from Redis channels:', err);
        }
    },

    async getReadNotificationsFromCache(subId: string): Promise<Set<number>> {
        const data = await redisCacheConfig.hGet("readNotifications", subId);
        return data ? new Set(JSON.parse(data)) : new Set();
    },

    async setReadNotificationsFromCache(subId: string, readNotifications: Set<number>): Promise<Set<number>> {
        await redisCacheConfig.hSet("readNotifications", subId, JSON.stringify([...readNotifications]));
    },
};
