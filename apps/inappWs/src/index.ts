import dotenv from "dotenv";
import { createHttpServer } from "./config/server";
import { setupWebSocketServer } from "./handlers/websocketHandler";
import { setupRedisSubscription } from "./handlers/redisHandler";
import {setupRedisCache} from "./handlers/redisCacheHandler";

dotenv.config();

const server = createHttpServer();

setupWebSocketServer(server);

setupRedisSubscription().then(() => {
  console.log("Redis subscription init successful.");
});

setupRedisCache().then(() => {
  console.log("Redis cache client init successful.");
});

const PORT: number = Number(process.env.IN_APP_WEBSOCKET_PORT || 3001);
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
