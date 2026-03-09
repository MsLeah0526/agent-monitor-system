import React, { useState, useEffect } from 'react';
import AgentDashboard from './components/AgentDashboard';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>👨‍💻 Agent监测系统</h1>
        <p>实时监控和可视化Agent状态</p>
      </header>
      <main className="app-main">
        <AgentDashboard />
      </main>
    </div>
  );
}

export default App;