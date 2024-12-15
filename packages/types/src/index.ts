export type SendNotificationRequest = {
    subId: string;
    title: string;
    body: string;
    imageUrl: string;
    notificationType: NotificationType;
    channel: "feed" | "in_app";
    actions: Action[];
};

export type SendTestNotificationRequest = {
    subId: string[];
    title: string;
    body: string;
    imageUrl: string;
    notificationType: NotificationType;
    channel: "feed" | "in_app";
    actions: Action[];
    secretKey: string;
};

export type NotificationType = "feed" | "in_app:card" | "in_app:banner" | "in_app:modal";

type MessageType = "identifier" | "message" | "ping" | "notificationStatus" | 'unreadCount';

export type WebsocketTransactionPayload = {
    type: MessageType;
    content: {
        data: {
            [key: string]: any;
            notifications?: Notification[]
        };
    };
};

export type RedisMessageHandler = (message: string, channel: string) => void;

export type Notification = SendNotificationRequest & {id: number, unRead: boolean, receivedAt: number};

export type Action = {
    actionUrl: string;
    label: string;
}

export type InvalidateCacheRequest = {
    secretKey: string;
};