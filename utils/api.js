// 真实API请求配置
const API_BASE_URL = 'http://localhost:3001/api';

// 模拟网络延迟（开发时使用，生产环境可移除）
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 从后端API获取所有Agent状态
 */
export const fetchAgentStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/detail`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || '获取Agent状态失败');
    }
    
    // 转换数据格式以匹配前端组件需求
    return result.data.map(agent => ({
      id: agent.id,
      name: agent.name,
      nickname: agent.name, // 使用name作为nickname
      role: agent.role,
      description: agent.description || '',
      status: agent.status,
      score: agent.score || 0,
      cpuUsage: parseFloat(agent.cpu_usage) || 0,
      memoryUsage: parseFloat(agent.memory_usage) || 0,
      successRate: parseFloat(agent.success_rate) || 100,
      requestsPerMinute: agent.requests_per_minute || 0,
      uptime: '运行中', // 可以根据last_seen计算
      lastUpdate: '刚刚',
      subagent_count: agent.subagent_count || 0,
      is_communicating: agent.current_task !== '等待任务',
      work_tasks: agent.work_tasks || [],
      future_tasks: agent.future_tasks || []
    }));
  } catch (error) {
    console.error('获取Agent状态失败:', error);
    
    // 如果API调用失败，返回模拟数据作为降级方案
    console.warn('⚠️ 使用模拟数据作为降级方案');
    return getMockAgents();
  }
};

/**
 * 获取单个Agent详细信息
 */
export const fetchAgentDetail = async (agentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/${agentId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || '获取Agent详情失败');
    }
    
    const { agent, status, recentTasks, recentInvocations } = result.data;
    
    return {
      id: agent.id,
      name: agent.name,
      nickname: agent.name,
      role: agent.role,
      description: agent.description || '',
      status: agent.status,
      score: agent.score || 0,
      cpuUsage: status?.cpu_usage || 0,
      memoryUsage: status?.memory_usage || 0,
      successRate: status?.success_rate || 100,
      requestsPerMinute: status?.requests_per_minute || 0,
      uptime: '运行中',
      lastUpdate: '刚刚',
      subagent_count: status?.subagent_count || 0,
      is_communicating: status?.current_task !== '等待任务',
      work_tasks: recentTasks?.map(task => ({
        id: task.id,
        name: task.task_name,
        progress: task.status === 'completed' ? 100 : 50,
        status: task.status === 'running' ? '进行中' : 
                task.status === 'completed' ? '已完成' : 
                task.status === 'failed' ? '失败' : '等待中',
        description: task.task_type || ''
      })) || [],
      future_tasks: [
        '等待新任务分配',
        '持续优化系统性能'
      ],
      recentInvocations: recentInvocations || []
    };
  } catch (error) {
    console.error('获取Agent详情失败:', error);
    throw error;
  }
};

/**
 * 切换Agent状态
 */
export const toggleAgentStatus = async (agentId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/${agentId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cpu_usage: status === 'online' ? 30 : 0,
        memory_usage: status === 'online' ? 40 : 0,
        requests_per_minute: status === 'online' ? 50 : 0,
        success_rate: 95,
        current_task: status === 'online' ? '工作中' : '等待任务',
        subagent_count: 0
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || '更新Agent状态失败');
    }
    
    return result;
  } catch (error) {
    console.error('更新Agent状态失败:', error);
    throw error;
  }
};

/**
 * 模拟数据（降级方案）
 */
function getMockAgents() {
  return [
    {
      id: 'dev-agent',
      name: '贾维斯',
      nickname: '贾维斯',
      role: '全栈开发工程师',
      description: '全栈开发工程师，负责代码开发、架构设计、代码质量、跨团队协作',
      status: 'online',
      score: 100,
      cpuUsage: 35,
      memoryUsage: 45,
      successRate: 95,
      requestsPerMinute: 80,
      uptime: '运行中',
      lastUpdate: '刚刚',
      subagent_count: 2,
      is_communicating: true,
      work_tasks: [
        { id: 'task-1', name: '开发Agent监测系统', progress: 85, status: '进行中', description: '实现高科技UI设计' }
      ],
      future_tasks: ['等待新任务分配', '持续优化系统性能']
    },
    {
      id: 'data-agent',
      name: 'Fiz',
      nickname: 'Fiz',
      role: '数据工程师',
      description: '数据工程师，负责数据采集、数据处理、数据管道、跨团队协作',
      status: 'online',
      score: 100,
      cpuUsage: 25,
      memoryUsage: 35,
      successRate: 98,
      requestsPerMinute: 60,
      uptime: '运行中',
      lastUpdate: '刚刚',
      subagent_count: 1,
      is_communicating: false,
      work_tasks: [
        { id: 'task-2', name: '数据分析任务', progress: 60, status: '进行中', description: '处理监控数据' }
      ],
      future_tasks: ['等待新任务分配', '持续优化系统性能']
    },
    {
      id: 'test-agent',
      name: 'Jojo',
      nickname: 'Jojo',
      role: '质量保障专家',
      description: '质量保障专家，负责测试设计、测试执行、质量报告、跨团队协作',
      status: 'online',
      score: 138,
      cpuUsage: 30,
      memoryUsage: 40,
      successRate: 97,
      requestsPerMinute: 70,
      uptime: '运行中',
      lastUpdate: '刚刚',
      subagent_count: 0,
      is_communicating: true,
      work_tasks: [
        { id: 'task-3', name: '测试任务', progress: 75, status: '进行中', description: '执行系统测试' }
      ],
      future_tasks: ['等待新任务分配', '持续优化系统性能']
    },
    {
      id: 'ops-agent',
      name: '欧派',
      nickname: '欧派',
      role: 'DevOps专家',
      description: 'DevOps专家，负责部署管理、监控告警、资源管理、跨团队协作',
      status: 'online',
      score: 100,
      cpuUsage: 20,
      memoryUsage: 30,
      successRate: 99,
      requestsPerMinute: 90,
      uptime: '运行中',
      lastUpdate: '刚刚',
      subagent_count: 3,
      is_communicating: true,
      work_tasks: [
        { id: 'task-4', name: '系统监控', progress: 90, status: '进行中', description: '监控系统运行状态' }
      ],
      future_tasks: ['等待新任务分配', '持续优化系统性能']
    },
    {
      id: 'pm-agent',
      name: '小红',
      nickname: '小红',
      role: '产品经理',
      description: '资深产品专家，负责需求管理、产品规划、文档管理、跨团队协作',
      status: 'online',
      score: 100,
      cpuUsage: 15,
      memoryUsage: 25,
      successRate: 96,
      requestsPerMinute: 40,
      uptime: '运行中',
      lastUpdate: '刚刚',
      subagent_count: 1,
      is_communicating: false,
      work_tasks: [
        { id: 'task-5', name: '需求管理', progress: 80, status: '进行中', description: '管理产品需求' }
      ],
      future_tasks: ['等待新任务分配', '持续优化系统性能']
    },
    {
      id: 'mrleader',
      name: '小李子',
      nickname: '小李子',
      role: '团队负责人',
      description: '团队负责人，整体协调和决策，负责团队管理和跨部门协作',
      status: 'online',
      score: 100,
      cpuUsage: 20,
      memoryUsage: 30,
      successRate: 97,
      requestsPerMinute: 50,
      uptime: '运行中',
      lastUpdate: '刚刚',
      subagent_count: 0,
      is_communicating: true,
      work_tasks: [
        { id: 'task-6', name: '团队管理', progress: 95, status: '进行中', description: '协调团队工作' }
      ],
      future_tasks: ['等待新任务分配', '持续优化系统性能']
    },
    {
      id: 'monitor-agent',
      name: '蔡文姬',
      nickname: '蔡文姬',
      role: '监控评估专家',
      description: '监控和评估专家，负责积分管理、质量监督、性能监控、学习协调',
      status: 'online',
      score: 100,
      cpuUsage: 25,
      memoryUsage: 35,
      successRate: 98,
      requestsPerMinute: 55,
      uptime: '运行中',
      lastUpdate: '刚刚',
      subagent_count: 0,
      is_communicating: true,
      work_tasks: [
        { id: 'task-7', name: '积分管理', progress: 70, status: '进行中', description: '管理团队积分' }
      ],
      future_tasks: ['等待新任务分配', '持续优化系统性能']
    }
  ];
}
