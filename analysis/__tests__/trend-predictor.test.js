/**
 * TrendPredictor 单元测试
 */

import TrendPredictor from '../trend-predictor.js';

describe('TrendPredictor', () => {
  let predictor;

  beforeEach(() => {
    predictor = new TrendPredictor();
  });

  describe('predictLinear', () => {
    test('应该正确预测线性增长趋势', () => {
      const data = [
        { timestamp: 1000, value: 100 },
        { timestamp: 2000, value: 110 },
        { timestamp: 3000, value: 120 },
        { timestamp: 4000, value: 130 },
        { timestamp: 5000, value: 140 }
      ];

      const result = predictor.predictLinear(data, 7);

      expect(result.method).toBe('linear');
      expect(result.predictions).toHaveLength(7);
      expect(result.predictions[0].value).toBeGreaterThan(140);
      expect(result.accuracy).toBeGreaterThan(80);
    });

    test('应该正确预测线性下降趋势', () => {
      const data = [
        { timestamp: 1000, value: 140 },
        { timestamp: 2000, value: 130 },
        { timestamp: 3000, value: 120 },
        { timestamp: 4000, value: 110 },
        { timestamp: 5000, value: 100 }
      ];

      const result = predictor.predictLinear(data, 7);

      expect(result.method).toBe('linear');
      expect(result.slope).toBeLessThan(0);
      expect(result.predictions[0].value).toBeLessThan(100);
    });

    test('数据点不足时应该抛出错误', () => {
      const data = [
        { timestamp: 1000, value: 100 },
        { timestamp: 2000, value: 110 }
      ];

      expect(() => predictor.predictLinear(data, 7)).toThrow();
    });
  });

  describe('predictMovingAverage', () => {
    test('应该正确计算移动平均预测', () => {
      const data = [
        { timestamp: 1000, value: 100 },
        { timestamp: 2000, value: 110 },
        { timestamp: 3000, value: 105 },
        { timestamp: 4000, value: 115 },
        { timestamp: 5000, value: 110 }
      ];

      const result = predictor.predictMovingAverage(data, 7, 3);

      expect(result.method).toBe('moving_average');
      expect(result.predictions).toHaveLength(7);
      expect(result.accuracy).toBe(75);
    });

    test('应该正确计算趋势', () => {
      const data = [
        { timestamp: 1000, value: 100 },
        { timestamp: 2000, value: 110 },
        { timestamp: 3000, value: 120 }
      ];

      const result = predictor.predictMovingAverage(data, 7, 3);

      expect(result.trend).toBeGreaterThan(0);
    });
  });

  describe('predictScoreTrend', () => {
    test('应该正确预测积分趋势', () => {
      const scoreHistory = [
        { timestamp: 1000, value: 100 },
        { timestamp: 2000, value: 110 },
        { timestamp: 3000, value: 120 },
        { timestamp: 4000, value: 130 },
        { timestamp: 5000, value: 140 }
      ];

      const result = predictor.predictScoreTrend(scoreHistory);

      expect(result.success).toBe(true);
      expect(result.trend).toBe('up');
      expect(result.currentScore).toBe(140);
      expect(result.predictedScore).toBeGreaterThan(140);
      expect(result.accuracy).toBeGreaterThan(80);
    });

    test('没有数据时应该返回失败', () => {
      const result = predictor.predictScoreTrend([]);

      expect(result.success).toBe(false);
      expect(result.message).toBe('没有积分历史数据');
    });
  });

  describe('predictTaskCompletionRate', () => {
    test('应该正确预测任务完成率', () => {
      const taskHistory = [
        { timestamp: 1000, status: 'completed' },
        { timestamp: 1000, status: 'completed' },
        { timestamp: 1000, status: 'failed' },
        { timestamp: 2000, status: 'completed' },
        { timestamp: 2000, status: 'completed' },
        { timestamp: 2000, status: 'completed' }
      ];

      const result = predictor.predictTaskCompletionRate(taskHistory);

      expect(result.success).toBe(true);
      expect(result.currentRate).toBeGreaterThan(0);
      expect(result.predictions).toHaveLength(7);
    });

    test('数据不足时应该返回失败', () => {
      const taskHistory = [
        { timestamp: 1000, status: 'completed' }
      ];

      const result = predictor.predictTaskCompletionRate(taskHistory);

      expect(result.success).toBe(false);
    });
  });

  describe('assessAnomalyRisk', () => {
    test('应该正确评估高风险', () => {
      const data = [
        { timestamp: 1000, value: 100 },
        { timestamp: 2000, value: 105 },
        { timestamp: 3000, value: 102 },
        { timestamp: 4000, value: 150 }, // 异常值
        { timestamp: 5000, value: 103 }
      ];

      const result = predictor.assessAnomalyRisk(data);

      expect(result.riskLevel).toBe('high');
      expect(result.riskFactors.length).toBeGreaterThan(0);
    });

    test('应该正确评估低风险', () => {
      const data = [
        { timestamp: 1000, value: 100 },
        { timestamp: 2000, value: 102 },
        { timestamp: 3000, value: 101 },
        { timestamp: 4000, value: 103 },
        { timestamp: 5000, value: 102 }
      ];

      const result = predictor.assessAnomalyRisk(data);

      expect(result.riskLevel).toBe('low');
    });
  });
});
