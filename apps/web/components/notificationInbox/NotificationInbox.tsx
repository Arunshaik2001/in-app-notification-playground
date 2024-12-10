"use client";

import React, { useRef, useState, useEffect } from "react";
import ScrollToTopButton from "./ScrollToTopButton";
import NotificationList from "./NotificationList";
import {Notification} from "@repo/types/types";

interface NotificationInboxProps {
    notifications: Notification[];
}

const NotificationInbox: React.FC<NotificationInboxProps> = ({ notifications }: {notifications: Notification[]}) => {
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const notificationsContainerRef = useRef<HTMLDivElement>(null);
    const lastNotificationCount = useRef<number>(0);
    const [hasScrolled, setHasScrolled] = useState(false);

    useEffect(() => {
        const container = notificationsContainerRef.current;

        const handleScroll = () => {
            if (container) {
                const { scrollTop } = container;

                if (scrollTop < 20) {
                    setHasScrolled(false);
                    setShowScrollToTop(false);
                } else {
                    setHasScrolled(true);
                }
            }
        };

        container?.addEventListener("scroll", handleScroll);
        return () => container?.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (notifications.length > lastNotificationCount.current) {
            const container = notificationsContainerRef.current;
            if (container) {
                if (hasScrolled) {
                    setShowScrollToTop(true);
                }
            }
        }
        lastNotificationCount.current = notifications.length;
    }, [notifications, hasScrolled]);

    const handleScrollToTop = () => {
        notificationsContainerRef.current?.scrollTo({
            top: 0,
            behavior: "smooth",
        });
        setShowScrollToTop(false);
    };

    return (
        <div className="relative">
            {showScrollToTop && (
                <ScrollToTopButton onClick={handleScrollToTop}/>
            )}

            <div
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md h-96 overflow-y-auto"
                ref={notificationsContainerRef}
            >
                <NotificationList notifications={notifications}/>
            </div>
        </div>
    );
};

export default NotificationInbox;
