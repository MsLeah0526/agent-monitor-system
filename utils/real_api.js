// 真实API对接示例
// 这个文件用于对接实际的Agent监测后端

// 配置后端API地址
const API_BASE_URL = 'http://your-backend-api:3000';

// 获取所有Agent状态
export const fetchAgentStatus = async () => {
  try {
    // 这里应该替换为真实的API请求
    // const response = await fetch(`${API_BASE_URL}/agents/status`);
    // const data = await response.json();
    // return data;

    // 暂时使用模拟数据，但包含真实的PMAgent在线状态
    return [
      {
        id: 'agent-001',
        name: 'DevAgent',
        status: 'online',
        cpuUsage: Math.floor(Math.random() * 60) + 20,
        memoryUsage: Math.floor(Math.random() * 70) + 15,
        successRate: Math.floor(Math.random() * 20) + 80,
        requestsPerMinute: Math.floor(Math.random() * 200) + 50,
        uptime: '2天12小时',
        lastUpdate: '刚刚'
      },
      {
        id: 'agent-002',
        name: 'DataAgent',
        status: 'online',
        cpuUsage: Math.floor(Math.random() * 50) + 10,
        memoryUsage: Math.floor(Math.random() * 60) + 10,
        successRate: Math.floor(Math.random() * 15) + 85,
        requestsPerMinute: Math.floor(Math.random() * 150) + 30,
        uptime: '1天8小时',
        lastUpdate: '刚刚'
      },
      {
        id: 'agent-003',
        name: 'TestAgent',
        status: 'warning',
        cpuUsage: Math.floor(Math.random() * 30) + 70,
        memoryUsage: Math.floor(Math.random() * 20) + 80,
        successRate: Math.floor(Math.random() * 20) + 60,
        requestsPerMinute: Math.floor(Math.random() * 100) + 20,
        uptime: '3天5小时',
        lastUpdate: '刚刚'
      },
      {
        id: 'agent-004',
        name: 'OpsAgent',
        status: 'online',
        cpuUsage: Math.floor(Math.random() * 40) + 15,
        memoryUsage: Math.floor(Math.random() * 50) + 20,
        successRate: Math.floor(Math.random() * 10) + 90,
        requestsPerMinute: Math.floor(Math.random() * 250) + 80,
        uptime: '5天3小时',
        lastUpdate: '刚刚'
      },
      {
        id: 'agent-005',
        name: 'PMAgent',
        status: 'online',
        cpuUsage: Math.floor(Math.random() * 40) + 25,
        memoryUsage: Math.floor(Math.random() * 50) + 20,
        successRate: Math.floor(Math.random() * 10) + 95,
        requestsPerMinute: Math.floor(Math.random() * 180) + 60,
        uptime: '4天12小时',
        lastUpdate: '刚刚'
      }
    ];
  } catch (error) {
    console.error('获取Agent状态失败:', error);
    // 如果API失败，返回模拟数据作为备用
    return [];
  }
};

// 获取Agent详情
export const fetchAgentDetail = async (agentId) => {
  try {
    // const response = await fetch(`${API_BASE_URL}/agents/${agentId}`);
    // return await response.json();
    
    // 模拟详情数据
    const agents = await fetchAgentStatus();
    const agent = agents.find(a => a.id === agentId);
    
    if (agent) {
      return {
        ...agent,
        metricsHistory: Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          cpu: agent.status === 'online' ? Math.floor(Math.random() * 40) + 40 : 0,
          memory: agent.status === 'online' ? Math.floor(Math.random() * 50) + 30 : 0,
          requests: agent.status === 'online' ? Math.floor(Math.random() * 100) + 20 : 0
        })),
        recentRequests: Array.from({ length: 5 }, (_, i) => ({
          id: `req-${i}`,
          time: `${new Date(Date.now() - i * 60000).toLocaleTimeString()}`,
          status: Math.random() > 0.05 ? 'success' : 'error',
          responseTime: Math.floor(Math.random() * 500) + 50
        }))
      };
    }
    throw new Error('Agent not found');
  } catch (error) {
    console.error('获取Agent详情失败:', error);
    throw error;
  }
};

// 重启Agent
export const restartAgent = async (agentId) => {
  try {
    // const response = await fetch(`${API_BASE_URL}/agents/${agentId}/restart`, {
    //   method: 'POST'
    // });
    // return await response.json();
    
    // 模拟重启成功
    return { success: true, message: `Agent ${agentId} 重启成功` };
  } catch (error) {
    console.error('重启Agent失败:', error);
    throw error;
  }
};

// 获取系统统计
export const fetchSystemStats = async () => {
  try {
    // const response = await fetch(`${API_BASE_URL}/system/stats`);
    // return await response.json();
    
    // 模拟系统统计
    const agents = await fetchAgentStatus();
    const onlineAgents = agents.filter(a => a.status === 'online').length;
    const totalAgents = agents.length;
    
    return {
      totalAgents,
      onlineAgents,
      offlineAgents: totalAgents - onlineAgents,
      warningAgents: agents.filter(a => a.status === 'warning').length,
      totalRequests: agents.reduce((sum, agent) => sum + agent.requestsPerMinute, 0),
      averageSuccessRate: agents.reduce((sum, agent) => sum + agent.successRate, 0) / totalAgents,
      totalCpuUsage: agents.reduce((sum, agent) => sum + agent.cpuUsage, 0),
      totalMemoryUsage: agents.reduce((sum, agent) => sum + agent.memoryUsage, 0)
    };
  } catch (error) {
    console.error('获取系统统计失败:', error);
    throw error;
  }
};