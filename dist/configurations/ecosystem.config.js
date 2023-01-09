"use strict";

module.exports = {
  apps: [{
    name: 'common-api',
    script: './server-register.js',
    exec_mode: 'cluster',
    instances: 'max',
    wait_ready: true,
    listen_timeout: 50000,
    kill_timeout: 5000,
    env: {
      PM2: 'PM2',
      NODE_ENV: 'development'
    },
    env_production: {
      PM2: 'PM2',
      NODE_ENV: 'production'
    }
  }]
};
//# sourceMappingURL=ecosystem.config.js.map