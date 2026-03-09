import React, { useState, useEffect } from 'react';
import AgentCompactCard from './AgentCompactCard';
import { fetchAgentStatus } from '../utils/api';

const AgentDashboard = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  // 统计数据 - 所有百分比显示整数
  const onlineAgents = agents.filter(agent => agent.status === 'online').length;
  const warningAgents = agents.filter(agent => agent.status === 'warning').length;
  const offlineAgents = agents.filter(agent => agent.status === 'offline').length;
  const totalAgents = agents.length;
  const totalScore = agents.reduce((sum, agent) => sum + (agent.score || 0), 0);
  const avgSuccessRate = totalAgents > 0 
    ? Math.round(agents.reduce((sum, agent) => sum + agent.successRate, 0) / totalAgents) 
    : 0;

  // 过滤Agent
  const filteredAgents = filter === 'all'
    ? agents
    : agents.filter(agent => agent.status === filter);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div>加载中... 连接到Agent管理系统</div>
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
        <div className="stat-card">
          <div className="stat-number">{onlineAgents}</div>
          <div className="stat-label">在线Agent</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{warningAgents}</div>
          <div className="stat-label">警告状态</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{offlineAgents}</div>
          <div className="stat-label">离线Agent</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{avgSuccessRate}%</div>
          <div className="stat-label">平均成功率</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalScore}</div>
          <div className="stat-label">总积分</div>
        </div>
      </div>

      {/* 过滤选项 */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        {['all', 'online', 'warning', 'offline'].map(filterOption => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            style={{
              background: filter === filterOption ? '#4299e1' : '#1a2039',
              color: 'white',
              border: '1px solid #2d3748',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
          >
            {filterOption === 'all' ? '全部' :
             filterOption === 'online' ? '🟢 在线' :
             filterOption === 'warning' ? '🟡 警告' : '🔴 离线'}
          </button>
        ))}
      </div>

      {/* Agent状态卡片 - 一屏可见 */}
      <div className="agents-grid">
        {filteredAgents.map(agent => (
          <AgentCompactCard key={agent.id} agent={agent} />
        ))}
      </div>

      {/* 空状态 */}
      {filteredAgents.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#a0aec0',
          background: '#1a2039',
          borderRadius: '12px',
          border: '1px solid #2d3748'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>没有找到符合条件的Agent</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.25rem' }}>
            {filter === 'all' ? '系统中没有Agent' :
             filter === 'online' ? '当前没有在线的Agent' :
             filter === 'warning' ? '当前没有警告状态的Agent' : '当前没有离线的Agent'}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;