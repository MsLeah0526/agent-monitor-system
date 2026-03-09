import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AgentCard from './AgentCard';
import { fetchAgentStatus } from '../utils/api';

const AgentDashboard = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟定时刷新Agent状态
    const interval = setInterval(() => {
      fetchAgentStatus()
        .then(data => {
          setAgents(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('获取Agent状态失败:', error);
          setLoading(false);
        });
    }, 5000);

    // 初始加载
    fetchAgentStatus()
      .then(data => {
        setAgents(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('获取Agent状态失败:', error);
        setLoading(false);
      });

    return () => clearInterval(interval);
  }, []);

  // 统计数据
  const onlineAgents = agents.filter(agent => agent.status === 'online').length;
  const totalAgents = agents.length;
  const successRate = totalAgents > 0 ? (agents.filter(agent => agent.successRate > 90).length / totalAgents * 100).toFixed(1) : 0;

  // 图表数据
  const performanceData = agents.map(agent => ({
    name: agent.name,
    cpu: agent.cpuUsage,
    memory: agent.memoryUsage,
    requests: agent.requestsPerMinute
  }));

  const successRateData = agents.map(agent => ({
    name: agent.name,
    successRate: agent.successRate
  }));

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🚀 正在加载Agent数据...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* 统计卡片 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{totalAgents}</div>
          <div className="stat-label">总Agent数量</div>
        </div>
        <div className="stat-card online">
          <div className="stat-number">{onlineAgents}</div>
          <div className="stat-label">在线Agent</div>
        </div>
        <div className="stat-card success">
          <div className="stat-number">{successRate}%</div>
          <div className="stat-label">成功率 &gt; 90%</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{agents.reduce((sum, agent) => sum + agent.requestsPerMinute, 0)}</div>
          <div className="stat-label">总请求/分钟</div>
        </div>
      </div>

      {/* Agent状态卡片 */}
      <div className="agents-grid">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {/* 性能图表 */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>CPU与内存使用情况</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cpu" fill="#1890ff" name="CPU使用率(%)" />
              <Bar dataKey="memory" fill="#52c41a" name="内存使用率(%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>请求成功率</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={successRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} unit="%" />
              <Tooltip formatter={(value) => [`${value}%`, '成功率']} />
              <Legend />
              <Line type="monotone" dataKey="successRate" stroke="#faad14" strokeWidth={2} name="成功率(%)" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;