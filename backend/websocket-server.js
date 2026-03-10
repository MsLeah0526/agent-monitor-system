/**
 * WebSocket Server for Agent Monitor System
 * Handles real-time connections, heartbeat, and data synchronization
 */

import { WebSocketServer as WSServer } from 'ws';
import http from 'http';
import AgentManager from './agent-manager.js';
import AlertService from './alert-service.js';
import DataSync from './data-sync.js';

class WebSocketServer {
  constructor(port = 8080) {
    this.port = port;
    this.server = null;
    this.wss = null;
    this.clients = new Map();
    this.agentManager = new AgentManager();
    this.alertService = new AlertService();
    this.dataSync = new DataSync();
    
    // Heartbeat interval (30 seconds)
    this.heartbeatInterval = 30000;
    this.heartbeatTimer = null;
    
    // Offline threshold (2 minutes)
    this.offlineThreshold = 120000;
  }

  start() {
    // Create HTTP server
    this.server = http.createServer((req, res) => {
      res.writeHead(200);
      res.end('WebSocket Server Running');
    });

    // Create WebSocket server
    this.wss = new WSServer({ server: this.server });

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    // Start server
    this.server.listen(this.port, () => {
      console.log(`WebSocket Server started on port ${this.port}`);
    });

    // Start heartbeat
    this.startHeartbeat();
    
    // Start alert monitoring
    this.alertService.startMonitoring();
    
    // Start data sync
    this.dataSync.start();
  }

  handleConnection(ws, req) {
    const clientId = this.generateClientId();
    const clientInfo = {
      id: clientId,
      ws: ws,
      agentId: null,
      lastHeartbeat: Date.now(),
      isConnected: true
    };

    this.clients.set(clientId, clientInfo);
    console.log(`Client connected: ${clientId}`);

    ws.on('message', (message) => {
      this.handleMessage(clientId, message);
    });

    ws.on('close', () => {
      this.handleDisconnection(clientId);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
    });

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'welcome',
      clientId: clientId,
      timestamp: Date.now()
    });
  }

  handleMessage(clientId, message) {
    try {
      const data = JSON.parse(message);
      const client = this.clients.get(clientId);
      
      if (!client) return;

      switch (data.type) {
        case 'register':
          this.handleRegister(clientId, data);
          break;
        case 'heartbeat':
          this.handleHeartbeat(clientId, data);
          break;
        case 'agent_status':
          this.handleAgentStatus(clientId, data);
          break;
        case 'score_update':
          this.handleScoreUpdate(clientId, data);
          break;
        case 'task_complete':
          this.handleTaskComplete(clientId, data);
          break;
        case 'task_fail':
          this.handleTaskFail(clientId, data);
          break;
        default:
          console.log(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error(`Error handling message from ${clientId}:`, error);
    }
  }

  handleRegister(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.agentId = data.agentId;
    this.agentManager.registerAgent(data.agentId, clientId);
    
    console.log(`Agent registered: ${data.agentId} -> ${clientId}`);
    
    this.sendToClient(clientId, {
      type: 'register_success',
      agentId: data.agentId,
      timestamp: Date.now()
    });

    // Broadcast to all clients
    this.broadcast({
      type: 'agent_online',
      agentId: data.agentId,
      timestamp: Date.now()
    });
  }

  handleHeartbeat(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastHeartbeat = Date.now();
    
    if (client.agentId) {
      this.agentManager.updateHeartbeat(client.agentId);
    }

    this.sendToClient(clientId, {
      type: 'heartbeat_ack',
      timestamp: Date.now()
    });
  }

  handleAgentStatus(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || !client.agentId) return;

    this.agentManager.updateStatus(client.agentId, data.status);
    
    // Broadcast status update
    this.broadcast({
      type: 'status_update',
      agentId: client.agentId,
      status: data.status,
      timestamp: Date.now()
    });
  }

  handleScoreUpdate(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || !client.agentId) return;

    const previousScore = this.agentManager.getScore(client.agentId);
    const scoreChange = data.score - previousScore;

    this.agentManager.updateScore(client.agentId, data.score);
    
    // Check for score anomaly alert
    if (Math.abs(scoreChange) >= 20) {
      this.alertService.triggerAlert({
        type: 'score_anomaly',
        agentId: client.agentId,
        previousScore: previousScore,
        newScore: data.score,
        change: scoreChange,
        timestamp: Date.now()
      });
    }

    // Broadcast score update
    this.broadcast({
      type: 'score_update',
      agentId: client.agentId,
      score: data.score,
      change: scoreChange,
      timestamp: Date.now()
    });
  }

  handleTaskComplete(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || !client.agentId) return;

    this.agentManager.recordTaskComplete(client.agentId);
    
    // Broadcast task completion
    this.broadcast({
      type: 'task_complete',
      agentId: client.agentId,
      taskId: data.taskId,
      timestamp: Date.now()
    });
  }

  handleTaskFail(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || !client.agentId) return;

    this.agentManager.recordTaskFail(client.agentId);
    
    // Check for high failure rate
    const failureRate = this.agentManager.getFailureRate(client.agentId);
    if (failureRate > 0.1) { // > 10%
      this.alertService.triggerAlert({
        type: 'high_failure_rate',
        agentId: client.agentId,
        failureRate: failureRate,
        timestamp: Date.now()
      });
    }

    // Broadcast task failure
    this.broadcast({
      type: 'task_fail',
      agentId: client.agentId,
      taskId: data.taskId,
      timestamp: Date.now()
    });
  }

  handleDisconnection(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    console.log(`Client disconnected: ${clientId}`);

    if (client.agentId) {
      this.agentManager.unregisterAgent(client.agentId);
      
      // Broadcast agent offline
      this.broadcast({
        type: 'agent_offline',
        agentId: client.agentId,
        timestamp: Date.now()
      });
    }

    this.clients.delete(clientId);
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.checkHeartbeats();
    }, this.heartbeatInterval);
    
    console.log('Heartbeat monitoring started');
  }

  checkHeartbeats() {
    const now = Date.now();
    
    this.clients.forEach((client, clientId) => {
      const timeSinceLastHeartbeat = now - client.lastHeartbeat;
      
      if (timeSinceLastHeartbeat > this.offlineThreshold) {
        console.log(`Agent ${client.agentId} offline: ${timeSinceLastHeartbeat}ms since last heartbeat`);
        
        // Trigger offline alert
        if (client.agentId) {
          this.alertService.triggerAlert({
            type: 'agent_offline',
            agentId: client.agentId,
            lastHeartbeat: client.lastHeartbeat,
            offlineDuration: timeSinceLastHeartbeat,
            timestamp: now
          });
        }
        
        // Close connection
        client.ws.close();
      }
    });
  }

  sendToClient(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || !client.ws) return;

    try {
      client.ws.send(JSON.stringify(data));
    } catch (error) {
      console.error(`Error sending to client ${clientId}:`, error);
    }
  }

  broadcast(data, excludeClientId = null) {
    this.clients.forEach((client, clientId) => {
      if (clientId !== excludeClientId) {
        this.sendToClient(clientId, data);
      }
    });
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  stop() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    this.alertService.stopMonitoring();
    this.dataSync.stop();
    
    if (this.wss) {
      this.wss.close();
    }
    
    if (this.server) {
      this.server.close();
    }
    
    console.log('WebSocket Server stopped');
  }
}

export default WebSocketServer;
