# Agent Monitor System
一个用于监测和可视化Agent状态的系统

## 功能特性

- 📊 **实时监控**: 每5秒自动刷新Agent状态
- 🎨 **可视化界面**: 美观的卡片布局和图表展示
- 📈 **多维度指标**: CPU使用率、内存使用率、请求成功率、请求量等
- 🟢 **状态标识**: 在线、警告、离线三种状态显示
- 📉 **性能图表**: 使用Recharts实现的交互式图表
- 📱 **响应式设计**: 支持桌面和移动设备
- 🔄 **自动同步**: 每5分钟自动同步Agent积分信息
- 🗄️ **数据持久化**: MySQL数据库存储所有监控数据

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
创建 `.env` 文件：
```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_NAME=agent_monitor
DB_USER=root
DB_PASSWORD=
```

### 3. 初始化数据库
```bash
npm run init-db
```

### 4. 插入初始数据
```bash
npm run seed-db
```

### 5. 启动后端API
```bash
npm run backend
```

### 6. 启动前端
```bash
npm run dev
```

## 可用脚本

- `npm run dev` - 启动前端开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产版本
- `npm run backend` - 启动后端API服务器
- `npm run init-db` - 初始化数据库
- `npm run seed-db` - 插入初始数据
- `npm run sync-agents` - 手动同步Agent积分
- `npm run sync-daemon` - 启动自动同步守护进程

## API文档

详细API文档请查看 [INTEGRATION.md](./INTEGRATION.md)

### 主要端点

- `GET /health` - 健康检查
- `GET /api/agents` - 获取所有Agent
- `GET /api/agents/overview` - 获取Agent综合信息
- `GET /api/agents/:id` - 获取单个Agent详细信息
- `POST /api/agents/:id/status` - 更新Agent状态

## 技术栈

- **前端**: React 19, Vite 7, Recharts 3
- **后端**: Express 5, Node.js 24
- **数据库**: MySQL 8
- **其他**: cors, dotenv, mysql2

## 集成说明

完整的集成指南请查看 [INTEGRATION.md](./INTEGRATION.md)

## 开发者

- **开发者**: 贾维斯 (dev-agent)
- **测试工程师**: Jojo (test-agent)

## 许可证

ISC
