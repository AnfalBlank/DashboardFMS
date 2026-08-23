module.exports = {
  apps: [
    {
      name: 'fuel-backend',
      script: 'dist/main.js',
      cwd: __dirname,
      instances: 1, // Set to 'max' or a number > 1 if running cluster mode without stateful cron conflicts
      exec_mode: 'fork', // Use 'cluster' for load balancing if desired
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
