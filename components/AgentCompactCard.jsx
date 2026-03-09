import React, { useState } from 'react';

const AgentCompactCard = ({ agent }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusClass = (status) => {
    switch (status) {
      case 'online': return 'online';
      case 'warning': return 'warning';
      case 'offline': return 'offline';
      default: return 'offline';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'online': return { text: '在线', color: 'online' };
      case 'warning': return { text: '警告', color: 'warning' };
      case 'offline': return { text: '离线', color: 'offline' };
      default: return { text: '离线', color: 'offline' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return '🟢';
      case 'warning': return '🟡';
      case 'offline': return '🔴';
      default: return '🔴';
    }
  };

  const getMetricColor = (value, isSuccessRate = false) => {
    if (isSuccessRate) {
      if (value >= 90) return 'green';
      if (value >= 70) return 'yellow';
      return 'red';
    }
    if (value < 60) return 'green';
    if (value < 85) return 'yellow';
    return 'red';
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case '进行中': return '#4299e1';
      case '已完成': return '#48bb78';
      case '等待中': return '#ed8936';
      default: return '#e2e8f0';
    }
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // 计算总进度
  const totalProgress = agent.work_tasks ? 
    Math.round(agent.work_tasks.reduce((sum, task) => sum + task.progress, 0) / agent.work_tasks.length) : 0;

  return (
    <div className={`agent-card ${getStatusClass(agent.status)}`} onClick={toggleExpand}>
      <div className="agent-header">
        <div className="agent-info">
          <h3>{agent.name}</h3>
          <div className="agent-nickname">{agent.nickname}</div>
          <div className="agent-role">{agent.role}</div>
        </div>
        <div className={`status-badge ${getStatusBadge(agent.status).color}`}>
          <span className="status-icon">{getStatusIcon(agent.status)}</span>
          <span className="status-text">{getStatusBadge(agent.status).text}</span>
        </div>
      </div>

      {/* 核心指标 - 百分比显示整数 */}
      <div className="metrics-grid">
        <div className="metric-item">
          <div className="metric-label">CPU</div>
          <div className={`metric-value ${getMetricColor(agent.cpuUsage)}`}>
            {Math.round(agent.cpuUsage)}%
          </div>
        </div>
        <div className="metric-item">
          <div className="metric-label">内存</div>
          <div className={`metric-value ${getMetricColor(agent.memoryUsage)}`}>
            {Math.round(agent.memoryUsage)}%
          </div>
        </div>
        <div className="metric-item">
          <div className="metric-label">成功率</div>
          <div className={`metric-value ${getMetricColor(agent.successRate, true)}`}>
            {Math.round(agent.successRate)}%
          </div>
        </div>
        <div className="metric-item">
          <div className="metric-label">积分</div>
          <div className="metric-value">
            🏆 {agent.score || 0}
          </div>
        </div>
      </div>

      {/* 展开详细信息 */}
      {expanded && (
        <div className="agent-details">
          <div className="detail-section">
            <div className="detail-title">📊 工作总进度</div>
            <div style={{ 
              background: 'rgba(26, 32, 57, 0.6)',
              borderRadius: '8px',
              padding: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#a0aec0', fontSize: '0.85rem' }}>当前任务整体进度</span>
                <span style={{ color: '#48bb78', fontSize: '0.85rem', fontWeight: '700' }}>{totalProgress}%</span>
              </div>
              <div style={{ 
                height: '10px', 
                background: '#2d3748', 
                borderRadius: '5px', 
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{ 
                  height: '100%', 
                  width: `${totalProgress}%`, 
                  background: `linear-gradient(90deg, #48bb78, #4299e1)`,
                  transition: 'width 0.5s ease'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'shine 2s ease-in-out infinite'
                }}></div>
              </div>
            </div>
          </div>

          {/* 工作任务清单 */}
          <div className="detail-section">
            <div className="detail-title">🔄 正在进行的任务</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {agent.work_tasks && agent.work_tasks.map(task => (
                task.status === '进行中' && (
                <div key={task.id} style={{ 
                  background: 'rgba(26, 32, 57, 0.6)',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(66, 153, 225, 0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '0.9rem' }}>
                      {task.name}
                    </div>
                    <div style={{ color: getStatusTextColor(task.status), fontSize: '0.8rem', fontWeight: '700' }}>
                      {task.status}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#a0aec0', fontSize: '0.8rem' }}>
                      进度: {task.progress}%
                    </div>
                  </div>
                  <div style={{ 
                    height: '8px', 
                    background: '#2d3748', 
                    borderRadius: '4px', 
                    overflow: 'hidden',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${task.progress}%`, 
                      background: `linear-gradient(90deg, #48bb78, #4299e1)`,
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                  <div style={{ 
                    color: '#a0aec0', 
                    fontSize: '0.75rem', 
                    marginTop: '0.5rem',
                    fontStyle: 'italic'
                  }}>
                    {task.description}
                  </div>
                </div>
                )
              ))}
            </div>
          </div>

          {/* 已完成任务 */}
          <div className="detail-section">
            <div className="detail-title">✅ 已完成任务</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {agent.work_tasks && agent.work_tasks.map(task => (
                task.status === '已完成' && (
                <div key={task.id} style={{ 
                  background: 'rgba(26, 32, 57, 0.6)',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(72, 187, 120, 0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '0.9rem' }}>
                      {task.name}
                    </div>
                    <div style={{ color: getStatusTextColor(task.status), fontSize: '0.8rem', fontWeight: '700' }}>
                      {task.status}
                    </div>
                  </div>
                  <div style={{ 
                    color: '#a0aec0', 
                    fontSize: '0.75rem',
                    fontStyle: 'italic'
                  }}>
                    {task.description}
                  </div>
                </div>
                )
              ))}
            </div>
          </div>

          {/* 未来计划 */}
          <div className="detail-section">
            <div className="detail-title">🚀 未来工作计划</div>
            <div className="detail-content" style={{ padding: '1rem' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {agent.future_tasks && agent.future_tasks.map((task, index) => (
                  <li key={index} style={{ 
                    marginBottom: '0.5rem',
                    color: '#cbd5e0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                  }}>
                    <span style={{ color: '#48bb78', fontSize: '1rem' }}>▶️</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 更多信息 */}
          <div className="detail-section">
            <div className="detail-title">📋 其他信息</div>
            <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className="metric-item">
                <div className="metric-label">运行时间</div>
                <div className="metric-value">{agent.uptime || 'N/A'}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">请求量</div>
                <div className="metric-value">{agent.requestsPerMinute}/分钟</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">子Agent数</div>
                <div className="metric-value">{agent.subagent_count || 0}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">沟通状态</div>
                <div className="metric-value">
                  {agent.is_communicating ? '💬 沟通中' : '🔇 空闲'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentCompactCard;