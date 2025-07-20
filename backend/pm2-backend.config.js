module.exports = {
  apps: [
    {
      name: "tbp-backend",
      script: "server.js",
      watch: true,
      ignore_watch: [
        "node_modules",
        "logs",
        "public",
      ],
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
