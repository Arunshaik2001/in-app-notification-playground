import {Notification} from "@repo/types/types";


const clientNotifications: {[key: string]: Notification[]} = {}
const clientReadNotifications: {[key: string]: Set<number>} = {}

export const inMemoryCacheHandler = {
    getNotificationsFromCache(subId: string): Notification[] {
        try {
            return clientNotifications[subId] ?? [];
        } catch (err) {
            return [];
        }
    },

    setNotificationsInCache(subId: string, notifications: Notification[]): void {
        try{
            clientNotifications[subId] = notifications;
        } catch (err) {
            console.error('Error setting notifications from Redis channels:', err);
        }
    },

    getReadNotificationsFromCache(subId: string): Set<number> {
        try {
            return clientReadNotifications[subId] ?? new Set;
        } catch (err) {
            console.error('Error setting readNotifications from Redis channels:', err);
            return new Set;
        }
    },

    setReadNotificationsInCache(subId: string, readNotifications: Set<number>): void {
        try {
            clientReadNotifications[subId] = readNotifications;
        } catch (err) {
            console.error('Error setting readNotifications from Redis channels:', err);
        }
    },

    getUnreadCount(subId: string): number {
        try {
            const notifications = this.getNotificationsFromCache(subId);
            const readNotifications = this.getReadNotificationsFromCache(subId);

            return notifications.length - readNotifications.size;
        } catch (err) {
            console.error('Error setting readNotifications from Redis channels:', err);
            return 0;
        }
    },
};