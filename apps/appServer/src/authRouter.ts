import {Router, Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

const authRouter = Router();

const validateUser = (subId: string) => {
    return subId !== null && typeof subId !== 'undefined' && subId.length == 7;
};

authRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const { subId } = req.body;

    if (!subId) {
        return res.status(400).send({ error: "Subscriber Id is required" });
    }

    if (!validateUser(subId)) {
        return res.status(401).send({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ subId }, process.env.JWT_SECRET_KEY!, { expiresIn: process.env.TOKEN_EXPIRATION || "1h" });

    console.log('Authentication Token:', token);
    res.status(200).send({ token });
});

export default authRouter;