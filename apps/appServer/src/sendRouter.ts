import {Router, Request, Response, NextFunction} from 'express';
import { createClient } from 'redis';
import {
    SendNotificationRequest,
} from "@repo/types/types";
const router = Router();

export const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect().then(r => console.log('successfully connected to redis'));

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body }: { body: SendNotificationRequest } = req;
        console.log(body);

        // Publish the notification
        await redisClient.publish(body.channel, JSON.stringify(body));
        res.send({
            data: {
                message: `Notification has been queued.`,
            },
        });
    } catch (err) {
        console.error('Error during publishing:', err);
        next(err); // Pass error to Express error handler
    }
});

export default router;