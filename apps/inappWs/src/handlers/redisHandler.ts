import { redisSubscriberConfig } from "../config/redisSubscriberConfig";
import {RedisMessageHandler, WebsocketTransactionPayload} from "@repo/types/types";
import {
    clients,
    sendNotificationsToClient
} from "./websocketHandler";
import {generateRandom7DigitNumber} from "@repo/utils/utils";
import {inMemoryCacheHandler} from "./inMemoryCacheHandler";

export const setupRedisSubscription = async (): Promise<void> => {
    try {
        await redisSubscriberConfig.connect();

        await redisSubscriberConfig.subscribe('feed', (message, channel) => {
            handleRedisMessage(message, channel);
        });

        await redisSubscriberConfig.subscribe('in_app', (message, channel) => {
            handleRedisMessage(message, channel);
        });

        console.log('Subscribed to Redis channels: feed and in_app');
    } catch (err) {
        console.error('Error subscribing to Redis channels:', err);
    }
};

const handleRedisMessage: RedisMessageHandler = async (message, channel) => {
    console.log(`Message received on channel "${channel}": ${message}`);

    try {
        const notification = JSON.parse(message);

        if (notification.subId && clients.get(notification.subId)) {
            const payload: WebsocketTransactionPayload = {
                type: "message",
                content: {
                    data: {
                        notifications: [
                            {
                                ...notification,
                                receivedAt: Date.now(),
                                id: generateRandom7DigitNumber(),
                                unRead: true,
                            }
                        ]
                    },
                },
            };
            // Retrieve existing notifications from Redis
            const existingNotifications = inMemoryCacheHandler.getNotificationsFromCache(notification.subId);

            // Add the new notification to the cached list
            const updatedNotifications = [
                ...payload.content.data.notifications ?? [],
                ...existingNotifications,
            ];

            // Update the cached notifications in Redis
            inMemoryCacheHandler.setNotificationsInCache(notification.subId, updatedNotifications);
            sendNotificationsToClient(notification.subId, payload);
        }
    } catch (err) {
        console.error('Failed to handle Redis message:', err);
    }
};
