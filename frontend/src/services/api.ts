// API服务
import axios from 'axios';
import { Agent, AgentDetail, TeamOverview, ReportFilter, ReportExport } from '../types/agent';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const agentApi = {
  // 获取所有Agent
  getAllAgents: async (): Promise<Agent[]> => {
    const response = await api.get('/agents');
    return response.data;
  },

  // 获取单个Agent详情
  getAgentDetail: async (agentId: string): Promise<AgentDetail> => {
    const response = await api.get(`/agents/${agentId}`);
    return response.data;
  },

  // 获取团队概览
  getTeamOverview: async (): Promise<TeamOverview> => {
    const response = await api.get('/team/overview');
    return response.data;
  },

  // 获取Agent历史数据
  getAgentHistory: async (agentId: string, timeRange: string): Promise<any[]> => {
    const response = await api.get(`/agents/${agentId}/history`, {
      params: { timeRange },
    });
    return response.data;
  },

  // 获取告警列表
  getAlerts: async (resolved = false): Promise<any[]> => {
    const response = await api.get('/alerts', {
      params: { resolved },
    });
    return response.data;
  },

  // 解决告警
  resolveAlert: async (alertId: string): Promise<void> => {
    await api.patch(`/alerts/${alertId}/resolve`);
  },

  // 生成报表
  generateReport: async (filter: ReportFilter): Promise<any> => {
    const response = await api.post('/reports/generate', filter);
    return response.data;
  },

  // 导出报表
  exportReport: async (exportConfig: ReportExport): Promise<Blob> => {
    const response = await api.post('/reports/export', exportConfig, {
      responseType: 'blob',
    });
    return response.data;
  },

  // 获取性能指标
  getPerformanceMetrics: async (agentId: string): Promise<any> => {
    const response = await api.get(`/agents/${agentId}/performance`);
    return response.data;
  },

  // 获取任务列表
  getTasks: async (agentId: string, status?: string): Promise<any[]> => {
    const response = await api.get(`/agents/${agentId}/tasks`, {
      params: { status },
    });
    return response.data;
  },
};

export default api;
