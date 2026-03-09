import express from 'express';
const router = express.Router();
import pool from '../database.mjs';

// 创建新任务
router.post('/', async (req, res) => {
  const { agent_id, task_id, task_name, task_type, status, parent_task_id } = req.body;

  try {
    // 检查Agent是否存在
    const [agents] = await pool.execute('SELECT id FROM agents WHERE id = ?', [agent_id]);
    if (agents.length === 0) {
      return res.status(404).json({ success: false, message: 'Agent不存在' });
    }

    const [result] = await pool.execute(
      'INSERT INTO agent_tasks (agent_id, task_id, task_name, task_type, status, parent_task_id) VALUES (?, ?, ?, ?, ?, ?)',
      [agent_id, task_id, task_name, task_type, status || 'pending', parent_task_id]
    );

    res.json({ success: true, message: '任务创建成功', taskId: result.insertId });
  } catch (error) {
    console.error('创建任务失败:', error);
    res.status(500).json({ success: false, message: '创建任务失败' });
  }
});

// 更新任务状态
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, end_time, result, error_message } = req.body;

  try {
    const [resultData] = await pool.execute(
      'UPDATE agent_tasks SET status = ?, end_time = ?, result = ?, error_message = ?, duration = TIMESTAMPDIFF(SECOND, start_time, NOW()) WHERE id = ?',
      [status, end_time, result, error_message, id]
    );

    if (resultData.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '任务不存在' });
    }

    res.json({ success: true, message: '任务状态更新成功' });
  } catch (error) {
    console.error('更新任务状态失败:', error);
    res.status(500).json({ success: false, message: '更新任务状态失败' });
  }
});

// 获取所有任务
router.get('/', async (req, res) => {
  const { page = 1, limit = 10, status, agent_id } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT at.*, a.name as agent_name FROM agent_tasks at LEFT JOIN agents a ON at.agent_id = a.id';
  const params = [];

  if (status) {
    query += ' WHERE at.status = ?';
    params.push(status);
  }

  if (agent_id) {
    if (params.length > 0) {
      query += ' AND';
    } else {
      query += ' WHERE';
    }
    query += ' at.agent_id = ?';
    params.push(agent_id);
  }

  query += ' ORDER BY at.start_time DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  try {
    const [rows] = await pool.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    res.status(500).json({ success: false, message: '获取任务列表失败' });
  }
});

// 获取任务详情
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute(
      'SELECT at.*, a.name as agent_name FROM agent_tasks at LEFT JOIN agents a ON at.agent_id = a.id WHERE at.id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '任务不存在' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('获取任务详情失败:', error);
    res.status(500).json({ success: false, message: '获取任务详情失败' });
  }
});

// 获取子任务
router.get('/:id/subtasks', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute(
      'SELECT at.*, a.name as agent_name FROM agent_tasks at LEFT JOIN agents a ON at.agent_id = a.id WHERE at.parent_task_id = ? ORDER BY at.start_time DESC',
      [id]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取子任务失败:', error);
    res.status(500).json({ success: false, message: '获取子任务失败' });
  }
});

export default router;