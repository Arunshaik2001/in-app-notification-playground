import NotificationItem from "./NotificationItem";
import {Notification} from "@repo/types/types";

interface NotificationListProps {
    notifications: Notification[];
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications }) => {
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
