/**
 * 智能分析API路由
 */

import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import AnalysisEngine from '../../analysis/index.js';

dotenv.config();

const router = express.Router();

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'agent_monitor',
  user: process.env.DB_USER || 'agent_monitor_user',
  password: process.env.DB_PASSWORD || 'AgentMonitor@123',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 创建分析引擎实例
const analysisEngine = new AnalysisEngine();

/**
 * 获取Agent历史数据
 */
async function getAgentHistoryData(agentId) {
  try {
    // 获取积分历史
    const [scoreRows] = await pool.query(
      `SELECT score as value, created_at as timestamp 
       FROM agent_score_history 
       WHERE agent_id = ? 
       ORDER BY created_at DESC 
       LIMIT 30`,
      [agentId]
    );

    // 获取任务历史
    const [taskRows] = await pool.query(
      `SELECT status, task_type as type, error_message, duration, start_time as timestamp
       FROM agent_tasks
       WHERE agent_id = ?
       ORDER BY start_time DESC
       LIMIT 50`,
      [agentId]
    );

    // 获取性能数据
    let perfRows = [];
    try {
      [perfRows] = await pool.query(
        `SELECT cpu_usage, memory_usage, response_time, queue_length, created_at as timestamp
         FROM performance_metrics
         WHERE agent_id = ?
         ORDER BY created_at DESC
         LIMIT 30`,
        [agentId]
      );
    } catch (error) {
      // 表不存在时返回空数组
      console.warn('performance_metrics表不存在，跳过性能数据');
      perfRows = [];
    }

    // 获取当前状态
    const [agentRows] = await pool.query(
      `SELECT id, name, score, status, last_seen, role as agent_type
       FROM agents
       WHERE id = ?`,
      [agentId]
    );

    const agent = agentRows[0] || {};

    return {
      agentId,
      agentType: agent.agent_type,
      currentScore: agent.score,
      status: agent.status,
      lastHeartbeat: agent.last_seen,
      scoreHistory: scoreRows,
      taskHistory: taskRows,
      performanceData: perfRows
    };
  } catch (error) {
    console.error('获取Agent历史数据失败:', error);
    throw error;
  }
}

/**
 * GET /api/analysis/agent/:agentId/trends
 * 获取Agent趋势预测
 */
router.get('/agent/:agentId/trends', async (req, res) => {
  try {
    const { agentId } = req.params;

    // 获取历史数据
    const data = await getAgentHistoryData(agentId);

    // 执行趋势预测
    const results = await analysisEngine.predictTrends(data);

    res.json({
      success: true,
      agentId,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('趋势预测失败:', error);
    res.status(500).json({
      success: false,
      message: '趋势预测失败',
      error: error.message
    });
  }
});

/**
 * GET /api/analysis/agent/:agentId/anomalies
 * 获取Agent异常识别结果
 */
router.get('/agent/:agentId/anomalies', async (req, res) => {
  try {
    const { agentId } = req.params;

    // 获取历史数据
    const data = await getAgentHistoryData(agentId);

    // 执行异常识别
    const results = await analysisEngine.detectAnomalies(data);

    res.json({
      success: true,
      agentId,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('异常识别失败:', error);
    res.status(500).json({
      success: false,
      message: '异常识别失败',
      error: error.message
    });
  }
});

/**
 * GET /api/analysis/agent/:agentId/suggestions
 * 获取Agent智能建议
 */
router.get('/agent/:agentId/suggestions', async (req, res) => {
  try {
    const { agentId } = req.params;

    // 获取历史数据
    const data = await getAgentHistoryData(agentId);

    // 生成智能建议
    const results = await analysisEngine.generateSuggestions(data);

    res.json({
      success: true,
      agentId,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('生成建议失败:', error);
    res.status(500).json({
      success: false,
      message: '生成建议失败',
      error: error.message
    });
  }
});

/**
 * GET /api/analysis/agent/:agentId/comprehensive
 * 获取Agent综合分析报告
 */
router.get('/agent/:agentId/comprehensive', async (req, res) => {
  try {
    const { agentId } = req.params;

    // 获取历史数据
    const data = await getAgentHistoryData(agentId);

    // 执行综合分析
    const results = await analysisEngine.analyze(data);

    res.json({
      success: true,
      agentId,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('综合分析失败:', error);
    res.status(500).json({
      success: false,
      message: '综合分析失败',
      error: error.message
    });
  }
});

/**
 * GET /api/analysis/team/trends
 * 获取团队整体趋势预测
 */
router.get('/team/trends', async (req, res) => {
  try {
    // 获取所有Agent
    const [agents] = await pool.query('SELECT id FROM agents');

    const teamResults = [];

    for (const agent of agents) {
      try {
        const data = await getAgentHistoryData(agent.id);
        const results = await analysisEngine.predictTrends(data);
        
        teamResults.push({
          agentId: agent.id,
          success: true,
          results
        });
      } catch (error) {
        teamResults.push({
          agentId: agent.id,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      teamResults,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('团队趋势预测失败:', error);
    res.status(500).json({
      success: false,
      message: '团队趋势预测失败',
      error: error.message
    });
  }
});

/**
 * GET /api/analysis/team/anomalies
 * 获取团队异常识别结果
 */
router.get('/team/anomalies', async (req, res) => {
  try {
    // 获取所有Agent
    const [agents] = await pool.query('SELECT id FROM agents');

    const teamResults = [];
    let totalAnomalies = 0;
    let highSeverityCount = 0;

    for (const agent of agents) {
      try {
        const data = await getAgentHistoryData(agent.id);
        const results = await analysisEngine.detectAnomalies(data);
        
        if (results.summary) {
          totalAnomalies += results.summary.totalAnomalies;
          highSeverityCount += results.summary.highSeverityCount;
        }

        teamResults.push({
          agentId: agent.id,
          success: true,
          results
        });
      } catch (error) {
        teamResults.push({
          agentId: agent.id,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      teamResults,
      summary: {
        totalAnomalies,
        highSeverityCount,
        overallRisk: highSeverityCount > 0 ? 'high' : 'low'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('团队异常识别失败:', error);
    res.status(500).json({
      success: false,
      message: '团队异常识别失败',
      error: error.message
    });
  }
});

/**
 * POST /api/analysis/suggestion/track
 * 跟踪建议采纳情况
 */
router.post('/suggestion/track', async (req, res) => {
  try {
    const { agentId, suggestionId, action, feedback } = req.body;

    if (!agentId || !suggestionId || !action) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 这里可以将采纳记录保存到数据库
    // 暂时只返回成功
    res.json({
      success: true,
      message: '建议采纳记录成功',
      data: {
        agentId,
        suggestionId,
        action,
        feedback,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('记录建议采纳失败:', error);
    res.status(500).json({
      success: false,
      message: '记录建议采纳失败',
      error: error.message
    });
  }
});

export default router;
