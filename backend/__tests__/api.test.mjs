import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

const API_BASE = 'http://localhost:3001';
const TEST_TIMEOUT = 10000; // 10秒超时

describe('API Tests', () => {
  let authToken = '';

  beforeAll(async () => {
    // 测试健康检查
    const healthResponse = await axios.get(`${API_BASE}/health`);
    expect(healthResponse.data.success).toBe(true);
  }, TEST_TIMEOUT);

  afterAll(async () => {
    // 清理工作
  });

  describe('健康检查', () => {
    it('应该返回健康状态', async () => {
      const response = await axios.get(`${API_BASE}/health`);
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('Agent Monitor API is running');
    }, TEST_TIMEOUT);
  });

  describe('认证API', () => {
    it('应该能够登录', async () => {
      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        username: 'admin',
        password: 'admin123'
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.token).toBeDefined();
      expect(response.data.data.user).toBeDefined();
      
      authToken = response.data.data.token;
    }, TEST_TIMEOUT);

    it('错误的密码应该登录失败', async () => {
      try {
        await axios.post(`${API_BASE}/api/auth/login`, {
          username: 'admin',
          password: 'wrongpassword'
        });
        expect(true).toBe(false); // 不应该到达这里
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.success).toBe(false);
      }
    }, TEST_TIMEOUT);
  });

  describe('团队概览API', () => {
    it('应该返回团队概览数据', async () => {
      const response = await axios.get(`${API_BASE}/api/team/overview`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeDefined();
      expect(response.data.data.totalAgents).toBeDefined();
      expect(response.data.data.onlineAgents).toBeDefined();
      expect(response.data.data.totalScore).toBeDefined();
    }, TEST_TIMEOUT);
  });

  describe('告警API', () => {
    it('应该返回告警列表', async () => {
      const response = await axios.get(`${API_BASE}/api/alerts`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    }, TEST_TIMEOUT);

    it('应该能够创建告警', async () => {
      const response = await axios.post(`${API_BASE}/api/alerts`, {
        agentId: 'test-agent',
        type: 'test_alert',
        severity: 'low',
        message: 'Test alert message'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.id).toBeDefined();
    }, TEST_TIMEOUT);

    it('应该能够更新告警状态', async () => {
      // 首先创建一个告警
      const createResponse = await axios.post(`${API_BASE}/api/alerts`, {
        agentId: 'test-agent-2',
        type: 'test_alert_2',
        severity: 'medium',
        message: 'Test alert message 2'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      const alertId = createResponse.data.data.id;

      // 更新状态
      const updateResponse = await axios.put(
        `${API_BASE}/api/alerts/${alertId}/status`,
        { status: 'acknowledged', comment: 'Test comment' },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.success).toBe(true);
      expect(updateResponse.data.data.status).toBe('acknowledged');
    }, TEST_TIMEOUT);
  });

  describe('报表API', () => {
    it('应该返回报表数据', async () => {
      const response = await axios.get(`${API_BASE}/api/reports?timeRange=24h`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeDefined();
      expect(response.data.data.tasks).toBeDefined();
      expect(response.data.data.invocations).toBeDefined();
    }, TEST_TIMEOUT);

    it('应该能够导出CSV报表', async () => {
      const response = await axios.get(`${API_BASE}/api/reports/export?format=csv&timeRange=24h`, {
        headers: { Authorization: `Bearer ${authToken}` },
        responseType: 'text'
      });
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.data).toContain('Report Data');
    }, TEST_TIMEOUT);

    it('应该能够导出JSON报表', async () => {
      const response = await axios.get(`${API_BASE}/api/reports/export?format=json&timeRange=24h`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.data.timeRange).toBeDefined();
    }, TEST_TIMEOUT);
  });

  describe('Agents API', () => {
    it('应该返回Agent列表', async () => {
      const response = await axios.get(`${API_BASE}/api/agents`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    }, TEST_TIMEOUT);
  });
});
