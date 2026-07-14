module.exports = {
  apps: [
    {
      name: 'magister-erp',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      cwd: '/var/www/magister',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    }
  ]
};
