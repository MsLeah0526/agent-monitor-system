# Agent监控系统 - 集成指南

## 📋 概述

本文档说明如何将Agent信息集成到监控系统中，包括数据库初始化、数据同步和API使用。

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd /root/.openclaw/dev-agent/agent-monitor-system
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
# API服务器配置
PORT=3001
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_NAME=agent_monitor
DB_USER=root
DB_PASSWORD=
```

### 3. 初始化数据库

```bash
npm run init-db
```

这将创建以下表：
- `agents` - Agent基本信息
- `agent_status` - Agent实时状态
- `agent_tasks` - Agent任务记录
- `agent_invocations` - Agent调用记录
- `agent_communications` - Agent通信记录
- `agent_overview` - Agent综合视图

### 4. 插入初始数据

```bash
npm run seed-db
```

这将插入7个Agent的初始信息：
- mrleader (小李子)
- pm-agent (小红)
- dev-agent (贾维斯)
- data-agent (Fiz)
- test-agent (Jojo)
- ops-agent (欧派)
- monitor-agent (蔡文姬)

### 5. 启动后端API服务器

```bash
npm run backend
```

API服务器将在 `http://localhost:3001` 启动

### 6. 启动前端开发服务器

```bash
npm run dev
```

前端将在 `http://localhost:5000` 启动

---

## 🔄 数据同步

### 手动同步

执行一次Agent积分同步：

```bash
npm run sync-agents
```

### 自动同步

启动守护进程，每5分钟自动同步一次：

```bash
npm run sync-daemon
```

自定义同步间隔（例如每10分钟）：

```bash
node backend/syncAgents.mjs daemon 10
```

### 同步内容

同步脚本会：
1. 读取每个Agent的 `MEMORY.md` 文件
2. 提取当前积分
3. 计算优先级（基于积分规则）
4. 更新数据库中的积分和优先级

### 积分优先级规则

```
Elite (精英):    积分 ≥ 150  → 优先分配核心任务
High (高优):     积分 120-149 → 优先分配重要任务
Normal (正常):   积分 80-119  → 正常分配任务
Low (低优):      积分 60-79   → 降低任务频率
Warning (警告):  积分 40-59   → 暂停新任务
Critical (严重): 积分 < 40    → 暂停所有任务
```

---

## 📡 API端点

### 健康检查

```bash
GET http://localhost:3001/health
```

响应：
```json
{
  "success": true,
  "message": "Agent Monitor API is running",
  "timestamp": "2026-03-09T04:00:00.000Z",
  "uptime": 123.456
}
```

### 获取所有Agent

```bash
GET http://localhost:3001/api/agents
```

### 获取Agent综合信息

```bash
GET http://localhost:3001/api/agents/overview
```

### 获取单个Agent详细信息

```bash
GET http://localhost:3001/api/agents/:agentId
```

### 获取Agent实时状态

```bash
GET http://localhost:3001/api/agents/:agentId/status
```

### 更新Agent状态

```bash
POST http://localhost:3001/api/agents/:agentId/status
Content-Type: application/json

{
  "cpu_usage": 45.2,
  "memory_usage": 62.8,
  "requests_per_minute": 1523,
  "success_rate": 99.5,
  "current_task": "测试Agent监测系统",
  "subagent_count": 0
}
```

### 获取Agent任务记录

```bash
GET http://localhost:3001/api/agents/:agentId/tasks?page=1&limit=10
```

### 获取Agent调用记录

```bash
GET http://localhost:3001/api/agents/:agentId/invocations?page=1&limit=10
```

---

## 🗄️ 数据库结构

### agents表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(50) | Agent ID（主键） |
| name | VARCHAR(100) | Agent名称 |
| role | VARCHAR(100) | Agent角色 |
| emoji | VARCHAR(10) | Agent表情符号 |
| workspace | VARCHAR(255) | 工作区路径 |
| description | TEXT | 描述 |
| status | ENUM | 状态（online/warning/offline） |
| score | INT | 积分 |
| priority | ENUM | 优先级 |
| created_at | TIMESTAMP | 创建时间 |
| last_seen | TIMESTAMP | 最后活跃时间 |

### agent_status表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 自增ID（主键） |
| agent_id | VARCHAR(50) | Agent ID（外键） |
| cpu_usage | DECIMAL(5,2) | CPU使用率 |
| memory_usage | DECIMAL(5,2) | 内存使用率 |
| requests_per_minute | INT | 每分钟请求数 |
| success_rate | DECIMAL(5,2) | 成功率 |
| current_task | VARCHAR(255) | 当前任务 |
| subagent_count | INT | 子Agent数量 |
| timestamp | TIMESTAMP | 时间戳 |

---

## 🔧 集成到OpenClaw

### 1. 创建systemd服务

创建 `/etc/systemd/system/agent-monitor-api.service`：

```ini
[Unit]
Description=Agent Monitor API Server
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/.openclaw/dev-agent/agent-monitor-system
ExecStart=/usr/bin/node backend/server.mjs
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

创建 `/etc/systemd/system/agent-monitor-sync.service`：

```ini
[Unit]
Description=Agent Monitor Sync Service
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/.openclaw/dev-agent/agent-monitor-system
ExecStart=/usr/bin/node backend/syncAgents.mjs daemon 5
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### 2. 启动服务

```bash
sudo systemctl daemon-reload
sudo systemctl enable agent-monitor-api
sudo systemctl enable agent-monitor-sync
sudo systemctl start agent-monitor-api
sudo systemctl start agent-monitor-sync
```

### 3. 检查服务状态

```bash
sudo systemctl status agent-monitor-api
sudo systemctl status agent-monitor-sync
```

---

## 📊 监控数据流

```
Agent MEMORY.md
    ↓
syncAgents.mjs (每5分钟)
    ↓
MySQL数据库
    ↓
Express API
    ↓
React前端
    ↓
用户界面
```

---

## 🐛 故障排查

### 数据库连接失败

检查MySQL是否运行：

```bash
sudo systemctl status mysql
```

检查数据库凭据：

```bash
cat .env
```

### API服务器无法启动

检查端口是否被占用：

```bash
netstat -tlnp | grep 3001
```

### 同步脚本无法读取MEMORY.md

检查文件权限：

```bash
ls -la /root/.openclaw/*/MEMORY.md
```

---

## 📝 维护建议

1. **定期备份数据库**：每天备份一次
2. **监控API性能**：使用APM工具监控响应时间
3. **清理旧数据**：定期清理超过30天的状态记录
4. **更新Agent信息**：当有新Agent加入时，更新种子数据

---

## 📞 支持

如有问题，请联系：
- **开发者**：贾维斯 (dev-agent)
- **测试工程师**：Jojo (test-agent)

---

**文档版本**：1.0
**最后更新**：2026-03-09
