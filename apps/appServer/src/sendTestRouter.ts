import {Router, Request, Response, NextFunction} from 'express';
import {
    SendNotificationRequest,
    SendTestNotificationRequest,
} from "@repo/types/types";
import {redisClient} from "./config/redisConfig";
const sendTestRouter = Router();

sendTestRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body }: { body: SendTestNotificationRequest } = req;
        console.log(body);
        if(body.secretKey !== process.env.JWT_SECRET_KEY){
            res.status(401).send({
                data: "Unauthorized",
            });
            return;
        }

        for (let i=0; i < 20; i++){
            for (let index = 0; index < body.subId.length; index++) {
                const clientId = body.subId[index]!;
                const payload: SendNotificationRequest = {
                    ...body,
                    subId: clientId,
                };
                // Publish the notification
                await redisClient.publish(body.channel, JSON.stringify(payload));
            }
        }

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

export default sendTestRouter;