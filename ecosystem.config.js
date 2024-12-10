const {appServerConfig, inAppWsConfig}  = require("./env")
module.exports = {
  apps: [
    {
      name: "appServer",
      script: "sh -c 'cd ./apps/appServer && npm run dev'",
      env: {
        NODE_ENV: "development",
        ...appServerConfig
      },
      env_production: {
        NODE_ENV: "production",
        ...appServerConfig
      }
    },
    {
      name: "inAppWs",
      script: "sh -c 'cd ./apps/inappWs && npm run dev'",
      env: {
        NODE_ENV: "development",
        ...inAppWsConfig
      },
      env_production: {
        NODE_ENV: "production",
        ...inAppWsConfig
      }
    }
  ],
};
