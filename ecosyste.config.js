module.exports = {
  apps: [
    {
      name: 'backend-app',
      script: './server.js',
      watch: false,
      force: true,
      env: {
        PORT: 3005,
        NODE_ENV: 'production',
      },
    },
  ],
};