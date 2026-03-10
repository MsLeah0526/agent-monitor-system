# Phase 1: 实时监控与告警系统

## 概述

Phase 1 实现了Agent监控系统的核心实时功能，包括WebSocket连接管理、异常检测与告警、以及实时数据同步。

## 功能特性

### 1. WebSocket实时连接

- **WebSocket服务器**: 基于`ws`库实现的高性能WebSocket服务器
- **Agent连接管理**: 自动管理Agent的注册、连接和断开
- **心跳检测**: 每30秒检测一次Agent心跳
- **在线状态实时更新**: 实时跟踪Agent的在线/离线状态

### 2. 异常检测与告警

- **Agent离线告警**: Agent超过2分钟无响应时触发告警
- **积分异常告警**: 积分变化超过±20分时触发告警
- **任务失败率告警**: 任务失败率超过10%时触发告警
- **多渠道通知**: 支持飞书、邮件、钉钉三种通知渠道

### 3. 实时数据同步

- **积分实时推送**: 积分变化实时同步到数据库
- **性能指标实时更新**: 任务完成率、失败率等指标实时更新
- **状态变更实时记录**: Agent状态变化实时记录到数据库

## 技术架构

### 技术栈

- **WebSocket**: ws (v8.19.0)
- **Node.js**: v18+
- **数据库**: SQLite3 (v5.1.7)
- **通知服务**:
  - 飞书: axios (v1.13.6)
  - 邮件: nodemailer (v8.0.2)
  - 钉钉: axios (v1.13.6)

### 核心模块

```
backend/
├── websocket-server.js      # WebSocket服务器主类
├── agent-manager.js          # Agent连接和状态管理
├── alert-service.js          # 告警检测和通知服务
├── data-sync.js              # 数据同步服务
├── websocket-main.js         # 服务器入口文件
├── test-client.js            # 测试客户端
├── run-test.sh               # 测试脚本
└── notifiers/
    ├── feishu-notifier.js    # 飞书通知
    ├── email-notifier.js     # 邮件通知
    └── dingtalk-notifier.js  # 钉钉通知
```

## 使用方法

### 1. 环境配置

创建`.env`文件并配置以下变量：

```bash
# WebSocket服务器端口
WS_PORT=8080

# 飞书通知配置（可选）
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxx
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret

# 邮件通知配置（可选）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password
FROM_EMAIL=noreply@agent-monitor.com
TO_EMAILS=admin@example.com,ops@example.com

# 钉钉通知配置（可选）
DINGTALK_WEBHOOK_URL=https://oapi.dingtalk.com/robot/send?access_token=xxx
DINGTALK_SECRET=your_secret

# Dashboard URL（用于告警消息中的链接）
DASHBOARD_URL=http://localhost:3000
```

### 2. 启动WebSocket服务器

```bash
npm run websocket
```

服务器将在8080端口启动。

### 3. 测试系统

运行测试脚本：

```bash
cd backend
./run-test.sh
```

或者手动启动测试客户端：

```bash
node backend/test-client.js
```

测试客户端会：
- 连接4个模拟Agent
- 发送心跳包
- 模拟积分更新
- 模拟任务完成和失败
- 触发告警

## WebSocket协议

### 客户端 → 服务器

#### 注册Agent
```json
{
  "type": "register",
  "agentId": "pm-agent"
}
```

#### 心跳
```json
{
  "type": "heartbeat",
  "timestamp": 1710067200000
}
```

#### 更新状态
```json
{
  "type": "agent_status",
  "status": "busy",
  "timestamp": 1710067200000
}
```

#### 更新积分
```json
{
  "type": "score_update",
  "score": 100,
  "timestamp": 1710067200000
}
```

#### 任务完成
```json
{
  "type": "task_complete",
  "taskId": "task-001",
  "timestamp": 1710067200000
}
```

#### 任务失败
```json
{
  "type": "task_fail",
  "taskId": "task-002",
  "timestamp": 1710067200000
}
```

### 服务器 → 客户端

#### 欢迎消息
```json
{
  "type": "welcome",
  "clientId": "client_1710067200000_abc123",
  "timestamp": 1710067200000
}
```

#### 注册成功
```json
{
  "type": "register_success",
  "agentId": "pm-agent",
  "timestamp": 1710067200000
}
```

#### 心跳确认
```json
{
  "type": "heartbeat_ack",
  "timestamp": 1710067200000
}
```

#### 广播消息（所有客户端）
```json
{
  "type": "agent_online",
  "agentId": "pm-agent",
  "timestamp": 1710067200000
}
```

```json
{
  "type": "score_update",
  "agentId": "pm-agent",
  "score": 100,
  "change": 20,
  "timestamp": 1710067200000
}
```

## 数据库结构

### agents表
- `id`: Agent ID（主键）
- `score`: 当前积分
- `status`: 状态（online/offline/busy/idle）
- `last_heartbeat`: 最后心跳时间
- `tasks_completed`: 完成任务数
- `tasks_failed`: 失败任务数
- `total_tasks`: 总任务数
- `created_at`: 创建时间
- `updated_at`: 更新时间

### agent_scores表
- `id`: 主键
- `agent_id`: Agent ID
- `score`: 积分值
- `change`: 积分变化
- `timestamp`: 时间戳

### agent_status表
- `id`: 主键
- `agent_id`: Agent ID
- `status`: 状态
- `timestamp`: 时间戳

### tasks表
- `id`: 主键
- `agent_id`: Agent ID
- `task_id`: 任务ID
- `status`: 任务状态
- `timestamp`: 时间戳

### alerts表
- `id`: 主键
- `type`: 告警类型
- `agent_id`: Agent ID
- `severity`: 严重程度
- `message`: 告警消息
- `timestamp`: 时间戳
- `notified`: 是否已通知

## 告警类型

### 1. Agent离线告警
- **触发条件**: Agent超过2分钟无心跳
- **严重程度**: 高
- **通知内容**: Agent ID、离线时长、时间

### 2. 积分异常告警
- **触发条件**: 积分变化超过±20分
- **严重程度**: 中
- **通知内容**: Agent ID、积分变化量、变化前后值

### 3. 任务失败率告警
- **触发条件**: 任务失败率超过10%
- **严重程度**: 高
- **通知内容**: Agent ID、失败率

## 验收标准

- ✅ Agent离线1分钟内告警
- ✅ 积分变化实时同步（<5秒）
- ✅ 告警成功率>95%
- ✅ 支持多渠道通知

## 性能指标

- **心跳间隔**: 30秒
- **离线检测阈值**: 2分钟
- **数据同步间隔**: 5秒
- **告警检测间隔**: 1分钟

## 故障排查

### 服务器无法启动
1. 检查端口8080是否被占用
2. 检查`.env`文件配置
3. 查看日志输出

### 告警未发送
1. 检查通知渠道配置（飞书/邮件/钉钉）
2. 检查网络连接
3. 查看服务器日志

### 数据库错误
1. 检查`database/`目录权限
2. 检查SQLite3是否正确安装
3. 删除`database/monitor.db`重新初始化

## 下一步

Phase 1完成后，将进入Phase 2开发：
- Web Dashboard
- 实时积分排名
- 图表组件
- 报表功能

## 开发者

- DevAgent (贾维斯)
- 开发时间: 2周
- 分支: feature/monitor-upgrade-phase1
