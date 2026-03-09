import express from 'express';
const router = express.Router();
import pool from '../database.mjs';

// 创建Agent沟通记录
router.post('/', async (req, res) => {
  const { from_agent_id, to_agent_id, communication_type, content, status } = req.body;

  try {
    // 检查发送方和接收方Agent是否存在
    const [fromAgents] = await pool.execute('SELECT id FROM agents WHERE id = ?', [from_agent_id]);
    const [toAgents] = await pool.execute('SELECT id FROM agents WHERE id = ?', [to_agent_id]);

    if (fromAgents.length === 0) {
      return res.status(404).json({ success: false, message: '发送方Agent不存在' });
    }

    if (toAgents.length === 0) {
      return res.status(404).json({ success: false, message: '接收方Agent不存在' });
    }

    const [result] = await pool.execute(
      'INSERT INTO agent_communications (from_agent_id, to_agent_id, communication_type, content, status) VALUES (?, ?, ?, ?, ?)',
      [from_agent_id, to_agent_id, communication_type, content, status || 'sent']
    );

    res.json({ success: true, message: '沟通记录创建成功', communicationId: result.insertId });
  } catch (error) {
    console.error('创建沟通记录失败:', error);
    res.status(500).json({ success: false, message: '创建沟通记录失败' });
  }
});

// 获取Agent沟通记录
router.get('/', async (req, res) => {
  const { from_agent_id, to_agent_id, status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT ac.*, from_agent.name as from_name, to_agent.name as to_name FROM agent_communications ac LEFT JOIN agents from_agent ON ac.from_agent_id = from_agent.id LEFT JOIN agents to_agent ON ac.to_agent_id = to_agent.id';
  const params = [];

  if (from_agent_id) {
    query += ' WHERE ac.from_agent_id = ?';
    params.push(from_agent_id);
  }

  if (to_agent_id) {
    if (params.length > 0) {
      query += ' AND';
    } else {
      query += ' WHERE';
    }
    query += ' ac.to_agent_id = ?';
    params.push(to_agent_id);
  }

  if (status) {
    if (params.length > 0) {
      query += ' AND';
    } else {
      query += ' WHERE';
    }
    query += ' ac.status = ?';
    params.push(status);
  }

  query += ' ORDER BY ac.timestamp DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  try {
    const [rows] = await pool.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取沟通记录失败:', error);
    res.status(500).json({ success: false, message: '获取沟通记录失败' });
  }
});

// 更新沟通记录状态
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const [result] = await pool.execute(
      'UPDATE agent_communications SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '沟通记录不存在' });
    }

    res.json({ success: true, message: '沟通记录状态更新成功' });
  } catch (error) {
    console.error('更新沟通记录失败:', error);
    res.status(500).json({ success: false, message: '更新沟通记录失败' });
  }
});

// 获取沟通统计
router.get('/statistics', async (req, res) => {
  try {
    // 获取沟通总数统计
    const [totalCommunications] = await pool.execute(
      'SELECT COUNT(*) as total, status FROM agent_communications GROUP BY status'
    );

    // 获取最活跃的Agent
    const [activeAgents] = await pool.execute(
      'SELECT from_agent_id, COUNT(*) as count, agent.name FROM agent_communications ac LEFT JOIN agents agent ON ac.from_agent_id = agent.id GROUP BY from_agent_id ORDER BY count DESC LIMIT 10'
    );

    // 获取沟通热度趋势
    const [trend] = await pool.execute(
      'SELECT DATE_FORMAT(timestamp, "%Y-%m-%d %H:00:00") as hour, COUNT(*) as count FROM agent_communications WHERE timestamp > NOW() - INTERVAL 24 HOUR GROUP BY hour ORDER BY hour'
    );

    res.json({ success: true, data: {
      totalCommunications,
      activeAgents,
      trend
    }});
  } catch (error) {
    console.error('获取沟通统计失败:', error);
    res.status(500).json({ success: false, message: '获取沟通统计失败' });
  }
});

export default router;