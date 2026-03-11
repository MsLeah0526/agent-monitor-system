import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// 导入路由
import agentsRouter from './routes/agents.mjs';
import agentsDetailRouter from './routes/agents-detail.mjs';
import tasksRouter from './routes/tasks.mjs';
import invocationsRouter from './routes/invocations.mjs';
import communicationsRouter from './routes/communications.mjs';
import teamRouter from './routes/team.mjs';
import alertsRouter from './routes/alerts.mjs';
import reportsRouter from './routes/reports.mjs';
import authRouter from './routes/auth.mjs';
import analysisRouter from './routes/analysis.mjs';

// 导入中间件
import { authMiddleware, optionalAuthMiddleware } from './middleware/auth.mjs';

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查（公开）
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Agent Monitor API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 公开API路由（不需要认证）
app.use('/api/auth', authRouter);

// 需要认证的API路由
app.use('/api/agents', authMiddleware, agentsDetailRouter);
app.use('/api/agents', authMiddleware, agentsRouter);
app.use('/api/tasks', authMiddleware, tasksRouter);
app.use('/api/invocations', authMiddleware, invocationsRouter);
app.use('/api/communications', authMiddleware, communicationsRouter);
app.use('/api/team', authMiddleware, teamRouter);
app.use('/api/alerts', authMiddleware, alertsRouter);
app.use('/api/reports', authMiddleware, reportsRouter);
app.use('/api/analysis', authMiddleware, analysisRouter);

// 根路由
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Agent Monitor API',
    endpoints: {
      agents: '/api/agents',
      tasks: '/api/tasks',
      invocations: '/api/invocations',
      communications: '/api/communications',
      health: '/health'
    },
    version: '1.0.0'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    endpoints: {
      agents: '/api/agents',
      tasks: '/api/tasks',
      invocations: '/api/invocations',
      communications: '/api/communications',
      health: '/health'
    }
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('API错误:', err);
  res.status(err.status || 500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Agent Monitor API服务器已启动`);
  console.log(`📡 服务地址: http://0.0.0.0:${port}`);
  console.log(`🌐 API根路径: http://0.0.0.0:${port}/`);
  console.log(`💚 健康检查: http://0.0.0.0:${port}/health`);
  console.log(`⌚ 启动时间: ${new Date().toLocaleString()}`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});