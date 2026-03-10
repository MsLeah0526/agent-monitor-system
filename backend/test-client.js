/**
 * Test Client for WebSocket Server
 * Simulates agent connections and events
 */

const WebSocket = require('ws');

class TestClient {
  constructor(url, agentId) {
    this.url = url;
    this.agentId = agentId;
    this.ws = null;
    this.reconnectInterval = 5000;
    this.heartbeatInterval = 30000;
    this.heartbeatTimer = null;
  }

  connect() {
    console.log(`Connecting to ${this.url} as ${this.agentId}...`);
    
    this.ws = new WebSocket(this.url);

    this.ws.on('open', () => {
      console.log(`Connected as ${this.agentId}`);
      this.register();
      this.startHeartbeat();
    });

    this.ws.on('message', (data) => {
      this.handleMessage(data);
    });

    this.ws.on('close', () => {
      console.log(`Disconnected: ${this.agentId}`);
      this.stopHeartbeat();
      this.reconnect();
    });

    this.ws.on('error', (error) => {
      console.error(`WebSocket error for ${this.agentId}:`, error.message);
    });
  }

  register() {
    this.send({
      type: 'register',
      agentId: this.agentId
    });
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  sendHeartbeat() {
    this.send({
      type: 'heartbeat',
      timestamp: Date.now()
    });
  }

  reconnect() {
    console.log(`Reconnecting in ${this.reconnectInterval / 1000} seconds...`);
    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      console.log(`[${this.agentId}] Received:`, message.type);
    } catch (error) {
      console.error(`Failed to parse message:`, error);
    }
  }

  // Simulate events
  updateScore(score) {
    this.send({
      type: 'score_update',
      score: score,
      timestamp: Date.now()
    });
  }

  updateStatus(status) {
    this.send({
      type: 'agent_status',
      status: status,
      timestamp: Date.now()
    });
  }

  completeTask(taskId) {
    this.send({
      type: 'task_complete',
      taskId: taskId,
      timestamp: Date.now()
    });
  }

  failTask(taskId) {
    this.send({
      type: 'task_fail',
      taskId: taskId,
      timestamp: Date.now()
    });
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Test script
if (require.main === module) {
  const WS_URL = process.env.WS_URL || 'ws://localhost:8080';
  
  // Create multiple test agents
  const agents = [
    new TestClient(WS_URL, 'pm-agent'),
    new TestClient(WS_URL, 'dev-agent'),
    new TestClient(WS_URL, 'test-agent'),
    new TestClient(WS_URL, 'data-agent')
  ];

  // Connect all agents
  agents.forEach(agent => agent.connect());

  // Simulate events after 5 seconds
  setTimeout(() => {
    console.log('\n=== Simulating events ===\n');
    
    // Update scores
    agents[0].updateScore(100);
    agents[1].updateScore(85);
    agents[2].updateScore(60);
    agents[3].updateScore(45);
    
    // Complete tasks
    agents[0].completeTask('task-001');
    agents[1].completeTask('task-002');
    agents[2].completeTask('task-003');
    
    // Fail some tasks
    agents[2].failTask('task-004');
    agents[3].failTask('task-005');
    agents[3].failTask('task-006');
    
    // Update status
    agents[0].updateStatus('busy');
    agents[1].updateStatus('idle');
  }, 5000);

  // Simulate score anomaly after 10 seconds
  setTimeout(() => {
    console.log('\n=== Simulating score anomaly ===\n');
    agents[1].updateScore(105); // +20 points change
  }, 10000);

  // Keep process running
  process.on('SIGINT', () => {
    console.log('\nShutting down test clients...');
    agents.forEach(agent => agent.disconnect());
    process.exit(0);
  });
}

module.exports = TestClient;
