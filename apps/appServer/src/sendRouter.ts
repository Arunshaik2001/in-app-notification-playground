import {Router, Request, Response, NextFunction} from 'express';
import {
    SendNotificationRequest,
} from "@repo/types/types";
import {redisClient} from "./config/redisConfig";
const router = Router();

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