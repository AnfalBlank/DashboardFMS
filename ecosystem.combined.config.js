const path = require('path');

const BACKEND_DIR = path.resolve(__dirname);
const FRONTEND_DIR = path.resolve(__dirname, '../fuel-monitoring');

module.exports = {
  apps: [
    {
      name: 'fuel-backend',
      script: 'dist/main.js',
      cwd: BACKEND_DIR,
      instances: 1,
      exec_mode: 'fork',
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
      error_file: path.join(BACKEND_DIR, 'logs/backend-error.log'),
      out_file: path.join(BACKEND_DIR, 'logs/backend-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
    {
      name: 'fuel-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4001',
      cwd: FRONTEND_DIR,
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 4001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4001,
        NEXT_PUBLIC_API_URL: 'http://localhost:4000',
      },
      error_file: path.join(FRONTEND_DIR, 'logs/frontend-error.log'),
      out_file: path.join(FRONTEND_DIR, 'logs/frontend-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
