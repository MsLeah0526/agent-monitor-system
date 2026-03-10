/**
 * Agent Manager
 * Manages agent connections, state, and statistics
 */

class AgentManager {
  constructor() {
    this.agents = new Map();
  }

  registerAgent(agentId, clientId) {
    if (!this.agents.has(agentId)) {
      this.agents.set(agentId, {
        id: agentId,
        clientId: clientId,
        score: 0,
        status: 'online',
        lastHeartbeat: Date.now(),
        tasksCompleted: 0,
        tasksFailed: 0,
        totalTasks: 0,
        registeredAt: Date.now()
      });
    } else {
      // Update existing agent
      const agent = this.agents.get(agentId);
      agent.clientId = clientId;
      agent.status = 'online';
      agent.lastHeartbeat = Date.now();
    }
  }

  unregisterAgent(agentId) {
    if (this.agents.has(agentId)) {
      const agent = this.agents.get(agentId);
      agent.status = 'offline';
      agent.lastHeartbeat = Date.now();
    }
  }

  updateHeartbeat(agentId) {
    if (this.agents.has(agentId)) {
      const agent = this.agents.get(agentId);
      agent.lastHeartbeat = Date.now();
      agent.status = 'online';
    }
  }

  updateStatus(agentId, status) {
    if (this.agents.has(agentId)) {
      const agent = this.agents.get(agentId);
      agent.status = status;
    }
  }

  updateScore(agentId, score) {
    if (this.agents.has(agentId)) {
      const agent = this.agents.get(agentId);
      agent.score = score;
    }
  }

  getScore(agentId) {
    if (this.agents.has(agentId)) {
      return this.agents.get(agentId).score;
    }
    return 0;
  }

  recordTaskComplete(agentId) {
    if (this.agents.has(agentId)) {
      const agent = this.agents.get(agentId);
      agent.tasksCompleted++;
      agent.totalTasks++;
    }
  }

  recordTaskFail(agentId) {
    if (this.agents.has(agentId)) {
      const agent = this.agents.get(agentId);
      agent.tasksFailed++;
      agent.totalTasks++;
    }
  }

  getFailureRate(agentId) {
    if (this.agents.has(agentId)) {
      const agent = this.agents.get(agentId);
      if (agent.totalTasks === 0) return 0;
      return agent.tasksFailed / agent.totalTasks;
    }
    return 0;
  }

  getAgent(agentId) {
    return this.agents.get(agentId);
  }

  getAllAgents() {
    return Array.from(this.agents.values());
  }

  getOnlineAgents() {
    return this.getAllAgents().filter(agent => agent.status === 'online');
  }

  getOfflineAgents() {
    return this.getAllAgents().filter(agent => agent.status === 'offline');
  }

  getAgentCount() {
    return this.agents.size;
  }

  getOnlineCount() {
    return this.getOnlineAgents().length;
  }

  getOfflineCount() {
    return this.getOfflineAgents().length;
  }
}

export default AgentManager;
