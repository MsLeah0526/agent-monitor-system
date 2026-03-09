import React from 'react';
import AgentDashboard from './components/AgentDashboard';
import './styles/main.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>👨‍💻 Agent监测系统</h1>
          <p>一屏查看所有Agent状态 | 点击卡片查看详情</p>
        </div>
      </header>
      <main className="app-main">
        <AgentDashboard />
      </main>
      <footer className="app-footer">
        <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          🚀 Agent监测系统 v2.0 - 紧凑布局版
        </div>
        <div>📊 实时监控 | 数据驱动 | 智能管理</div>
        <div style={{ marginTop: '0.5rem', opacity: 0.7, fontSize: '0.85rem' }}>
          © 2026 高级人工智能实验室
        </div>
      </footer>
    </div>
  );
}

export default App;