import { WebSocketServer, WebSocket } from "ws";
import { WebsocketTransactionPayload, Notification } from "@repo/types/types";
import {rawDataToJson} from "@repo/utils/utils";
import http from "http";
import jwt from 'jsonwebtoken';

export const clients: Map<string, Array<WebSocket>> = new Map<string, Array<WebSocket>>();
export const clientsNotifications: { [key: string]: Notification[] } = {};

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

        ws.on("message", (dataJson) => {
            const data: WebsocketTransactionPayload = rawDataToJson(dataJson);
            if (data.type === 'identifier') {
                clientId = String(data.content.data.subId);
                const clientSockets = clients.get(clientId) ?? [];
                clientSockets.unshift(ws)
                clients.set(clientId, clientSockets);
                console.log(`total unique connections live: ${clients.size}`);
                if(clientsNotifications[clientId] && clientsNotifications[clientId]!.length > 0) {
                    const payLoad: WebsocketTransactionPayload = {
                        type: "message",
                        content: {
                            data: {
                                notifications: clientsNotifications[clientId]!
                            }
                        }
                    };
                    sendNotificationToClient(ws, payLoad)
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
            console.log(data);
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

export const sendNotificationsToClient = (subId: string, payload: WebsocketTransactionPayload): void => {
    for (let clientSocket of (clients.get(subId) ?? [])) {
        sendNotificationToClient(clientSocket, payload);
    }
};

export const sendNotificationToClient = (clientSocket: WebSocket, payload: WebsocketTransactionPayload): void => {
    if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(JSON.stringify(payload));
    }
};
