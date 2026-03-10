/**
 * DingTalk Notifier
 * Sends alerts to DingTalk via webhook
 */

const axios = require('axios');

class DingTalkNotifier {
  constructor() {
    this.webhookUrl = process.env.DINGTALK_WEBHOOK_URL || '';
    this.secret = process.env.DINGTALK_SECRET || '';
    this.enabled = !!this.webhookUrl;
  }

  async send(message, alertData) {
    if (!this.enabled) {
      console.log('DingTalk notifier not configured, skipping');
      return;
    }

    try {
      const webhookUrl = this.secret ? this.signWebhook() : this.webhookUrl;
      
      const data = {
        msgtype: 'markdown',
        markdown: {
          title: message.title,
          text: this.formatMarkdown(message, alertData)
        },
        at: {
          isAtAll: false
        }
      };

      await axios.post(webhookUrl, data);
      console.log('DingTalk notification sent successfully');
    } catch (error) {
      console.error('Failed to send DingTalk notification:', error.message);
      throw error;
    }
  }

  formatMarkdown(message, alertData) {
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';
    
    return `
### ${message.title}

${message.content.replace(/\n/g, '\n\n')}

---

[查看详情](${dashboardUrl}/agents/${alertData.agentId})
    `.trim();
  }

  signWebhook() {
    const crypto = require('crypto');
    const timestamp = Date.now();
    const stringToSign = `${timestamp}\n${this.secret}`;
    const sign = crypto
      .createHmac('sha256', this.secret)
      .update(stringToSign)
      .digest('base64');
    const encodedSign = encodeURIComponent(sign);
    
    return `${this.webhookUrl}&timestamp=${timestamp}&sign=${encodedSign}`;
  }
}

module.exports = DingTalkNotifier;
