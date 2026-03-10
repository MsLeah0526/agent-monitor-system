/**
 * Feishu Notifier
 * Sends alerts to Feishu via webhook or API
 */

const axios = require('axios');

class FeishuNotifier {
  constructor() {
    this.webhookUrl = process.env.FEISHU_WEBHOOK_URL || '';
    this.appId = process.env.FEISHU_APP_ID || '';
    this.appSecret = process.env.FEISHU_APP_SECRET || '';
    this.enabled = !!this.webhookUrl || (!!this.appId && !!this.appSecret);
  }

  async send(message, alertData) {
    if (!this.enabled) {
      console.log('Feishu notifier not configured, skipping');
      return;
    }

    try {
      if (this.webhookUrl) {
        await this.sendViaWebhook(message);
      } else if (this.appId && this.appSecret) {
        await this.sendViaAPI(message);
      }
      
      console.log('Feishu notification sent successfully');
    } catch (error) {
      console.error('Failed to send Feishu notification:', error.message);
      throw error;
    }
  }

  async sendViaWebhook(message) {
    const card = {
      msg_type: 'interactive',
      card: {
        header: {
          title: {
            tag: 'plain_text',
            content: message.title
          },
          template: this.getTemplate(message.severity)
        },
        elements: [
          {
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: message.content.replace(/\n/g, '\n\n')
            }
          },
          {
            tag: 'action',
            actions: [
              {
                tag: 'button',
                text: {
                  tag: 'plain_text',
                  content: '查看详情'
                },
                type: 'default',
                url: `${process.env.DASHBOARD_URL || 'http://localhost:3000'}/agents/${alertData.agentId}`
              }
            ]
          }
        ]
      }
    };

    await axios.post(this.webhookUrl, card);
  }

  async sendViaAPI(message) {
    // Get access token
    const accessToken = await this.getAccessToken();
    
    // Send message
    const response = await axios.post(
      `https://open.feishu.cn/open-apis/bot/v2/hook/${this.webhookUrl}`,
      {
        msg_type: 'text',
        content: {
          text: `${message.title}\n\n${message.content}`
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  }

  async getAccessToken() {
    const response = await axios.post(
      'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
      {
        app_id: this.appId,
        app_secret: this.appSecret
      }
    );
    
    return response.data.tenant_access_token;
  }

  getTemplate(severity) {
    switch (severity) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'blue';
      default:
        return 'grey';
    }
  }
}

module.exports = FeishuNotifier;
