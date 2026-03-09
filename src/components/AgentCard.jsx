import React from 'react';

const AgentCard = ({ agent }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'offline':
        return 'bg-gray-100 border-gray-400 text-gray-800';
      default:
        return 'bg-red-100 border-red-400 text-red-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return '🟢';
      case 'warning':
        return '🟡';
      case 'offline':
        return '⚪';
      default:
        return '🔴';
    }
  };

  const progressBarClass = (value) => {
    if (value < 60) return 'bg-green-500';
    if (value < 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="agent-card">
      <div className="agent-header">
        <div className="agent-info">
          <h3 className="agent-name">{agent.name}</h3>
          <p className="agent-id">ID: {agent.id}</p>
        </div>
        <div className={`status-badge ${getStatusColor(agent.status)}`}>
          <span className="status-icon">{getStatusIcon(agent.status)}</span>
          <span className="status-text">{agent.status.toUpperCase()}</span>
        </div>
      </div>

      <div className="agent-details">
        <div className="metric">
          <div className="metric-label">CPU使用率</div>
          <div className="metric-value">{agent.cpuUsage}%</div>
          <div className="progress-bar">
            <div className={`progress-fill ${progressBarClass(agent.cpuUsage)}`} style={{ width: `${agent.cpuUsage}%` }}></div>
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">内存使用率</div>
          <div className="metric-value">{agent.memoryUsage}%</div>
          <div className="progress-bar">
            <div className={`progress-fill ${progressBarClass(agent.memoryUsage)}`} style={{ width: `${agent.memoryUsage}%` }}></div>
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">请求成功率</div>
          <div className="metric-value">{agent.successRate}%</div>
          <div className="progress-bar">
            <div className={`progress-fill ${agent.successRate >= 90 ? 'bg-green-500' : agent.successRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${agent.successRate}%` }}></div>
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">请求/分钟</div>
          <div className="metric-value">{agent.requestsPerMinute}</div>
        </div>

        <div className="metric">
          <div className="metric-label">运行时间</div>
          <div className="metric-value">{agent.uptime}</div>
        </div>
      </div>

      <div className="agent-footer">
        <div className="last-update">
          <span className="update-icon">⏱️</span>
          <span className="update-text">最后更新: {agent.lastUpdate}</span>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;