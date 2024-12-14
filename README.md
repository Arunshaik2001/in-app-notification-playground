# In-App Notifications Playground

This webapp simply uses websockets to get notifications in real-time.



https://github.com/user-attachments/assets/755fc411-51dd-4171-aae7-3fe12442eff3



## Setup the project

1. This repo uses pm2 for managing node apps.
```sh
$ npm install pm2@latest -g
```

2. Create **env.js** file at root.
   ```js
    const inAppWsConfig = {
        REDIS_URL: "YOUR_REDIS_URL",
        IN_APP_WEBSOCKET_PORT: 3001,
        JWT_SECRET_KEY: "JWT_SECRET_KEY"
    }

    const appServerConfig = {
        REDIS_URL: "YOUR_REDIS_URL",
        JWT_SECRET_KEY: "JWT_SECRET_KEY",
        APP_SERVER_PORT: 3002
    }

    module.exports = {
        inAppWsConfig,
        appServerConfig
    };
   ```

3. Run the node apps using:

```sh
 npx pm2 start ecosystem.config.js
```

4. Run this cmd for web app:
```sh
  npm run dev
```
