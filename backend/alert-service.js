/**
 * Alert Service
 * Handles alert detection and multi-channel notifications
 */

const FeishuNotifier = require('./notifiers/feishu-notifier.js');
const EmailNotifier = require('./notifiers/email-notifier.js');
const DingTalkNotifier = require('./notifiers/dingtalk-notifier.js');

class AlertService {
  constructor() {
    this.notifiers = {
      feishu: new FeishuNotifier(),
      email: new EmailNotifier(),
      dingtalk: new DingTalkNotifier()
    };
    
    this.alertHistory = [];
    this.monitoringInterval = null;
    this.monitoringIntervalMs = 60000; // Check every minute
  }

  startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.checkAlerts();
    }, this.monitoringIntervalMs);
    
    console.log('Alert monitoring started');
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      console.log('Alert monitoring stopped');
    }
  }

  checkAlerts() {
    // This method can be used for periodic checks
    // For now, alerts are triggered in real-time by events
  }

  triggerAlert(alertData) {
    console.log(`Alert triggered: ${alertData.type} for agent ${alertData.agentId}`);
    
    // Store alert in history
    this.alertHistory.push({
      ...alertData,
      id: this.generateAlertId(),
      notified: false
    });

    // Send notifications to all channels
    this.sendNotifications(alertData);
  }

  sendNotifications(alertData) {
    const message = this.formatAlertMessage(alertData);
    
    // Send to all configured channels
    Object.keys(this.notifiers).forEach(channel => {
      try {
        this.notifiers[channel].send(message, alertData);
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
      }
    });
  }

  formatAlertMessage(alertData) {
    const timestamp = new Date(alertData.timestamp).toLocaleString('zh-CN');
    
    switch (alertData.type) {
      case 'agent_offline':
        return {
          title: '⚠️ Agent离线告警',
          content: `Agent ${alertData.agentId} 已离线\n离线时长: ${Math.floor(alertData.offlineDuration / 1000)}秒\n时间: ${timestamp}`,
          severity: 'high'
        };
      
      case 'score_anomaly':
        const changeText = alertData.change > 0 ? '+' : '';
        return {
          title: '📊 积分异常告警',
          content: `Agent ${alertData.agentId} 积分异常变化\n变化: ${changeText}${alertData.change} (${alertData.previousScore} → ${alertData.newScore})\n时间: ${timestamp}`,
          severity: 'medium'
        };
      
      case 'high_failure_rate':
        return {
          title: '❌ 任务失败率告警',
          content: `Agent ${alertData.agentId} 任务失败率过高\n失败率: ${(alertData.failureRate * 100).toFixed(1)}%\n时间: ${timestamp}`,
          severity: 'high'
        };
      
      default:
        return {
          title: '🔔 系统告警',
          content: `未知告警类型: ${alertData.type}\n时间: ${timestamp}`,
          severity: 'low'
        };
    }
  }

  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getAlertHistory(limit = 100) {
    return this.alertHistory.slice(-limit);
  }

  getAlertStats() {
    const stats = {
      total: this.alertHistory.length,
      byType: {},
      bySeverity: {}
    };

    this.alertHistory.forEach(alert => {
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
      
      const message = this.formatAlertMessage(alert);
      stats.bySeverity[message.severity] = (stats.bySeverity[message.severity] || 0) + 1;
    });

    return stats;
  }
}

module.exports = AlertService;
