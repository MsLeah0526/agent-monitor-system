import express from 'express';
const router = express.Router();
import pool from '../database.mjs';

// 获取所有Agent信息
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM agents ORDER BY status, name');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取Agent信息失败:', error);
    res.status(500).json({ success: false, message: '获取Agent信息失败' });
  }
});

// 获取Agent综合信息
router.get('/overview', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM agent_overview');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取Agent综合信息失败:', error);
    res.status(500).json({ success: false, message: '获取Agent综合信息失败' });
  }
});

// 获取单个Agent详细信息
router.get('/:agentId', async (req, res) => {
  const { agentId } = req.params;
  try {
    const [agents] = await pool.execute('SELECT * FROM agents WHERE id = ?', [agentId]);
    if (agents.length === 0) {
      return res.status(404).json({ success: false, message: 'Agent不存在' });
    }

    const [status] = await pool.execute('SELECT * FROM agent_status WHERE agent_id = ? ORDER BY timestamp DESC LIMIT 1', [agentId]);
    const [tasks] = await pool.execute('SELECT * FROM agent_tasks WHERE agent_id = ? ORDER BY start_time DESC LIMIT 10', [agentId]);
    const [invocations] = await pool.execute('SELECT * FROM agent_invocations WHERE caller_id = ? OR callee_id = ? ORDER BY timestamp DESC LIMIT 10', [agentId, agentId]);

    res.json({
      success: true,
      data: {
        agent: agents[0],
        status: status[0],
        recentTasks: tasks,
        recentInvocations: invocations
      }
    });
  } catch (error) {
    console.error('获取Agent详细信息失败:', error);
    res.status(500).json({ success: false, message: '获取Agent详细信息失败' });
  }
});

// 获取Agent实时状态
router.get('/:agentId/status', async (req, res) => {
  const { agentId } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM agent_status WHERE agent_id = ? ORDER BY timestamp DESC LIMIT 1', [agentId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Agent状态不存在' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('获取Agent状态失败:', error);
    res.status(500).json({ success: false, message: '获取Agent状态失败' });
  }
});

// 更新Agent状态
router.post('/:agentId/status', async (req, res) => {
  const { agentId } = req.params;
  const { cpu_usage, memory_usage, requests_per_minute, success_rate, current_task, subagent_count } = req.body;

  try {
    // 检查Agent是否存在
    const [agents] = await pool.execute('SELECT id FROM agents WHERE id = ?', [agentId]);
    if (agents.length === 0) {
      return res.status(404).json({ success: false, message: 'Agent不存在' });
    }

    // 插入新状态记录
    const [result] = await pool.execute(
      'INSERT INTO agent_status (agent_id, cpu_usage, memory_usage, requests_per_minute, success_rate, current_task, subagent_count) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [agentId, cpu_usage, memory_usage, requests_per_minute, success_rate, current_task, subagent_count]
    );

    // 更新Agent的last_seen
    await pool.execute('UPDATE agents SET last_seen = NOW() WHERE id = ?', [agentId]);

    res.json({ success: true, message: '状态更新成功', insertId: result.insertId });
  } catch (error) {
    console.error('更新Agent状态失败:', error);
    res.status(500).json({ success: false, message: '更新Agent状态失败' });
  }
});

// 获取Agent任务记录
router.get('/:agentId/tasks', async (req, res) => {
  const { agentId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM agent_tasks WHERE agent_id = ? ORDER BY start_time DESC LIMIT ? OFFSET ?',
      [agentId, limit, offset]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取Agent任务记录失败:', error);
    res.status(500).json({ success: false, message: '获取Agent任务记录失败' });
  }
});

// 获取Agent调用记录
router.get('/:agentId/invocations', async (req, res) => {
  const { agentId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM agent_invocations WHERE caller_id = ? OR callee_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?',
      [agentId, agentId, limit, offset]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取Agent调用记录失败:', error);
    res.status(500).json({ success: false, message: '获取Agent调用记录失败' });
  }
});

export default router;