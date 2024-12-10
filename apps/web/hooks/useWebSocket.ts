"use client";

import { useEffect, useRef, useState } from "react";
import {WebsocketTransactionPayload, Notification} from "@repo/types/types";

const useWebSocketWithReconnection = (url: string, initialPayload: WebsocketTransactionPayload, reconnectDelay = 5000) => {
    const socket = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const reconnectAttempts = useRef(0);

    const connectWebSocket = async () => {
        console.log("Attempting to connect to WebSocket...");

        const res = await fetch("http://localhost:3002/v1/getToken", {
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
                return;
            }
            const notifications = notificationPayload.content.data.notifications ?? [];
            // Add the new notification to the list
            setNotifications((prevNotifications) => [...notifications, ...prevNotifications]);
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

    return { isConnected, notifications, sendMessage: (msg: object) => socket.current?.send(JSON.stringify(msg)) };
};

export default useWebSocketWithReconnection;
