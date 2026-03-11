module.exports = {
  apps: [
    {
      name: 'agent-monitor-api',
      script: './backend/server.mjs',
      cwd: '/root/.openclaw/dev-agent/archives/agent-monitor-system',
      interpreter: '/root/.nvm/versions/node/v24.14.0/bin/node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0',
        DB_HOST: 'localhost',
        DB_PORT: 3306,
        DB_USER: 'agent_monitor',
        DB_PASSWORD: 'tmKVGzjqtRQ8V0dWIN4x9ry0W',
        DB_NAME: 'agent_monitor_prod',
        JWT_SECRET: 'agent_monitor_prod_secret_key_change_in_production_2024'
      },
      error_file: '/var/log/agent-monitor/api-error.log',
      out_file: '/var/log/agent-monitor/api-out.log',
      log_file: '/var/log/agent-monitor/api-combined.log',
      time: true
    },
    {
      name: 'agent-monitor-ws',
      script: './backend/websocket-main.js',
      cwd: '/root/.openclaw/dev-agent/archives/agent-monitor-system',
      interpreter: '/root/.nvm/versions/node/v24.14.0/bin/node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        WS_PORT: 8080,
        HOST: '0.0.0.0',
        DB_HOST: 'localhost',
        DB_PORT: 3306,
        DB_USER: 'agent_monitor',
        DB_PASSWORD: 'tmKVGzjqtRQ8V0dWIN4x9ry0W',
        DB_NAME: 'agent_monitor_prod'
      },
      error_file: '/var/log/agent-monitor/ws-error.log',
      out_file: '/var/log/agent-monitor/ws-out.log',
      log_file: '/var/log/agent-monitor/ws-combined.log',
      time: true
    }
  ]
};
