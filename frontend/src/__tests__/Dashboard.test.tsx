// Dashboard组件测试
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import * as api from '../services/api';

// Mock API
vi.mock('../services/api', () => ({
  agentApi: {
    getAllAgents: vi.fn(),
    getTeamOverview: vi.fn(),
  },
}));

// Mock WebSocket
vi.mock('../services/websocket', () => ({
  wsService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(api.agentApi.getAllAgents).mockResolvedValue([]);
    vi.mocked(api.agentApi.getTeamOverview).mockResolvedValue({
      totalAgents: 0,
      onlineAgents: 0,
      totalScore: 0,
      totalTasksCompleted: 0,
      totalTasksFailed: 0,
      averagePerformance: {
        cpuUsage: 0,
        memoryUsage: 0,
        responseTime: 0,
        uptime: 0,
      },
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('总Agent数')).toBeInTheDocument();
    expect(screen.getByText('在线Agent')).toBeInTheDocument();
    expect(screen.getByText('总积分')).toBeInTheDocument();
    expect(screen.getByText('任务完成率')).toBeInTheDocument();
  });

  it('should display agent data after loading', async () => {
    const mockAgents = [
      {
        id: '1',
        name: '贾维斯',
        role: '开发',
        status: 'online',
        score: 590,
        lastActive: new Date().toISOString(),
        tasksCompleted: 10,
        tasksFailed: 1,
        performance: {
          cpuUsage: 50,
          memoryUsage: 60,
          responseTime: 100,
          uptime: 3600,
        },
      },
    ];

    vi.mocked(api.agentApi.getAllAgents).mockResolvedValue(mockAgents);
    vi.mocked(api.agentApi.getTeamOverview).mockResolvedValue({
      totalAgents: 1,
      onlineAgents: 1,
      totalScore: 590,
      totalTasksCompleted: 10,
      totalTasksFailed: 1,
      averagePerformance: {
        cpuUsage: 50,
        memoryUsage: 60,
        responseTime: 100,
        uptime: 3600,
      },
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('贾维斯')).toBeInTheDocument();
    });
  });

  it('should display team overview statistics', async () => {
    const mockOverview = {
      totalAgents: 5,
      onlineAgents: 3,
      totalScore: 2500,
      totalTasksCompleted: 50,
      totalTasksFailed: 5,
      averagePerformance: {
        cpuUsage: 45,
        memoryUsage: 55,
        responseTime: 120,
        uptime: 7200,
      },
    };

    vi.mocked(api.agentApi.getAllAgents).mockResolvedValue([]);
    vi.mocked(api.agentApi.getTeamOverview).mockResolvedValue(mockOverview);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });
});
