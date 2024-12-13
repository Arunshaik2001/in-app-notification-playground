'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {Notification, WebsocketTransactionPayload} from "@repo/types/types";

interface WebSocketContextType {
    isConnected: boolean;
    notifications: Notification[];
    unReadCount: number;
    sendMessage: (msg: object) => void;
    updateNotificationStatus: (notificationId: number, status: 'read' | 'unread') => void;
    readNotificationSet: Set<number>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

interface WebSocketProviderProps {
    children: React.ReactNode;
    initialPayload: WebsocketTransactionPayload;
    reconnectDelay: number;
    url: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children,url, initialPayload, reconnectDelay = 5000 }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unReadCount, setUnReadCount] = useState<number>(0);
    const socket = useRef<WebSocket | null>(null);
    const reconnectAttempts = useRef(0);
    const [readNotificationsSet, setReadNotificationsSet] = useState<Set<number>>(new Set());


    const connectWebSocket = async () => {
        console.log("Attempting to connect to WebSocket...");

        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_SERVER_URL}/getToken`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                subId: initialPayload.content.data.subId,
            }),
        });

        if (!res.ok) {
            throw new Error(`Error fetching token: ${res.statusText}`);
        }

        const data = await res.json();
        const token = data.token;

        if (!token) {
            throw new Error("Token not found in response");
        }

        const ws = new WebSocket(`${url}?token=${token}`);
        socket.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);
            reconnectAttempts.current = 0; // Reset reconnect attempts

            // Send the initial payload upon connection
            if (initialPayload) {
                ws.send(JSON.stringify(initialPayload));
            }
        };

        ws.onmessage = (event) => {
            const notificationPayload: WebsocketTransactionPayload = JSON.parse(event.data);
            if(notificationPayload.type !== "message"){
                if(notificationPayload.type === 'unreadCount'){
                    console.log("Received unreadCount", notificationPayload.content.data.notificationsUnreadCount || 0);
                    setUnReadCount(notificationPayload.content.data.notificationsUnreadCount || 0);
                }
                return;
            }

            const notifications = notificationPayload.content.data.notifications ?? [];
            // Add the new notification to the list
            setNotifications((prevNotifications) => [...notifications, ...prevNotifications]);
            setUnReadCount(notificationPayload.content.data.notificationsUnreadCount || 0);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = (event) => {
            console.warn("WebSocket connection closed:", event.code);
            setIsConnected(false);

            // Attempt to reconnect
            if (reconnectAttempts.current < 5) {
                reconnectAttempts.current += 1;
                setTimeout(connectWebSocket, reconnectDelay);
            } else {
                console.error("Max reconnection attempts reached");
            }
        };
    };

    const updateNotificationStatus = (notificationId: number, status: 'read' | 'unread') => {
        console.log(notificationId);
        // Send the updated status to the WebSocket server
        const payloadData: WebsocketTransactionPayload = {
            type: 'notificationStatus',
            content: {
                data: {
                    notificationId: notificationId,
                    subId: initialPayload.content.data.subId,
                    status: status
                }
            }
        };
        socket.current?.send(JSON.stringify(payloadData));
    };

    useEffect(() => {
        // Establish WebSocket connection
        connectWebSocket();

        return () => {
            if (socket.current && socket.current.readyState === WebSocket.OPEN) {
                socket.current.close();
            }
        };
    }, [url]);

    // Heartbeat to keep the connection alive
    useEffect(() => {
        let pingInterval: NodeJS.Timeout;
        if (isConnected && socket.current) {
            pingInterval = setInterval(() => {
                if (socket.current?.readyState === WebSocket.OPEN) {
                    socket.current.send(JSON.stringify({ type: "ping" }));
                }
            }, 30000); // Send a ping every 30 seconds
        }
        return () => clearInterval(pingInterval);
    }, [isConnected]);

    return (
        <WebSocketContext.Provider
            value={{
                isConnected,
                notifications,
                unReadCount,
                sendMessage: (msg: object) => socket.current?.send(JSON.stringify(msg)),
                updateNotificationStatus,
                readNotificationSet: readNotificationsSet
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};
