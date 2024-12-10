import dotenv from "dotenv";
import express, { Request, Response } from 'express';
import sendRouter from "./sendRouter";
import cors from "cors";
import authRouter from "./authRouter";
dotenv.config();

const app = express();

// Set up port
const port = process.env.APP_SERVER_PORT || 3000;

app.use(cors({
  origin: '*'
}));
app.use((req, res, next) => {
  console.log(req.headers)
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use(express.json());

app.use("/v1/send", sendRouter);
app.use("/v1/getToken", authRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});