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

const clientNotifications: {[key: string]: Notification[]} = {}
const clientReadNotifications: {[key: string]: Set<number>} = {}

export const redisCacheHandler = {
    getNotificationsFromCache(subId: string): Notification[] {
        try {
            //const data = await redisCacheConfig.hGet("notifications", subId);
            const notificationsData: Notification[] = clientNotifications[subId] ?? [];
            // console.log(`notifications ${notificationsData}`);
            //console.log(`notificationsLength ${notificationsData.length}`);
            return notificationsData;
        } catch (err) {
            return [];
        }
    },

    setNotificationsInCache(subId: string, notifications: Notification[]): void {
        try{
            //console.log(`redis notifications set ${clientReadNotifications.length}`);
            //await redisCacheConfig.hSet("notifications", subId, JSON.stringify(notifications));
            clientNotifications[subId] = notifications;
        } catch (err) {
            console.error('Error setting notifications from Redis channels:', err);
        }
    },

    getReadNotificationsFromCache(subId: string): Set<number> {
        try {
            //const data = await redisCacheConfig.hGet("readNotifications", subId);
            //console.log(`read notifications ${clientReadNotifications[subId]?.size}`);
            //return data ? new Set(JSON.parse(data)) : new Set();
            return clientReadNotifications[subId] ?? new Set;
        } catch (err) {
            console.error('Error setting readNotifications from Redis channels:', err);
            return new Set;
        }
    },

    setReadNotificationsInCache(subId: string, readNotifications: Set<number>): void {
        try {
            //console.log(`redis read notifications set ${readNotifications.size}`);
            //await redisCacheConfig.hSet("readNotifications", subId, JSON.stringify([...readNotifications]));
            clientReadNotifications[subId] = readNotifications;
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