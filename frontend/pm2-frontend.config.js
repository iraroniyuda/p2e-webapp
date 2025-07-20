// pm2-frontend.config.js
module.exports = {
  apps: [
    {
      name: "",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001 -H 0.0.0.0",
      cwd: "",
      instances: 1,        // ⬅️ Gunakan 1 instance (fork mode)
      exec_mode: "fork",   // ⬅️ Pakai fork, bukan cluster
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}
