import express from 'express';
import pool from '../database.mjs';

const router = express.Router();

/**
 * GET /api/reports
 * 获取报表数据
 * Query params: timeRange (1h|24h|7d|30d), agentId, type
 */
router.get('/', async (req, res) => {
  try {
    const { timeRange = '24h', agentId, type } = req.query;

    // 计算时间范围
    let startTime;
    const now = new Date();
    
    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // 构建查询条件
    let whereClause = 'WHERE created_at >= ?';
    const params = [startTime];

    if (agentId) {
      whereClause += ' AND agent_id = ?';
      params.push(agentId);
    }

    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }

    // 获取任务统计
    const [taskStats] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as running,
        AVG(CASE WHEN duration IS NOT NULL THEN duration ELSE NULL END) as avgDuration
       FROM tasks ${whereClause}`,
      params
    );

    // 获取调用统计
    const [invocationStats] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        AVG(response_time) as avgResponseTime,
        MIN(response_time) as minResponseTime,
        MAX(response_time) as maxResponseTime
       FROM invocations 
       WHERE start_time >= ? ${agentId ? 'AND agent_id = ?' : ''}`,
      agentId ? [startTime, agentId] : [startTime]
    );

    // 获取积分变化趋势
    const [scoreTrend] = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        AVG(score) as avgScore,
        MAX(score) as maxScore,
        MIN(score) as minScore
       FROM agent_score_history
       WHERE created_at >= ? ${agentId ? 'AND agent_id = ?' : ''}
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      agentId ? [startTime, agentId] : [startTime]
    );

    // 获取告警统计
    const [alertStats] = await pool.query(
      `SELECT 
        type,
        severity,
        COUNT(*) as count
       FROM alerts
       WHERE created_at >= ? ${agentId ? 'AND agent_id = ?' : ''}
       GROUP BY type, severity`,
      agentId ? [startTime, agentId] : [startTime]
    );

    res.json({
      success: true,
      data: {
        timeRange,
        startTime: startTime.toISOString(),
        endTime: now.toISOString(),
        tasks: {
          total: taskStats[0].total || 0,
          completed: taskStats[0].completed || 0,
          failed: taskStats[0].failed || 0,
          running: taskStats[0].running || 0,
          avgDuration: taskStats[0].avgDuration ? parseFloat(taskStats[0].avgDuration.toFixed(2)) : 0,
          successRate: taskStats[0].total > 0 
            ? ((taskStats[0].completed / taskStats[0].total) * 100).toFixed(2)
            : 0
        },
        invocations: {
          total: invocationStats[0].total || 0,
          avgResponseTime: invocationStats[0].avgResponseTime 
            ? parseFloat(invocationStats[0].avgResponseTime.toFixed(2)) 
            : 0,
          minResponseTime: invocationStats[0].minResponseTime || 0,
          maxResponseTime: invocationStats[0].maxResponseTime || 0
        },
        scoreTrend: scoreTrend.map(row => ({
          date: row.date,
          avgScore: parseFloat(row.avgScore.toFixed(2)),
          maxScore: row.maxScore,
          minScore: row.minScore
        })),
        alertStats: alertStats.map(row => ({
          type: row.type,
          severity: row.severity,
          count: row.count
        }))
      }
    });
  } catch (error) {
    console.error('获取报表数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取报表数据失败',
      error: error.message
    });
  }
});

/**
 * GET /api/reports/export
 * 导出报表数据
 * Query params: format (csv|json), timeRange, agentId, type
 */
router.get('/export', async (req, res) => {
  try {
    const { format = 'csv', timeRange = '24h', agentId, type } = req.query;

    if (!['csv', 'json'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: '不支持的导出格式'
      });
    }

    // 获取报表数据
    const { timeRange: tr, startTime, endTime, tasks, invocations, scoreTrend, alertStats } = await getReportData(timeRange, agentId, type);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=report_${timeRange}_${Date.now()}.json`);
      return res.json({ timeRange: tr, startTime, endTime, tasks, invocations, scoreTrend, alertStats });
    }

    // CSV导出
    const csvData = convertToCSV({ timeRange: tr, startTime, endTime, tasks, invocations, scoreTrend, alertStats });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report_${timeRange}_${Date.now()}.csv`);
    res.send(csvData);

  } catch (error) {
    console.error('导出报表失败:', error);
    res.status(500).json({
      success: false,
      message: '导出报表失败',
      error: error.message
    });
  }
});

/**
 * 辅助函数：获取报表数据
 */
