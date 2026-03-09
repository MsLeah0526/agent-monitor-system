import express from 'express';
const router = express.Router();
import pool from '../database.mjs';

// 创建Agent调用记录
router.post('/', async (req, res) => {
  const { caller_id, callee_id, invocation_type, status, request, response } = req.body;

  try {
    // 检查调用方和被调用方Agent是否存在
    const [callers] = await pool.execute('SELECT id FROM agents WHERE id = ?', [caller_id]);
    const [callees] = await pool.execute('SELECT id FROM agents WHERE id = ?', [callee_id]);

    if (callers.length === 0) {
      return res.status(404).json({ success: false, message: '调用方Agent不存在' });
    }

    if (callees.length === 0) {
      return res.status(404).json({ success: false, message: '被调用方Agent不存在' });
    }

    const [result] = await pool.execute(
      'INSERT INTO agent_invocations (caller_id, callee_id, invocation_type, status, request, response, duration) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [caller_id, callee_id, invocation_type, status || 'pending', request, response, 0]
    );

    res.json({ success: true, message: '调用记录创建成功', invocationId: result.insertId });
  } catch (error) {
    console.error('创建调用记录失败:', error);
    res.status(500).json({ success: false, message: '创建调用记录失败' });
  }
});

// 获取Agent调用记录
router.get('/', async (req, res) => {
  const { caller_id, callee_id, status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT ai.*, caller.name as caller_name, callee.name as callee_name FROM agent_invocations ai LEFT JOIN agents caller ON ai.caller_id = caller.id LEFT JOIN agents callee ON ai.callee_id = callee.id';
  const params = [];

  if (caller_id) {
    query += ' WHERE ai.caller_id = ?';
    params.push(caller_id);
  }

  if (callee_id) {
    if (params.length > 0) {
      query += ' AND';
    } else {
      query += ' WHERE';
    }
    query += ' ai.callee_id = ?';
    params.push(callee_id);
  }

  if (status) {
    if (params.length > 0) {
      query += ' AND';
    } else {
      query += ' WHERE';
    }
    query += ' ai.status = ?';
    params.push(status);
  }

  query += ' ORDER BY ai.timestamp DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  try {
    const [rows] = await pool.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取调用记录失败:', error);
    res.status(500).json({ success: false, message: '获取调用记录失败' });
  }
});

// 更新调用记录状态
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, response, duration } = req.body;

  try {
    const [result] = await pool.execute(
      'UPDATE agent_invocations SET status = ?, response = ?, duration = ?, timestamp = NOW() WHERE id = ?',
      [status, response, duration, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '调用记录不存在' });
    }

    res.json({ success: true, message: '调用记录更新成功' });
  } catch (error) {
    console.error('更新调用记录失败:', error);
    res.status(500).json({ success: false, message: '更新调用记录失败' });
  }
});

// 获取调用统计
router.get('/statistics', async (req, res) => {
  try {
    // 获取调用总数统计
    const [totalInvocations] = await pool.execute(
      'SELECT COUNT(*) as total, status FROM agent_invocations GROUP BY status'
    );

    // 获取调用TOP排名
    const [topCallers] = await pool.execute(
      'SELECT caller_id, COUNT(*) as count, caller.name FROM agent_invocations ai LEFT JOIN agents caller ON ai.caller_id = caller.id GROUP BY caller_id ORDER BY count DESC LIMIT 10'
    );

    // 获取调用趋势
    const [trend] = await pool.execute(
      'SELECT DATE_FORMAT(timestamp, "%Y-%m-%d %H:00:00") as hour, COUNT(*) as count FROM agent_invocations WHERE timestamp > NOW() - INTERVAL 24 HOUR GROUP BY hour ORDER BY hour'
    );

    res.json({ success: true, data: {
      totalInvocations,
      topCallers,
      trend
    }});
  } catch (error) {
    console.error('获取调用统计失败:', error);
    res.status(500).json({ success: false, message: '获取调用统计失败' });
  }
});

export default router;