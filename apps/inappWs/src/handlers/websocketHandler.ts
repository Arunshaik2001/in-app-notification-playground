import { WebSocketServer, WebSocket } from "ws";
import { WebsocketTransactionPayload, Notification } from "@repo/types/types";
import {rawDataToJson} from "@repo/utils/utils";
import http from "http";
import jwt from 'jsonwebtoken';
import {inMemoryCacheHandler} from "./inMemoryCacheHandler";

export const clients: Map<string, Array<WebSocket>> = new Map<string, Array<WebSocket>>();

export const setupWebSocketServer = (server: http.Server): WebSocketServer => {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws, req) => {
        const token = new URL(req.url!, `https://${req.headers.host}`).searchParams.get('token');

        if(!token) {
            ws.close(4001, 'Unauthorized');
            return;
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!); // Validate the token
            console.log('Authenticated user:', decoded);
        } catch (err) {
            console.error('Invalid token, closing connection.');
            ws.close(4001, 'Unauthorized');
            return;
        }

        let clientId: string;

        ws.on("error", console.error);

        ws.on("message", async (dataJson) => {
            const data: WebsocketTransactionPayload = rawDataToJson(dataJson);
            if (data.type === 'identifier') {
                clientId = String(data.content.data.subId);
                const clientSockets = clients.get(clientId) ?? [];
                clientSockets.unshift(ws);
                clients.set(clientId, clientSockets);
                console.log(`Total unique connections live: ${clients.size}`);

                // Fetch notifications from Redis cache
                const cachedNotifications = inMemoryCacheHandler.getNotificationsFromCache(clientId);
                const unreadCount = inMemoryCacheHandler.getUnreadCount(clientId);

                if (cachedNotifications.length > 0) {
                    const payLoad: WebsocketTransactionPayload = {
                        type: "message",
                        content: {
                            data: {
                                notifications: cachedNotifications,
                                notificationsUnreadCount: unreadCount,
                            },
                        },
                    };
                    sendNotificationToClient(ws, payLoad);
                }
            }
            else if (data.type === 'ping') {
                ws.send(JSON.stringify({
                    type: "ping",
                    content: {
                        data: {
                            status: "OK"
                        }
                    }
                }));
            }
            else if (data.type === 'notificationStatus') {
                const notificationId = data.content.data.notificationId;
                const status = data.content.data.status;

                if (notificationId) {
                    await updateNotificationStatusInCache(clientId, notificationId, status === 'read');
                    sendUnReadCountMessageToClients(clientId);
                }
            }
        });

        ws.on("close", (code) => {
            console.log(`WebSocket connection closed: ${code}`);
            if (clientId) {
                if((clients.get(clientId) ?? [])!.includes(ws)){
                    clients.set(clientId, (clients.get(clientId) ?? [])!.filter(socket => socket !== ws));
                    if((clients.get(clientId) ?? []).length == 0){
                        clients.delete(clientId);
                    }
                }
            }
        });
    });

    return wss;
};

const updateNotificationStatusInCache = async (subId: string, notificationId: number, isRead: boolean): Promise<void> => {
    const notifications = inMemoryCacheHandler.getNotificationsFromCache(subId);
    const readNotifications = inMemoryCacheHandler.getReadNotificationsFromCache(subId);

    // Update notification status
    const updatedNotifications = notifications.map(notification => {
        if (notification.id === notificationId) {
            notification.unRead = !isRead;
        }
        return notification;
    });

    // Update read notifications
    if (isRead) {
        readNotifications.add(notificationId);
    } else {
        readNotifications.delete(notificationId);
    }

    // Save updated data to Redis
    inMemoryCacheHandler.setNotificationsInCache(subId, updatedNotifications);
    inMemoryCacheHandler.setReadNotificationsInCache(subId, readNotifications);
};

export const sendNotificationsToClient = (subId: string, payload: WebsocketTransactionPayload): void => {
    for (let clientSocket of (clients.get(subId) ?? [])) {
        sendNotificationToClient(clientSocket, payload);
        setTimeout(async () => {
            await sendUnReadCountMessageToClient(clientSocket, subId);
        }, 1000);
    }
};

const sendUnReadCountMessageToClients = (subId: string): void => {
    for (let clientSocket of (clients.get(subId) ?? [])) {
        setTimeout(async () => {
            await sendUnReadCountMessageToClient(clientSocket, subId);
        }, 1000);
    }
}

const sendUnReadCountMessageToClient = async (clientSocket: WebSocket, subId: string): Promise<void> => {
    const unReadCountPayload: WebsocketTransactionPayload = {
        type: 'unreadCount',
        content: {
            data: {
                notificationsUnreadCount: inMemoryCacheHandler.getUnreadCount(subId),
            }
        }
    }
    sendNotificationToClient(clientSocket, unReadCountPayload);
}

export const sendNotificationToClient = (clientSocket: WebSocket, payload: WebsocketTransactionPayload): void => {
    if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(JSON.stringify(payload));
    }
};