async function getReportData(timeRange, agentId, type) {
  let startTime;
  const now = new Date();
  
  switch (timeRange) {
    case '1h':
      startTime = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '24h':
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  let whereClause = 'WHERE created_at >= ?';
  const params = [startTime];

  if (agentId) {
    whereClause += ' AND agent_id = ?';
    params.push(agentId);
  }

  if (type) {
    whereClause += ' AND type = ?';
    params.push(type);
  }

  const [taskStats] = await pool.query(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
      SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as running,
      AVG(CASE WHEN duration IS NOT NULL THEN duration ELSE NULL END) as avgDuration
     FROM tasks ${whereClause}`,
    params
  );

  const [invocationStats] = await pool.query(
    `SELECT 
      COUNT(*) as total,
      AVG(response_time) as avgResponseTime,
      MIN(response_time) as minResponseTime,
      MAX(response_time) as maxResponseTime
     FROM invocations 
     WHERE start_time >= ? ${agentId ? 'AND agent_id = ?' : ''}`,
    agentId ? [startTime, agentId] : [startTime]
  );

  const [scoreTrend] = await pool.query(
    `SELECT 
      DATE(created_at) as date,
      AVG(score) as avgScore,
      MAX(score) as maxScore,
      MIN(score) as minScore
     FROM agent_score_history
     WHERE created_at >= ? ${agentId ? 'AND agent_id = ?' : ''}
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    agentId ? [startTime, agentId] : [startTime]
  );

  const [alertStats] = await pool.query(
    `SELECT 
      type,
      severity,
      COUNT(*) as count
     FROM alerts
     WHERE created_at >= ? ${agentId ? 'AND agent_id = ?' : ''}
     GROUP BY type, severity`,
    agentId ? [startTime, agentId] : [startTime]
  );

  return {
    timeRange,
    startTime: startTime.toISOString(),
    endTime: now.toISOString(),
    tasks: {
      total: taskStats[0].total || 0,
      completed: taskStats[0].completed || 0,
      failed: taskStats[0].failed || 0,
      running: taskStats[0].running || 0,
      avgDuration: taskStats[0].avgDuration ? parseFloat(taskStats[0].avgDuration.toFixed(2)) : 0,
      successRate: taskStats[0].total > 0 
        ? ((taskStats[0].completed / taskStats[0].total) * 100).toFixed(2)
        : 0
    },
    invocations: {
      total: invocationStats[0].total || 0,
      avgResponseTime: invocationStats[0].avgResponseTime 
        ? parseFloat(invocationStats[0].avgResponseTime.toFixed(2)) 
        : 0,
      minResponseTime: invocationStats[0].minResponseTime || 0,
      maxResponseTime: invocationStats[0].maxResponseTime || 0
    },
    scoreTrend: scoreTrend.map(row => ({
      date: row.date,
      avgScore: parseFloat(row.avgScore.toFixed(2)),
      maxScore: row.maxScore,
      minScore: row.minScore
    })),
    alertStats: alertStats.map(row => ({
      type: row.type,
      severity: row.severity,
      count: row.count
    }))
  };
}

/**
 * 辅助函数：将数据转换为CSV格式
 */
function convertToCSV(data) {
  const rows = [];
  
  // 添加标题行
  rows.push(['Report Data', '', '', '']);
  rows.push(['Time Range', data.timeRange || '', '', '']);
  rows.push(['Start Time', data.startTime || '', '', '']);
  rows.push(['End Time', data.endTime || '', '', '']);
  rows.push(['', '', '', '']);
  
  // 添加任务统计
  rows.push(['Task Statistics', '', '', '']);
  rows.push(['Total', 'Completed', 'Failed', 'Running']);
  if (data.tasks) {
    rows.push([
      data.tasks.total || 0,
      data.tasks.completed || 0,
      data.tasks.failed || 0,
      data.tasks.running || 0
    ]);
  }
  rows.push(['', '', '', '']);
  
  // 添加调用统计
  rows.push(['Invocation Statistics', '', '', '']);
  rows.push(['Total', 'Avg Response Time', 'Min Response Time', 'Max Response Time']);
  if (data.invocations) {
    rows.push([
      data.invocations.total || 0,
      data.invocations.avgResponseTime || 0,
      data.invocations.minResponseTime || 0,
      data.invocations.maxResponseTime || 0
    ]);
  }
  
  // 转换为CSV字符串
  return rows.map(row => row.join(',')).join('\n');
}

export default router;
