import { redisCacheConfig } from "../config/redisCacheConfig";
import { Notification} from "@repo/types/types";

export const setupRedisCache = async (): Promise<void> => {
    try {
        await redisCacheConfig.connect();
        console.log('Subscribed to Redis channels: feed and in_app');
    } catch (err) {
        console.error('Error subscribing to Redis channels:', err);
    }
};

export const redisCacheHandler = {
    async getNotificationsFromCache(subId: string): Promise<Notification[]> {
        try {
            const data = await redisCacheConfig.hGet("notifications", subId);
            // console.log(`notifications ${data}`);
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
        try {
            const data = await redisCacheConfig.hGet("readNotifications", subId);
            // console.log(`read notifications ${data}`);
            return data ? new Set(JSON.parse(data)) : new Set();
        } catch (err) {
            console.error('Error setting readNotifications from Redis channels:', err);
            return new Set;
        }
    },

    async setReadNotificationsInCache(subId: string, readNotifications: Set<number>): Promise<void> {
        try {
            await redisCacheConfig.hSet("readNotifications", subId, JSON.stringify([...readNotifications]));
        } catch (err) {
            console.error('Error setting readNotifications from Redis channels:', err);
        }
    },

    async getUnreadCount(subId: string): Promise<number> {
        try {
            const notifications = await this.getNotificationsFromCache(subId);
            const readNotifications = await this.getReadNotificationsFromCache(subId);

            // console.log(`unread notifications count ${notifications.length - readNotifications.size}`);
            return notifications.length - readNotifications.size;
        } catch (err) {
            console.error('Error setting readNotifications from Redis channels:', err);
            return 0;
        }
    },
};