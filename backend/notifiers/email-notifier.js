/**
 * Email Notifier
 * Sends alerts via email using SMTP
 */

const nodemailer = require('nodemailer');

class EmailNotifier {
  constructor() {
    this.smtpHost = process.env.SMTP_HOST || 'localhost';
    this.smtpPort = parseInt(process.env.SMTP_PORT || '587');
    this.smtpSecure = process.env.SMTP_SECURE === 'true';
    this.smtpUser = process.env.SMTP_USER || '';
    this.smtpPassword = process.env.SMTP_PASSWORD || '';
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@agent-monitor.com';
    this.toEmails = process.env.TO_EMAILS || '';
    
    this.enabled = !!this.smtpUser && !!this.smtpPassword && !!this.toEmails;
    this.transporter = null;
    
    if (this.enabled) {
      this.initializeTransporter();
    }
  }

  initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.smtpHost,
      port: this.smtpPort,
      secure: this.smtpSecure,
      auth: {
        user: this.smtpUser,
        pass: this.smtpPassword
      }
    });
  }

  async send(message, alertData) {
    if (!this.enabled) {
      console.log('Email notifier not configured, skipping');
      return;
    }

    try {
      const mailOptions = {
        from: this.fromEmail,
        to: this.toEmails,
        subject: message.title,
        html: this.formatEmailHtml(message, alertData),
        text: message.content
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email notification sent successfully:', info.messageId);
    } catch (error) {
      console.error('Failed to send email notification:', error.message);
      throw error;
    }
  }

  formatEmailHtml(message, alertData) {
    const severityColors = {
      high: '#ff4444',
      medium: '#ffbb33',
      low: '#33b5e5'
    };
    
    const color = severityColors[message.severity] || '#999999';
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: ${color};
            color: white;
            padding: 15px;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 0 0 5px 5px;
          }
          .button {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
          }
          pre {
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 3px;
            overflow-x: auto;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${message.title}</h2>
          </div>
          <div class="content">
            <pre>${message.content}</pre>
            <a href="${dashboardUrl}/agents/${alertData.agentId}" class="button">查看详情</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = EmailNotifier;
