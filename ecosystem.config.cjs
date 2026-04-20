module.exports = {
  apps: [
    {
      name: "complianceos-web",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "./apps/web",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_restarts: 10,
      restart_delay: 5000,
    },
    {
      name: "complianceos-projector",
      script: "dist/projectors/worker.js",
      cwd: "./packages/server",
      env: {
        NODE_ENV: "production",
      },
      max_restarts: 10,
      restart_delay: 5000,
      watch: false,
    },
  ],
};