"use client";

import {NotificationForm} from "../components/notificationForm/index";
import {NotificationInbox} from "../components/notificationInbox/index";
import useWebSocketWithNotifications from "../hooks/useWebSocket";
import useIdentifier from "../hooks/useIdentifier";
import {WebsocketTransactionPayload} from "@repo/types/types";
import ThemeToggle from "../components/ThemeToggle"; // Import the theme toggle component

export default function Home() {
    const {subId} = useIdentifier()
    const initialPayload: WebsocketTransactionPayload = {
        type: "identifier",
        content: {
            data: {
                subId: subId,
            },
        },
    };

    const { isConnected, notifications} = useWebSocketWithNotifications(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`, initialPayload);

    return (
        <div className="relative flex flex-col lg:flex-row gap-4 w-full min-h-screen dark:bg-gray-800">
            <div className="absolute top-4 right-4">
                <ThemeToggle/>
            </div>

            <div
                className="lg:w-1/3 w-full bg-white dark:bg-gray-800 dark:text-gray-200 p-4 shadow rounded mt-10 lg:mt-0 lg:overflow-y-auto h-full">
                <h2 className="text-lg font-bold mb-5 text-gray-800 dark:text-gray-100">
                    In-App Notification
                </h2>
                <NotificationForm/>
            </div>

            <div className="flex items-center justify-center w-full bg-gray-100 dark:bg-gray-900">
                <div className="w-full lg:w-[45%] bg-white dark:bg-gray-800 dark:text-gray-200 p-4 shadow rounded">
                    <h2 className="text-lg font-bold mb-5 text-gray-800 dark:text-gray-100">
                        Notifications
                    </h2>
                    <NotificationInbox notifications={notifications}/>
                </div>
            </div>
        </div>
    );
}
