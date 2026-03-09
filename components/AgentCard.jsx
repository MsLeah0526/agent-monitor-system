import React from 'react';

const AgentCard = ({ agent }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'online';
      case 'warning':
        return 'warning';
      case 'offline':
        return 'offline';
      default:
        return 'error';
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
          <div className="agent-id">{agent.id}</div>
          <h3 className="agent-name">{agent.name}</h3>
          <div className="agent-nickname">👤 {agent.nickname}</div>
          <div className="agent-nickname">📋 {agent.role}</div>
        </div>
        <div className={`status-badge ${getStatusColor(agent.status)}`}>
          <span className="status-icon">{getStatusIcon(agent.status)}</span>
          <span className="status-text">{agent.status.toUpperCase()}</span>
        </div>
      </div>

      {/* 积分显示 */}
      <div className="score-display">
        <span className="score-icon">🏆</span>
        <div>
          <div className="metric-label">当前积分</div>
          <div className="score-value">{agent.score || 0}</div>
        </div>
      </div>

      <div className="agent-details">
        <div className="metric-section">
          <h4 className="section-title">实时性能指标</h4>
          <div className="metric-grid">
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
          </div>
        </div>

        {/* 工作信息 */}
        <div className="metric-section">
          <h4 className="section-title">工作信息</h4>
          
          {agent.current_work && (
            <div className="info-section">
              <div className="info-title">🔄 正在工作的内容</div>
              <div className="info-content">{agent.current_work}</div>
            </div>
          )}

          {agent.future_plans && (
            <div className="info-section">
              <div className="info-title">🚀 未来工作计划</div>
              <div className="info-content">{agent.future_plans}</div>
            </div>
          )}

          <div className="info-section">
            <div className="info-title">⏱️ 运行时间</div>
            <div className="info-content">{agent.uptime || 'N/A'}</div>
          </div>
        </div>

        <div className="info-section">
          <div className="info-title">📊 性能统计</div>
          <div className="metric-grid">
            <div className="metric">
              <div className="metric-label">运行天数</div>
              <div className="metric-value">{agent.uptime ? agent.uptime.split(' ')[0] : '0'}</div>
            </div>
            <div className="metric">
              <div className="metric-label">子Agent数量</div>
              <div className="metric-value">{agent.subagent_count || 0}</div>
            </div>
            <div className="metric">
              <div className="metric-label">沟通状态</div>
              <div className="metric-value">{agent.is_communicating ? '💬 沟通中' : '🔇 空闲'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="agent-footer">
        <div className="last-update">
          <span className="update-icon">⏱️</span>
          <span className="update-text">最后更新: {agent.lastUpdate || '刚刚'}</span>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;