import dotenv from "dotenv";
import express, { Request, Response } from 'express';
import sendRouter from "./sendRouter";
import cors from "cors";
import authRouter from "./authRouter";
dotenv.config();

const app = express();

// Set up port
const port = process.env.APP_SERVER_PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use("/v1/send", sendRouter);
app.use("/v1/getToken", authRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});