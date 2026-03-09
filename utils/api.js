// 模拟API请求，实际项目中应该替换为真实的后端接口

// 模拟Agent数据
const mockAgents = [
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
    successRate: Math.floor(Math.random() * 10) + 90,
    requestsPerMinute: Math.floor(Math.random() * 150) + 40,
    uptime: '4天12小时',
    lastUpdate: '刚刚'
  }
];

// 模拟网络延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchAgentStatus = async () => {
  // 模拟网络请求
  await delay(500);
  
  // 随机更新一些数据
  return mockAgents.map(agent => ({
    ...agent,
    cpuUsage: agent.status === 'online' ? Math.max(0, Math.min(100, agent.cpuUsage + (Math.random() - 0.5) * 10)) : agent.cpuUsage,
    memoryUsage: agent.status === 'online' ? Math.max(0, Math.min(100, agent.memoryUsage + (Math.random() - 0.5) * 8)) : agent.memoryUsage,
    requestsPerMinute: agent.status === 'online' ? Math.max(0, agent.requestsPerMinute + (Math.random() - 0.5) * 30) : agent.requestsPerMinute,
    lastUpdate: agent.status === 'online' ? '刚刚' : agent.lastUpdate
  }));
};

export const fetchAgentDetail = async (agentId) => {
  await delay(800);
  const agent = mockAgents.find(a => a.id === agentId);
  
  if (!agent) {
    throw new Error('Agent not found');
  }
  
  // 模拟更详细的数据
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
      status: Math.random() > 0.1 ? 'success' : 'error',
      responseTime: Math.floor(Math.random() * 500) + 50
    }))
  };
};

export const toggleAgentStatus = async (agentId, status) => {
  await delay(1000);
  const agent = mockAgents.find(a => a.id === agentId);
  
  if (agent) {
    agent.status = status;
    agent.cpuUsage = status === 'online' ? Math.floor(Math.random() * 60) + 20 : 0;
    agent.memoryUsage = status === 'online' ? Math.floor(Math.random() * 70) + 15 : 0;
    return agent;
  }
  
  throw new Error('Agent not found');
};