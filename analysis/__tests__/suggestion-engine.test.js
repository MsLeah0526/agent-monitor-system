/**
 * SuggestionEngine 单元测试
 */

import SuggestionEngine from '../suggestion-engine.js';

describe('SuggestionEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new SuggestionEngine();
  });

  describe('generatePersonalizedSuggestions', () => {
    test('应该生成积分下降建议', () => {
      const agentData = {
        scoreHistory: [
          { timestamp: 1000, value: 140 },
          { timestamp: 2000, value: 130 },
          { timestamp: 3000, value: 120 },
          { timestamp: 4000, value: 110 },
          { timestamp: 5000, value: 100 }
        ]
      };

      const suggestions = engine.generatePersonalizedSuggestions(agentData);

      expect(suggestions.length).toBeGreaterThan(0);
      const scoreSuggestion = suggestions.find(s => s.category === 'score');
      expect(scoreSuggestion).toBeDefined();
      expect(scoreSuggestion.priority).toBe('high');
    });

    test('应该生成任务完成率建议', () => {
      const agentData = {
        taskHistory: [
          { timestamp: 1000, status: 'completed' },
          { timestamp: 2000, status: 'failed' },
          { timestamp: 3000, status: 'failed' },
          { timestamp: 4000, status: 'failed' }
        ]
      };

      const suggestions = engine.generatePersonalizedSuggestions(agentData);

      expect(suggestions.length).toBeGreaterThan(0);
      const taskSuggestion = suggestions.find(s => s.category === 'task');
      expect(taskSuggestion).toBeDefined();
    });

    test('应该生成性能建议', () => {
      const agentData = {
        performanceData: [
          { timestamp: 1000, cpu_usage: 85 },
          { timestamp: 2000, cpu_usage: 90 }
        ]
      };

      const suggestions = engine.generatePersonalizedSuggestions(agentData);

      expect(suggestions.length).toBeGreaterThan(0);
      const perfSuggestion = suggestions.find(s => s.category === 'performance');
      expect(perfSuggestion).toBeDefined();
    });

    test('应该生成状态建议', () => {
      const agentData = {
        status: 'offline'
      };

      const suggestions = engine.generatePersonalizedSuggestions(agentData);

      expect(suggestions.length).toBeGreaterThan(0);
      const statusSuggestion = suggestions.find(s => s.category === 'status');
      expect(statusSuggestion).toBeDefined();
      expect(statusSuggestion.priority).toBe('high');
    });
  });

  describe('generateBestPractices', () => {
    test('应该生成通用最佳实践', () => {
      const practices = engine.generateBestPractices('unknown');

      expect(practices.length).toBeGreaterThan(0);
      expect(practices.every(p => p.category === 'best_practice')).toBe(true);
    });

    test('应该生成dev-agent特定最佳实践', () => {
      const practices = engine.generateBestPractices('dev-agent');

      expect(practices.length).toBeGreaterThan(3); // 通用 + 特定
      const codeQuality = practices.find(p => p.title.includes('代码质量'));
      expect(codeQuality).toBeDefined();
    });

    test('应该生成test-agent特定最佳实践', () => {
      const practices = engine.generateBestPractices('test-agent');

      expect(practices.length).toBeGreaterThan(3);
      const testCase = practices.find(p => p.title.includes('测试用例'));
      expect(testCase).toBeDefined();
    });
  });

  describe('generateResourceOptimizations', () => {
    test('应该生成CPU优化建议', () => {
      const resourceData = {
        cpu_usage: [85, 90, 88]
      };

      const optimizations = engine.generateResourceOptimizations(resourceData);

      expect(optimizations.length).toBeGreaterThan(0);
      const cpuOpt = optimizations.find(o => o.title.includes('CPU'));
      expect(cpuOpt).toBeDefined();
      expect(cpuOpt.priority).toBe('high');
    });

    test('应该生成内存优化建议', () => {
      const resourceData = {
        memory_usage: [90, 92, 88]
      };

      const optimizations = engine.generateResourceOptimizations(resourceData);

      expect(optimizations.length).toBeGreaterThan(0);
      const memOpt = optimizations.find(o => o.title.includes('内存'));
      expect(memOpt).toBeDefined();
    });

    test('应该生成磁盘优化建议', () => {
      const resourceData = {
        disk_usage: [85, 88, 82]
      };

      const optimizations = engine.generateResourceOptimizations(resourceData);

      expect(optimizations.length).toBeGreaterThan(0);
      const diskOpt = optimizations.find(o => o.title.includes('磁盘'));
      expect(diskOpt).toBeDefined();
    });
  });

  describe('generateRuleBasedSuggestions', () => {
    test('应该基于规则生成建议', () => {
      const context = {
        currentScore: 50,
        failureRate: 40,
        status: 'offline'
      };

      const suggestions = engine.generateRuleBasedSuggestions(context);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.every(s => s.category === 'rule_based')).toBe(true);
    });

    test('应该匹配低积分规则', () => {
      const context = {
        currentScore: 50
      };

      const suggestions = engine.generateRuleBasedSuggestions(context);

      const lowScoreSuggestion = suggestions.find(s => s.title.includes('积分过低'));
      expect(lowScoreSuggestion).toBeDefined();
    });

    test('应该匹配高失败率规则', () => {
      const context = {
        failureRate: 40
      };

      const suggestions = engine.generateRuleBasedSuggestions(context);

      const highFailureSuggestion = suggestions.find(s => s.title.includes('高失败率'));
      expect(highFailureSuggestion).toBeDefined();
    });
  });

  describe('generateComprehensiveReport', () => {
    test('应该生成综合报告', () => {
      const fullData = {
        agentId: 'test-agent',
        agentType: 'dev-agent',
        scoreHistory: [
          { timestamp: 1000, value: 140 },
          { timestamp: 2000, value: 130 },
          { timestamp: 3000, value: 120 }
        ],
        taskHistory: [
          { timestamp: 1000, status: 'completed' },
          { timestamp: 2000, status: 'failed' }
        ],
        performanceData: [
          { timestamp: 1000, cpu_usage: 85 }
        ],
        resourceData: {
          cpu_usage: [85, 90]
        }
      };

      const report = engine.generateComprehensiveReport(fullData);

      expect(report.agentId).toBe('test-agent');
      expect(report.timestamp).toBeDefined();
      expect(report.categories.personalized).toBeDefined();
      expect(report.categories.bestPractices).toBeDefined();
      expect(report.categories.resourceOptimizations).toBeDefined();
      expect(report.categories.ruleBased).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.summary.totalSuggestions).toBeGreaterThan(0);
    });
  });
});
