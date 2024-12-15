import dotenv from "dotenv";
import { createHttpServer } from "./config/server";
import {clients, setupWebSocketServer} from "./handlers/websocketHandler";
import { setupRedisSubscription } from "./handlers/redisHandler";
import {redisCacheHandler, setupRedisCache} from "./handlers/redisCacheHandler";
import {redisCacheConfig} from "./config/redisCacheConfig";
import {redisSubscriberConfig} from "./config/redisSubscriberConfig";
import {inMemoryCacheHandler} from "./handlers/inMemoryCacheHandler";

dotenv.config();

const server = createHttpServer();

setupWebSocketServer(server);

setupRedisSubscription().then(() => {
  console.log("Redis subscription init successful.");
});

setupRedisCache().then(() => {
  console.log("Redis cache init successful.");
});

const PORT: number = Number(process.env.IN_APP_WEBSOCKET_PORT || 3001);
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

process.on('SIGINT', async () => {
  await redisSubscriberConfig.quit();

  clients.forEach((value, key) => {
    const notifications = inMemoryCacheHandler.getNotificationsFromCache(key);
    const unreadNotifications = inMemoryCacheHandler.getReadNotificationsFromCache(key);

    if (notifications.length > 0) {
      redisCacheHandler.setNotificationsInCache(key, notifications);
      redisCacheHandler.setReadNotificationsFromCache(key, unreadNotifications);
    }
  })


  await redisCacheConfig.quit();

  console.log('Closed Redis client...');
  process.exit(0);
});