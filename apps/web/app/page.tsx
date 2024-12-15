"use client";

import {NotificationForm} from "../components/notificationForm/index";
import ThemeToggle from "../components/ThemeToggle";
import {NotificationIcon} from "../components/notificationInbox/NotificationIcon";
import useIdentifier from "../hooks/useIdentifier";
import {WebsocketTransactionPayload} from "@repo/types/types";
import {WebSocketProvider} from "../context/WebsocketContext";
import { Toaster } from 'sonner';

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

    return (
        <WebSocketProvider initialPayload={initialPayload} reconnectDelay={3000} url={process.env.NEXT_PUBLIC_WEBSOCKET_URL!}>
            <Toaster />
            <div className="relative flex flex-col lg:flex-row gap-4 w-full min-h-screen dark:bg-gray-800">
                <div className="absolute top-4 right-4">
                    <ThemeToggle/>
                </div>

                <div className="flex flex-col-reverse w-full lg:flex-row lg:gap-4">
                    <div
                        className="lg:w-1/3 w-full bg-white dark:bg-gray-800 dark:text-gray-200 p-4 shadow rounded mt-10 lg:mt-0 lg:overflow-y-auto h-full">
                        <h2 className="text-lg font-bold mb-5 text-gray-800 dark:text-gray-100">
                            In-App Notification
                        </h2>
                        <NotificationForm/>
                    </div>

                    <div className="flex justify-center lg:flex-grow bg-gray-100 dark:bg-gray-900">
                        <div className="w-full md:w-[60%] dark:text-gray-200 p-4 mt-20">
                            <h2 className="text-lg font-bold mb-5 text-gray-800 dark:text-gray-100">
                                Notifications
                            </h2>
                            <NotificationIcon/>
                        </div>
                    </div>
                </div>
            </div>
        </WebSocketProvider>
    );
}
