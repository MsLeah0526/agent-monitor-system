import express from 'express';
import pool from '../database.mjs';

const router = express.Router();

/**
 * GET /api/team/overview
 * 获取团队概览数据
 */
router.get('/overview', async (req, res) => {
  try {
    // 获取总Agent数
    const [totalAgents] = await pool.query(
      'SELECT COUNT(*) as count FROM agents'
    );

    // 获取在线Agent数
    const [onlineAgents] = await pool.query(
      "SELECT COUNT(*) as count FROM agents WHERE status = 'online'"
    );

    // 获取总积分
    const [totalScore] = await pool.query(
      'SELECT SUM(score) as total FROM agents'
    );

    // 获取任务完成率
    const [completedTasks] = await pool.query(
      "SELECT COUNT(*) as count FROM agent_tasks WHERE status = 'completed'"
    );
    const [totalTasks] = await pool.query(
      'SELECT COUNT(*) as count FROM agent_tasks'
    );
    const completionRate = totalTasks[0].count > 0
      ? (completedTasks[0].count / totalTasks[0].count * 100).toFixed(2)
      : 0;

    // 获取今日活跃Agent数
    const [todayActive] = await pool.query(
      `SELECT COUNT(DISTINCT caller_id) as count 
       FROM agent_invocations 
       WHERE DATE(timestamp) = CURDATE()`
    );

    // 获取平均响应时间
    const [avgResponse] = await pool.query(
      `SELECT AVG(duration) as avg 
       FROM agent_invocations 
       WHERE duration IS NOT NULL`
    );

    res.json({
      success: true,
      data: {
        totalAgents: totalAgents[0].count,
        onlineAgents: onlineAgents[0].count,
        totalScore: totalScore[0].total || 0,
        completionRate: parseFloat(completionRate),
        todayActive: todayActive[0].count,
        averageResponseTime: avgResponse[0].avg ? parseFloat(avgResponse[0].avg.toFixed(2)) : 0,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('获取团队概览失败:', error);
    res.status(500).json({
      success: false,
      message: '获取团队概览失败',
      error: error.message
    });
  }
});

export default router;
