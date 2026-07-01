module.exports = {
  apps: [
    {
      name: 'globalTrade',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3009,
        NODE_ENV: 'production',
      },
    },
  ],
};
