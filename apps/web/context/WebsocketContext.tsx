'use client';

import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import {Notification, WebsocketTransactionPayload} from "@repo/types/types";
import {toast} from "sonner";

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

const tokenAbortController = new AbortController();
const getTokenTimeout = setTimeout(() => tokenAbortController.abort(), 10000);

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children,url, initialPayload, reconnectDelay = 5000 }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unReadCount, setUnReadCount] = useState<number>(0);
    const socket = useRef<WebSocket | null>(null);
    const reconnectAttempts = useRef(0);
    const [readNotificationsSet, setReadNotificationsSet] = useState<Set<number>>(new Set());

    const showConnectingToServerToast = useRef(true);
    const fetchToken = async (): Promise<string | null> => {
        console.log("Fetching token...");
        let token: string | null = null;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_APP_SERVER_URL}/getToken`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subId: initialPayload.content.data.subId,
                }),
                signal: tokenAbortController.signal,
            });

            clearTimeout(getTokenTimeout);

            if (!res.ok) {
                throw new Error(`Error fetching token: ${res.statusText}`);
            }

            const data = await res.json();
            token = data.token;

            if (!token) {
                throw new Error("Token not found in response");
            }
        } catch (error) {
            console.error("Error fetching token:", error);
            toast.error("Couldn't fetch token.", {
                duration: 5000,
                style: {
                    backgroundColor: "red",
                    color: "white",
                },
            });
        }

        return token;
    };

    const connectWebSocket = async (token: string | null) => {
        if (!token) {
            console.error("Cannot connect WebSocket without a valid token.");
            return;
        }

        console.log("Connecting to WebSocket...");
        let connectingToServerToastId: string | number | undefined;

        if (showConnectingToServerToast.current) {
            connectingToServerToastId = toast.info("Please wait, connecting to server.");
            showConnectingToServerToast.current = false;
        }

        const ws = new WebSocket(`${url}?token=${token}`);
        socket.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connected");
            if(connectingToServerToastId){
                toast.dismiss(connectingToServerToastId);
            }
            toast.success("Successfully connected to server.", {
                style: {
                    backgroundColor: "green",
                    color: "white",
                },
            });
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
                    setUnReadCount(notificationPayload.content.data.notificationsUnreadCount || 0);
                }
                return;
            }

            const notifications = notificationPayload.content.data.notifications ?? [];
            // Add the new notification to the list
            setNotifications((prevNotifications) => {
                const allNotifications = [...notifications, ...prevNotifications];
                return Array.from(
                    new Map(allNotifications.map(notification => [notification.id, notification])).values()
                );
            });
            setUnReadCount(notificationPayload.content.data.notificationsUnreadCount || 0);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            if(reconnectAttempts.current == 5){
                toast.error("Couldn't connect to server", {
                    duration: 5000,
                    style: {
                        backgroundColor: "red",
                        color: "white",
                    },
                });
            }
        };

        ws.onclose = async (event) => {
            console.warn("WebSocket connection closed:", event.code);
            setIsConnected(false);

            if (event.code === 4001) {
                console.log("Token expired, fetching a new token...");
                const newToken = await fetchToken();
                if (newToken) {
                    await connectWebSocket(newToken);
                }
                return;
            }

            // Attempt to reconnect without fetching a new token
            if (reconnectAttempts.current < 5) {
                reconnectAttempts.current += 1;
                setTimeout(() => connectWebSocket(token), reconnectDelay);
            } else {
                console.error("Max reconnection attempts reached");
            }
        };
    };

    const updateNotificationStatus = (notificationId: number, status: 'read' | 'unread') => {
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
        const initializeWebSocket = async () => {
            const token = await fetchToken();
            if (token) {
                await connectWebSocket(token);
            }
        };

        initializeWebSocket();

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
