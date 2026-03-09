import express from 'express';
const router = express.Router();
import pool from '../database.mjs';

// 获取Agent详细信息（包含任务列表）
router.get('/detail', async (req, res) => {
  try {
    // 获取所有Agent基本信息
    const [agents] = await pool.execute('SELECT * FROM agents ORDER BY id');
    
    // 获取所有Agent的最新状态
    const [statuses] = await pool.execute(`
      SELECT a.id as agent_id, s.* 
      FROM agents a
      LEFT JOIN agent_status s ON a.id = s.agent_id AND s.id = (
        SELECT MAX(id) FROM agent_status WHERE agent_id = a.id
      )
    `);
    
    // 获取所有Agent的任务
    const [tasks] = await pool.execute('SELECT * FROM agent_tasks ORDER BY agent_id, start_time DESC');
    
    // 组合数据
    const result = agents.map(agent => {
      const status = statuses.find(s => s.agent_id === agent.id);
      const agentTasks = tasks.filter(t => t.agent_id === agent.id);
      
      return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        emoji: agent.emoji,
        description: agent.description,
        status: agent.status,
        score: agent.score,
        priority: agent.priority,
        last_seen: agent.last_seen,
        cpu_usage: status?.cpu_usage || 0,
        memory_usage: status?.memory_usage || 0,
        requests_per_minute: status?.requests_per_minute || 0,
        success_rate: status?.success_rate || 100,
        current_task: status?.current_taskKey || '等待任务',
        subagent_count: status?.subagent_count || 0,
        work_tasks: agentTasks.map(task => ({
          id: task.id,
          name: task.task_name,
          progress: task.status === 'completed' ? 100 : 
                   task.status === 'running' ? 50 : 0,
          status: task.status === 'running' ? '进行中' : 
                  task.status === 'completed' ? '已完成' : 
                  task.status === 'failed' ? '失败' : '等待中',
          description: task.task_type || ''
        })),
        future_tasks: [
          '等待新任务分配',
          '持续优化系统性能'
        ]
      };
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('获取Agent详细信息失败:', error);
    res.status(500).json({ success: false, message: '获取Agent详细信息失败' });
  }
});

export default router;
