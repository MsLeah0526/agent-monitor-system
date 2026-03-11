/**
 * 智能分析与预测模块
 * 统一导出所有分析功能
 */

import TrendPredictor from './trend-predictor.js';
import AnomalyDetector from './anomaly-detector.js';
import SuggestionEngine from './suggestion-engine.js';

class AnalysisEngine {
  constructor() {
    this.trendPredictor = new TrendPredictor();
    this.anomalyDetector = new AnomalyDetector();
    this.suggestionEngine = new SuggestionEngine();
  }

  /**
   * 趋势预测
   */
  async predictTrends(data) {
    const results = {};

    // 积分趋势预测
    if (data.scoreHistory) {
      results.scoreTrend = this.trendPredictor.predictScoreTrend(data.scoreHistory);
    }

    // 任务完成率预测
    if (data.taskHistory) {
      results.taskCompletionRate = this.trendPredictor.predictTaskCompletionRate(data.taskHistory);
    }

    // 异常风险预警
    if (data.scoreHistory) {
      results.anomalyRisk = this.trendPredictor.assessAnomalyRisk(data.scoreHistory);
    }

    return results;
  }

  /**
   * 异常识别
   */
  async detectAnomalies(data) {
    return this.anomalyDetector.detectAllAnomalies(data);
  }

  /**
   * 智能建议
   */
  async generateSuggestions(data) {
    return this.suggestionEngine.generateComprehensiveReport(data);
  }

  /**
   * 综合分析
   */
  async analyze(data) {
    const results = {
      timestamp: new Date().toISOString(),
      agentId: data.agentId,
      trends: null,
      anomalies: null,
      suggestions: null,
      summary: {
        totalIssues: 0,
        highPriorityIssues: 0,
        mediumPriorityIssues: 0,
        lowPriorityIssues: 0
      }
    };

    // 趋势预测
    if (data.scoreHistory || data.taskHistory) {
      results.trends = await this.predictTrends(data);
    }

    // 异常识别
    if (data.scoreHistory || data.taskHistory || data.performanceData) {
      results.anomalies = await this.detectAnomalies(data);
      
      // 统计异常
      if (results.anomalies.summary) {
        results.summary.totalIssues += results.anomalies.summary.totalAnomalies;
        results.summary.highPriorityIssues += results.anomalies.summary.highSeverityCount;
        results.summary.mediumPriorityIssues += results.anomalies.summary.mediumSeverityCount;
        results.summary.lowPriorityIssues += results.anomalies.summary.lowSeverityCount;
      }
    }

    // 智能建议
    results.suggestions = await this.generateSuggestions(data);
    
    // 统计建议
    if (results.suggestions.summary) {
      results.summary.totalIssues += results.suggestions.summary.totalSuggestions;
      results.summary.highPriorityIssues += results.suggestions.summary.highPriority;
      results.summary.mediumPriorityIssues += results.suggestions.summary.mediumPriority;
      results.summary.lowPriorityIssues += results.suggestions.summary.lowPriority;
    }

    return results;
  }
}

export {
  AnalysisEngine,
  TrendPredictor,
  AnomalyDetector,
  SuggestionEngine
};

export default AnalysisEngine;
