/**
 * Data Sync Service
 * Synchronizes real-time data to SQLite database and Feishu backup
 */

import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataSync {
  constructor() {
    this.dbPath = path.join(__dirname, '../database/monitor.db');
    this.db = null;
    this.syncInterval = null;
    this.syncIntervalMs = 5000; // Sync every 5 seconds
    this.pendingUpdates = [];
  }

  async start() {
    await this.initializeDatabase();
    this.startSyncInterval();
    console.log('Data sync service started');
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    if (this.db) {
      this.db.close();
    }
    
    console.log('Data sync service stopped');
  }

  async initializeDatabase() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Failed to open database:', err);
          reject(err);
          return;
        }
        
        console.log('Database connected:', this.dbPath);
        this.createTables().then(resolve).catch(reject);
      });
    });
  }

  async createTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        score INTEGER DEFAULT 0,
        status TEXT DEFAULT 'offline',
        last_heartbeat INTEGER,
        tasks_completed INTEGER DEFAULT 0,
        tasks_failed INTEGER DEFAULT 0,
        total_tasks INTEGER DEFAULT 0,
        created_at INTEGER,
        updated_at INTEGER
      )`,
      
      `CREATE TABLE IF NOT EXISTS agent_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT,
        score INTEGER,
        change INTEGER,
        timestamp INTEGER,
        FOREIGN KEY (agent_id) REFERENCES agents(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS agent_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT,
        status TEXT,
        timestamp INTEGER,
        FOREIGN KEY (agent_id) REFERENCES agents(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT,
        task_id TEXT,
        status TEXT,
        timestamp INTEGER,
        FOREIGN KEY (agent_id) REFERENCES agents(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        agent_id TEXT,
        severity TEXT,
        message TEXT,
        timestamp INTEGER,
        notified INTEGER DEFAULT 0
      )`
    ];

    for (const sql of tables) {
      await this.run(sql);
    }
    
    console.log('Database tables created');
  }

  startSyncInterval() {
    this.syncInterval = setInterval(() => {
      this.syncPendingUpdates();
    }, this.syncIntervalMs);
  }

  queueUpdate(update) {
    this.pendingUpdates.push(update);
  }

  async syncPendingUpdates() {
    if (this.pendingUpdates.length === 0) {
      return;
    }

    const updates = [...this.pendingUpdates];
    this.pendingUpdates = [];

    for (const update of updates) {
      try {
        await this.processUpdate(update);
      } catch (error) {
        console.error('Failed to process update:', error);
      }
    }
  }

  async processUpdate(update) {
    switch (update.type) {
      case 'agent_register':
        await this.syncAgentRegister(update);
        break;
      case 'score_update':
        await this.syncScoreUpdate(update);
        break;
      case 'status_update':
        await this.syncStatusUpdate(update);
        break;
      case 'task_complete':
        await this.syncTaskComplete(update);
        break;
      case 'task_fail':
        await this.syncTaskFail(update);
        break;
      case 'alert':
        await this.syncAlert(update);
        break;
    }
  }

  async syncAgentRegister(update) {
    const now = Date.now();
    await this.run(
      `INSERT OR REPLACE INTO agents (id, score, status, last_heartbeat, created_at, updated_at)
       VALUES (?, 0, 'online', ?, ?, ?)`,
      [update.agentId, now, now, now]
    );
  }

  async syncScoreUpdate(update) {
    const now = Date.now();
    
    // Update agent score
    await this.run(
      `UPDATE agents SET score = ?, updated_at = ? WHERE id = ?`,
      [update.score, now, update.agentId]
    );
    
    // Record score history
    await this.run(
      `INSERT INTO agent_scores (agent_id, score, change, timestamp)
       VALUES (?, ?, ?, ?)`,
      [update.agentId, update.score, update.change, now]
    );
  }

  async syncStatusUpdate(update) {
    const now = Date.now();
    
    // Update agent status
    await this.run(
      `UPDATE agents SET status = ?, last_heartbeat = ?, updated_at = ? WHERE id = ?`,
      [update.status, now, now, update.agentId]
    );
    
    // Record status history
    await this.run(
      `INSERT INTO agent_status (agent_id, status, timestamp)
       VALUES (?, ?, ?)`,
      [update.agentId, update.status, now]
    );
  }

  async syncTaskComplete(update) {
    const now = Date.now();
    
    // Update agent task count
    await this.run(
      `UPDATE agents SET tasks_completed = tasks_completed + 1, total_tasks = total_tasks + 1, updated_at = ? WHERE id = ?`,
      [now, update.agentId]
    );
    
    // Record task
    await this.run(
      `INSERT INTO tasks (agent_id, task_id, status, timestamp)
       VALUES (?, ?, 'complete', ?)`,
      [update.agentId, update.taskId, now]
    );
  }

  async syncTaskFail(update) {
    const now = Date.now();
    
    // Update agent task count
    await this.run(
      `UPDATE agents SET tasks_failed = tasks_failed + 1, total_tasks = total_tasks + 1, updated_at = ? WHERE id = ?`,
      [now, update.agentId]
    );
    
    // Record task
    await this.run(
      `INSERT INTO tasks (agent_id, task_id, status, timestamp)
       VALUES (?, ?, 'fail', ?)`,
      [update.agentId, update.taskId, now]
    );
  }

  async syncAlert(update) {
    const now = Date.now();
    
    await this.run(
      `INSERT INTO alerts (type, agent_id, severity, message, timestamp, notified)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [update.type, update.agentId, update.severity, JSON.stringify(update.message), now]
    );
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Query methods for dashboard
  async getAllAgents() {
    return this.all('SELECT * FROM agents ORDER BY score DESC');
  }

  async getAgentHistory(agentId, hours = 24) {
    const since = Date.now() - (hours * 60 * 60 * 1000);
    return this.all(
      `SELECT * FROM agent_scores WHERE agent_id = ? AND timestamp >= ? ORDER BY timestamp ASC`,
      [agentId, since]
    );
  }

  async getAlertHistory(limit = 100) {
    return this.all(
      `SELECT * FROM alerts ORDER BY timestamp DESC LIMIT ?`,
      [limit]
    );
  }
}

export default DataSync;
