import React, {useState} from "react";
import {NotificationInbox} from "./index";
import {BellIcon} from "@heroicons/react/24/outline";
import {motion} from "framer-motion";
import {useWebSocket} from "../../context/WebsocketContext";

export const NotificationIcon: React.FC<{}> = () => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleNotifications = () => setIsOpen(!isOpen);

    const {
        notifications,
        unReadCount
    } = useWebSocket();

    return (
        <div className="relative">
            <div className="relative inline-flex items-center cursor-pointer" onClick={toggleNotifications}>
                {/* Notification Bell Icon */}
                <motion.div
                    whileTap={{scale: 0.9, rotate: -10}}
                    whileHover={{scale: 1.1}}
                    transition={{type: "spring", stiffness: 300}}
                    className="relative"
                >
                    <BellIcon className="w-8 h-8 text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-300"/>
                </motion.div>

                {/* Unread Badge */}
                {unReadCount > 0 && (
                    <motion.span
                        whileTap={{scale: 0.9, rotate: -10}}
                        whileHover={{scale: 1.1}}
                        initial={{scale: 0}}
                        animate={{scale: 1}}
                        transition={{type: "spring", stiffness: 200}}
                        className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full select-none"
                    >
                        {unReadCount}
                    </motion.span>
                )}
            </div>
            {isOpen && (
                <div className="w-full h-full">
                    <NotificationInbox notifications={notifications}/>
                </div>
            )}
        </div>
    );
};
