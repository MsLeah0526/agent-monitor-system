// Agent类型定义

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'error';
  score: number;
  lastActive: string;
  tasksCompleted: number;
  tasksFailed: number;
  performance: PerformanceMetrics;
}

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  uptime: number;
}

export interface AgentDetail extends Agent {
  history: ScoreHistory[];
  tasks: Task[];
  alerts: Alert[];
}

export interface ScoreHistory {
  timestamp: string;
  score: number;
  change: number;
}

export interface Task {
  id: string;
  name: string;
  status: 'completed' | 'failed' | 'pending';
  startTime: string;
  endTime?: string;
  duration?: number;
}

export interface Alert {
  id: string;
  type: 'offline' | 'score' | 'performance' | 'task';
  severity: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface TeamOverview {
  totalAgents: number;
  onlineAgents: number;
  totalScore: number;
  totalTasksCompleted: number;
  totalTasksFailed: number;
  averagePerformance: PerformanceMetrics;
}

export interface WebSocketMessage {
  type: 'agent-update' | 'score-change' | 'alert' | 'team-overview';
  data: any;
  timestamp: string;
}

export interface ChartData {
  timestamp: string;
  value: number;
}

export interface ReportFilter {
  timeRange: '1h' | '24h' | '7d' | '30d' | 'custom';
  startTime?: string;
  endTime?: string;
  agents?: string[];
  types?: string[];
}

export interface ReportExport {
  format: 'csv' | 'excel' | 'pdf';
  data: any;
  filename: string;
}
