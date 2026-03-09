import pool from '../database.mjs';

// Agent初始数据
const agentsData = [
  {
    id: 'mrleader',
    name: '小李子',
    role: '团队负责人',
    emoji: '🤵‍♂️',
    workspace: '/root/.openclaw/workspace-mrleader',
    description: '团队负责人，整体协调和决策，负责团队管理和跨部门协作',
    status: 'online',
    score: 100,
    priority: 'Normal'
  },
  {
    id: 'pm-agent',
    name: '小红',
    role: '产品经理',
    emoji: '📋',
    workspace: '/root/.openclaw/pm-agent',
    description: '资深产品专家，负责需求管理、产品规划、文档管理、跨团队协作',
    status: 'online',
    score: 100,
    priority: 'Normal'
  },
  {
    id: 'dev-agent',
    name: '贾维斯',
    role: '全栈开发工程师',
    emoji: '💻',
    workspace: '/root/.openclaw/dev-agent',
    description: '全栈开发工程师，负责代码开发、架构设计、代码质量、跨团队协作',
    status: 'online',
    score: 100,
    priority: 'Normal'
  },
  {
    id: 'data-agent',
    name: 'Fiz',
    role: '数据工程师',
    emoji: '📊',
    workspace: '/root/.openclaw/data-agent',
    description: '数据工程师，负责数据采集、数据处理、数据管道、跨团队协作',
    status: 'online',
    score: 100,
    priority: 'Normal'
  },
  {
    id: 'test-agent',
    name: 'Jojo',
    role: '质量保障专家',
    emoji: '🧪',
    workspace: '/root/.openclaw/test-agent',
    description: '质量保障专家，负责测试设计、测试执行、质量报告、跨团队协作',
    status: 'online',
    score: 138,
    priority: 'Normal'
  },
  {
    id: 'ops-agent',
    name: '欧派',
    role: 'DevOps专家',
    emoji: '🔧',
    workspace: '/root/.openclaw/ops-agent',
    description: 'DevOps专家，负责部署管理、监控告警、资源管理、跨团队协作',
    status: 'online',
    score: 100,
    priority: 'Normal'
  },
  {
    id: 'monitor-agent',
    name: '蔡文姬',
    role: '监控评估专家',
    emoji: '📊',
    workspace: '/root/.openclaw/monitor-agent',
    description: '监控和评估专家，负责积分管理、质量监督、性能监控、学习协调',
    status: 'online',
    score: 100,
    priority: 'Normal'
  }
];

async function seedAgents() {
  try {
    console.log('🌱 开始插入Agent数据...');

    for (const agent of agentsData) {
      // 检查Agent是否已存在
      const [existing] = await pool.execute(
        'SELECT id FROM agents WHERE id = ?',
        [agent.id]
      );

      if (existing.length > 0) {
        console.log(`⏭️  Agent ${agent.id} 已存在，跳过`);
        continue;
      }

      // 插入Agent
      await pool.execute(
        `INSERT INTO agents (id, name, role, emoji, workspace, description, status, score, priority)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [agent.id, agent.name, agent.role, agent.emoji, agent.workspace,
         agent.description, agent.status, agent.score, agent.priority]
      );

      console.log(`✅ 插入Agent: ${agent.name} (${agent.id})`);

      // 插入初始状态
      await pool.execute(
        `INSERT INTO agent_status (agent_id, cpu_usage, memory_usage, requests_per_minute, success_rate, current_task, subagent_count)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [agent.id, Math.random() * 30 + 10, Math.random() * 40 + 30, Math.floor(Math.random() * 50 + 10),
         Math.random() * 5 + 95, '等待任务', 0]
      );
    }

    console.log('🎉 Agent数据插入完成！');
    console.log(`📊 总共插入: ${agentsData.length} 个Agent`);

    // 验证插入结果
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM agents');
    console.log(`✅ 数据库中Agent总数: ${rows[0].count}`);

  } catch (error) {
    console.error('❌ 插入Agent数据失败:', error);
    throw error;
  }
}

// 运行种子数据脚本
seedAgents().catch(console.error);
