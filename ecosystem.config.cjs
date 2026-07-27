module.exports = {
  apps: [
    {
      name: "opcwise-api",
      script: "server/index.js",
      env: { PORT: "5173" },
      watch: ["server"],
    },
    {
      name: "opcwise-vite",
      script: "./node_modules/.bin/vite",
      args: "--configLoader runner",
      env: { NODE_ENV: "development" },
    },
  ],
};
