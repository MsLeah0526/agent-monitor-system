/**
 * AnomalyDetector 单元测试
 */

import AnomalyDetector from '../anomaly-detector.js';

describe('AnomalyDetector', () => {
  let detector;

  beforeEach(() => {
    detector = new AnomalyDetector();
  });

  describe('detectScoreAnomalies', () => {
    test('应该正确检测异常值', () => {
      const scoreHistory = [
        { timestamp: 1000, value: 100 },
        { timestamp: 2000, value: 105 },
        { timestamp: 3000, value: 102 },
        { timestamp: 4000, value: 150 }, // 异常值
        { timestamp: 5000, value: 103 }
      ];

      const result = detector.detectScoreAnomalies(scoreHistory);

      expect(result.success).toBe(true);
      expect(result.method).toBe('3_sigma');
      expect(result.anomalies.length).toBeGreaterThan(0);
      expect(result.anomalies[0].value).toBe(150);
    });

    test('应该正确处理正常数据', () => {
      const scoreHistory = [
        { timestamp: 1000, value: 100 },
        { timestamp: 2000, value: 102 },
        { timestamp: 3000, value: 101 },
        { timestamp: 4000, value: 103 },
        { timestamp: 5000, value: 102 }
      ];

      const result = detector.detectScoreAnomalies(scoreHistory);

      expect(result.success).toBe(true);
      expect(result.anomalies.length).toBe(0);
    });

    test('数据点不足时应该返回失败', () => {
      const scoreHistory = [
        { timestamp: 1000, value: 100 },
        { timestamp: 2000, value: 105 }
      ];

      const result = detector.detectScoreAnomalies(scoreHistory);

      expect(result.success).toBe(false);
    });
  });

  describe('identifyFailurePatterns', () => {
    test('应该正确识别连续失败模式', () => {
      const taskHistory = [
        { timestamp: 1000, status: 'completed' },
        { timestamp: 2000, status: 'failed' },
        { timestamp: 3000, status: 'failed' },
        { timestamp: 4000, status: 'failed' },
        { timestamp: 5000, status: 'completed' }
      ];

      const result = detector.identifyFailurePatterns(taskHistory);

      expect(result.success).toBe(true);
      expect(result.patterns.length).toBeGreaterThan(0);
      expect(result.patterns[0].type).toBe('consecutive_failures');
    });

    test('应该正确识别任务类型失败模式', () => {
      const taskHistory = [
        { timestamp: 1000, status: 'completed', type: 'typeA' },
        { timestamp: 2000, status: 'failed', type: 'typeB' },
        { timestamp: 3000, status: 'failed', type: 'typeB' },
        { timestamp: 4000, status: 'failed', type: 'typeB' },
        { timestamp: 5000, status: 'completed', type: 'typeA' }
      ];

      const result = detector.identifyFailurePatterns(taskHistory);

      expect(result.success).toBe(true);
      const typePattern = result.patterns.find(p => p.type === 'task_type_failure');
      expect(typePattern).toBeDefined();
    });

    test('没有失败任务时应该返回成功', () => {
      const taskHistory = [
        { timestamp: 1000, status: 'completed' },
        { timestamp: 2000, status: 'completed' },
        { timestamp: 3000, status: 'completed' }
      ];

      const result = detector.identifyFailurePatterns(taskHistory);

      expect(result.success).toBe(true);
      expect(result.failureRate).toBe(0);
    });
  });

  describe('analyzePerformanceBottlenecks', () => {
    test('应该正确识别CPU瓶颈', () => {
      const performanceData = [
        { timestamp: 1000, cpu_usage: 85 },
        { timestamp: 2000, cpu_usage: 90 },
        { timestamp: 3000, cpu_usage: 88 }
      ];

      const result = detector.analyzePerformanceBottlenecks(performanceData);

      expect(result.success).toBe(true);
      expect(result.bottlenecks.length).toBeGreaterThan(0);
      expect(result.bottlenecks[0].metric).toBe('cpu_usage');
    });

    test('应该正确识别内存瓶颈', () => {
      const performanceData = [
        { timestamp: 1000, memory_usage: 90 },
        { timestamp: 2000, memory_usage: 92 },
        { timestamp: 3000, memory_usage: 88 }
      ];

      const result = detector.analyzePerformanceBottlenecks(performanceData);

      expect(result.success).toBe(true);
      const memBottleneck = result.bottlenecks.find(b => b.metric === 'memory_usage');
      expect(memBottleneck).toBeDefined();
    });

    test('应该正确识别响应时间瓶颈', () => {
      const performanceData = [
        { timestamp: 1000, response_time: 6000 },
        { timestamp: 2000, response_time: 5500 },
        { timestamp: 3000, response_time: 5800 }
      ];

      const result = detector.analyzePerformanceBottlenecks(performanceData);

      expect(result.success).toBe(true);
      const rtBottleneck = result.bottlenecks.find(b => b.metric === 'response_time');
      expect(rtBottleneck).toBeDefined();
    });

    test('没有性能数据时应该返回失败', () => {
      const result = detector.analyzePerformanceBottlenecks([]);

      expect(result.success).toBe(false);
    });
  });

  describe('detectAllAnomalies', () => {
    test('应该综合检测所有异常', () => {
      const data = {
        scoreHistory: [
          { timestamp: 1000, value: 100 },
          { timestamp: 2000, value: 105 },
          { timestamp: 3000, value: 102 },
          { timestamp: 4000, value: 150 },
          { timestamp: 5000, value: 103 }
        ],
        taskHistory: [
          { timestamp: 1000, status: 'completed' },
          { timestamp: 2000, status: 'failed' },
          { timestamp: 3000, status: 'failed' },
          { timestamp: 4000, status: 'failed' }
        ],
        performanceData: [
          { timestamp: 1000, cpu_usage: 85 },
          { timestamp: 2000, cpu_usage: 90 }
        ]
      };

      const result = detector.detectAllAnomalies(data);

      expect(result.scoreAnomalies).toBeDefined();
      expect(result.failurePatterns).toBeDefined();
      expect(result.performanceBottlenecks).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.totalAnomalies).toBeGreaterThan(0);
    });
  });
});
