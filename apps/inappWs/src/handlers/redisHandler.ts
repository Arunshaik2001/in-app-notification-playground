import { redisSubscriber } from "../config/redis";
import {Notification, RedisMessageHandler, WebsocketTransactionPayload} from "@repo/types/types";
import {clients, clientsNotifications, sendNotificationsToClient} from "./websocketHandler";

export const setupRedisSubscription = async (): Promise<void> => {
    try {
        await redisSubscriber.connect();

        await redisSubscriber.subscribe('feed', (message, channel) => {
            handleRedisMessage(message, channel);
        });

        await redisSubscriber.subscribe('in_app', (message, channel) => {
            handleRedisMessage(message, channel);
        });

        console.log('Subscribed to Redis channels: feed and in_app');
    } catch (err) {
        console.error('Error subscribing to Redis channels:', err);
    }
};

const handleRedisMessage: RedisMessageHandler = (message, channel) => {
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
                            }
                        ]
                    },
                },
            };
            sendNotificationsToClient(notification.subId, payload);

            const clientArray = (clientsNotifications[notification.subId] ?? []);
            clientArray.unshift(...payload.content.data.notifications ?? []);
            clientsNotifications[notification.subId] = clientArray;
        }
    } catch (err) {
        console.error('Failed to handle Redis message:', err);
    }
};
