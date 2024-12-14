import NotificationItem from "./NotificationItem";
import {Notification} from "@repo/types/types";
import React, {useEffect} from "react";
import {useWebSocket} from "../../context/WebsocketContext";

interface NotificationListProps {
    notifications: Notification[];
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications }: NotificationListProps) => {
    const { updateNotificationStatus, readNotificationSet } = useWebSocket();

    useEffect(() => {
        notifications.forEach(notification => {
            if (!notification.unRead) {
                readNotificationSet.add(notification.id);
            }
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const notificationId = parseInt(entry.target.getAttribute('data-id')!);
                        if (notificationId) {
                            if (!readNotificationSet.has(notificationId)) {
                                updateNotificationStatus(notificationId, 'read');
                                readNotificationSet.add(notificationId);
                            }
                        }
                    }
                });
            },
            {
                root: null,
                threshold: 0.8,
            }
        );

        const notificationElements = document.querySelectorAll('.notification-item');
        notificationElements.forEach((item) => observer.observe(item));

        return () => {
            notificationElements.forEach((item) => observer.unobserve(item));
        };
    }, [notifications, updateNotificationStatus]);


    if (notifications.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                    No notifications yet.
                </p>
            </div>
        );
    }

    return (
        <ul className="space-y-4">
            {notifications.map((notification, index) => (
                <NotificationItem key={index} notification={notification} />
            ))}
        </ul>
    );
};

export default NotificationList;
