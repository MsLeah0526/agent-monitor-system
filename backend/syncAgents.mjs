import fs from 'fs/promises';
import path from 'path';
import pool from './database.mjs';

// Agent配置
const agents = [
  { id: 'mrleader', workspace: '/root/.openclaw/workspace-mrleader' },
  { id: 'pm-agent', workspace: '/root/.openclaw/pm-agent' },
  { id: 'dev-agent', workspace: '/root/.openclaw/dev-agent' },
  { id: 'data-agent', workspace: '/root/.openclaw/data-agent' },
  { id: 'test-agent', workspace: '/root/.openclaw/test-agent' },
  { id: 'ops-agent', workspace: '/root/.openclaw/ops-agent' },
  { id: 'monitor-agent', workspace: '/root/.openclaw/monitor-agent' }
];

/**
 * 从MEMORY.md中提取积分信息
 */
async function extractScoreFromMemory(workspace) {
  try {
    const memoryPath = path.join(workspace, 'MEMORY.md');
    const content = await fs.readFile(memoryPath, 'utf-8');

    // 提取当前积分
    const scoreMatch = content.match(/当前积分[：:]\s*(\d+)/);
    if (scoreMatch) {
      return parseInt(scoreMatch[1]);
    }

    return 100; // 默认积分
  } catch (error) {
    console.error(`读取MEMORY.md失败: ${workspace}`, error);
    return 100; // 默认积分
  }
}

/**
 * 根据积分计算优先级
 */
function calculatePriority(score) {
  if (score >= 150) return 'Elite';
  if (score >= 120) return 'High';
  if (score >= 80) return 'Normal';
  if (score >= 60) return 'Low';
  if (score >= 40) return 'Warning';
  return 'Critical';
}

/**
 * 同步单个Agent的积分
 */
async function syncAgentScore(agent) {
  try {
    const score = await extractScoreFromMemory(agent.workspace);
    const priority = calculatePriority(score);

    // 更新数据库中的积分和优先级
    await pool.execute(
      'UPDATE agents SET score = ?, priority = ?, last_seen = NOW() WHERE id = ?',
      [score, priority, agent.id]
    );

    console.log(`✅ ${agent.id}: 积分=${score}, 优先级=${priority}`);
    return { success: true, agentId: agent.id, score, priority };
  } catch (error) {
    console.error(`❌ 同步${agent.id}失败:`, error);
    return { success: false, agentId: agent.id, error: error.message };
  }
}

/**
 * 同步所有Agent的积分
 */
async function syncAllAgents() {
  try {
    console.log('🔄 开始同步Agent积分...');
    console.log(`⏰ 同步时间: ${new Date().toLocaleString()}`);

    const results = [];
    for (const agent of agents) {
      const result = await syncAgentScore(agent);
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log('');
    console.log('📊 同步结果统计:');
    console.log(`✅ 成功: ${successCount}个`);
    console.log(`❌ 失败: ${failCount}个`);
    console.log(`⏰ 完成时间: ${new Date().toLocaleString()}`);

    return results;
  } catch (error) {
    console.error('❌ 同步Agent积分失败:', error);
    throw error;
  }
}

/**
 * 启动定时同步任务
 */
function startPeriodicSync(intervalMinutes = 5) {
  console.log(`⏰ 启动定时同步任务，间隔: ${intervalMinutes}分钟`);

  // 立即执行一次
  syncAllAgents();

  // 定时执行
  setInterval(() => {
    syncAllAgents();
  }, intervalMinutes * 60 * 1000);
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  if (command === 'sync') {
    // 执行一次同步
    syncAllAgents().catch(console.error);
  } else if (command === 'daemon') {
    // 启动守护进程
    const interval = parseInt(process.argv[3]) || 5;
    startPeriodicSync(interval);
  } else {
    console.log('用法:');
    console.log('  node syncAgents.mjs sync       # 执行一次同步');
    console.log('  node syncAgents.mjs daemon [5]  # 启动守护进程，默认5分钟间隔');
  }
}

export { syncAllAgents, startPeriodicSync };
