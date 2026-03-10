import express from 'express';
import pool from '../database.mjs';

const router = express.Router();

/**
 * GET /api/alerts
 * 获取告警列表
 * Query params: status (all|pending|acknowledged|resolved), limit, offset
 */
router.get('/', async (req, res) => {
  try {
    const { status = 'all', limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM alerts';
    const params = [];

    if (status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [alerts] = await pool.query(query, params);

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM alerts';
    const countParams = [];
    if (status !== 'all') {
      countQuery += ' WHERE status = ?';
      countParams.push(status);
    }
    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: alerts,
      pagination: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('获取告警列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取告警列表失败',
      error: error.message
    });
  }
});

/**
 * GET /api/alerts/:id
 * 获取告警详情
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [alerts] = await pool.query(
      'SELECT * FROM alerts WHERE id = ?',
      [id]
    );

    if (alerts.length === 0) {
      return res.status(404).json({
        success: false,
        message: '告警不存在'
      });
    }

    res.json({
      success: true,
      data: alerts[0]
    });
  } catch (error) {
    console.error('获取告警详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取告警详情失败',
      error: error.message
    });
  }
});

/**
 * PUT /api/alerts/:id/status
 * 更新告警状态
 * Body: { status: 'pending'|'acknowledged'|'resolved', comment?: string }
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    if (!status || !['pending', 'acknowledged', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态值'
      });
    }

    // 检查告警是否存在
    const [alerts] = await pool.query(
      'SELECT * FROM alerts WHERE id = ?',
      [id]
    );

    if (alerts.length === 0) {
      return res.status(404).json({
        success: false,
        message: '告警不存在'
      });
    }

    // 更新状态
    await pool.query(
      `UPDATE alerts 
       SET status = ?, 
           comment = COALESCE(?, comment),
           updated_at = NOW()
       WHERE id = ?`,
      [status, comment, id]
    );

    res.json({
      success: true,
      message: '告警状态更新成功',
      data: {
        id,
        status,
        comment: comment || alerts[0].comment,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('更新告警状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新告警状态失败',
      error: error.message
    });
  }
});

/**
 * POST /api/alerts
 * 创建新告警（内部使用）
 */
router.post('/', async (req, res) => {
  try {
    const { agentId, type, severity, message, metadata } = req.body;

    if (!agentId || !type || !message) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO alerts (agent_id, type, severity, message, metadata, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [agentId, type, severity || 'medium', message, JSON.stringify(metadata || {})]
    );

    res.json({
      success: true,
      message: '告警创建成功',
      data: {
        id: result.insertId,
        agentId,
        type,
        severity,
        message,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('创建告警失败:', error);
    res.status(500).json({
      success: false,
      message: '创建告警失败',
      error: error.message
    });
  }
});

export default router;
