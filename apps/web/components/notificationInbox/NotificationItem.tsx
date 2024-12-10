import { motion } from "framer-motion";
import {Notification} from "@repo/types/types";

interface NotificationItemProps {
    notification: Notification;
}

const colors = ["bg-blue-500", "bg-green-500", "bg-red-500", "bg-purple-500"];

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => (
    <li className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow-sm bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition-all duration-200">
        <div className="flex justify-between items-end mb-5">
        <span className="text-xs text-gray-900 dark:text-gray-300 italic">
          {new Date(notification.receivedAt).toLocaleString()}
        </span>
        </div>
        {notification.imageUrl && (
            <div className="mb-4">
                <img
                    src={notification.imageUrl}
                    alt="Notification"
                    className="w-full h-32 object-contain"
                />
            </div>
        )}
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {notification.title}
            </h3>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
            {notification.body}
        </p>
        {notification.actions?.length > 0 && (
            <div className="flex gap-3 mt-4">
                {notification.actions.map((action, idx) => {
                    const colorClass = colors[idx % colors.length];
                    return (
                        <motion.button
                            key={idx}
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            onClick={() => window.open(action.actionUrl, "_blank")}
                            className={`text-white py-2 px-4 rounded-md shadow-sm hover:shadow-lg transition-all duration-300 ${colorClass}`}
                        >
                            {action.label}
                        </motion.button>
                    );
                })}
            </div>
        )}
    </li>
);

export default NotificationItem;
