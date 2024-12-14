import {Router, Request, Response, NextFunction} from 'express';
import {InvalidateCacheRequest} from "@repo/types/types";
import {redisClient} from "./config/redisConfig";
const invalidateCacheRouter = Router();

invalidateCacheRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {body}: {body: InvalidateCacheRequest} = req;
        if(process.env.JWT_SECRET_KEY === body.secretKey){
            await redisClient.del("notifications");
            await redisClient.del("readNotifications");
            console.log('invalidated data');
            res.status(200).send({
                data: "Successfully invalidated data",
            });
        }
        else {
            res.status(401).send({
                data: "Unable to invalidate data due to secret key",
            });
        }
    } catch (err) {
        console.error('Error invalidating data:', err);
        res.status(500).send({
            data: "Unable to invalidate data",
        });
        next(err); // Pass error to Express error handler
    }
});

export default invalidateCacheRouter;