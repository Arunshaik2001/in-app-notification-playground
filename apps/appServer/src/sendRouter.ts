// send.router.ts
import express, {Router, Request, Response, NextFunction} from 'express';
import { createClient } from 'redis';
import {
    SendNotificationRequest,
} from "@repo/types/types";
const router = Router();

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body }: {body: SendNotificationRequest} = req;
        console.log(body);

        await redisClient.connect();
        await redisClient.publish(body.channel, JSON.stringify(body));
        res.send(`Message published to channel "${body.channel}"`);
    } catch (err) {
        console.error('Error during publishing:', err);
    } finally {
        await redisClient.quit();
    }
});

export default router;