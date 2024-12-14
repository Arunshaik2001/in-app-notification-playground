import dotenv from "dotenv";
import express, { Request, Response } from 'express';
import sendRouter, {redisClient} from "./sendRouter";
import cors from "cors";
import authRouter from "./authRouter";
dotenv.config();

const app = express();

// Set up port
const port = process.env.APP_SERVER_PORT || 3000;

app.use(cors({
  origin: ['https://inapp-notifications.dev-boi.com/', 'http://localhost:3000']
}));
app.use(express.json());

app.use("/v1/send", sendRouter);
app.use("/v1/getToken", authRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

process.on('SIGINT', async () => {
  await redisClient.quit();
  console.log('Closing Redis client...');
  process.exit(0);
});