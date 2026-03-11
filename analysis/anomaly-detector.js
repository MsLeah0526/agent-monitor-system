/**
 * 异常检测模块
 * 使用统计方法检测异常波动和模式
 */

class AnomalyDetector {
  constructor() {
    this.sigmaThreshold = 3; // 3σ原则
    this.minDataPoints = 5; // 最少需要5个数据点
  }

  /**
   * 检测积分异常波动
   * @param {Array} scoreHistory - 积分历史记录
   * @returns {Object} 检测结果
   */
  detectScoreAnomalies(scoreHistory) {
    if (!scoreHistory || scoreHistory.length < this.minDataPoints) {
      return {
        success: false,
        message: `至少需要${this.minDataPoints}个数据点才能检测异常`,
        anomalies: []
      };
    }

    const values = scoreHistory.map(d => d.value);
    const { mean, stdDev } = this.calculateStatistics(values);

    const anomalies = [];
    const threshold = this.sigmaThreshold * stdDev;

    scoreHistory.forEach((point, index) => {
      const deviation = Math.abs(point.value - mean);
      
      if (deviation > threshold) {
        anomalies.push({
          timestamp: point.timestamp,
          value: point.value,
          expected: mean,
          deviation: deviation,
          sigmaLevel: deviation / stdDev,
          type: deviation > 0 ? 'positive' : 'negative',
          severity: this.calculateSeverity(deviation / stdDev)
        });
      }
    });

    return {
      success: true,
      method: '3_sigma',
      mean,
      stdDev,
      threshold,
      anomalies,
      anomalyCount: anomalies.length,
      anomalyRate: (anomalies.length / scoreHistory.length * 100).toFixed(2)
    };
  }

  /**
   * 识别任务失败模式
   * @param {Array} taskHistory - 任务历史记录
   * @returns {Object} 识别结果
   */
  identifyFailurePatterns(taskHistory) {
    if (!taskHistory || taskHistory.length === 0) {
      return {
        success: false,
        message: '没有任务历史数据',
        patterns: []
      };
    }

    // 提取失败的任务
    const failedTasks = taskHistory.filter(t => 
      t.status === 'failed' || t.status === 'error'
    );

    if (failedTasks.length === 0) {
      return {
        success: true,
        message: '没有检测到失败任务',
        patterns: [],
        failureRate: 0
      };
    }

    const patterns = [];

    // 模式1: 连续失败
    const consecutiveFailures = this.detectConsecutiveFailures(taskHistory);
    if (consecutiveFailures.length > 0) {
      patterns.push({
        type: 'consecutive_failures',
        description: '连续失败任务',
        occurrences: consecutiveFailures.length,
        details: consecutiveFailures,
        severity: 'high',
        recommendation: '检查Agent健康状态，考虑重启服务'
      });
    }

    // 模式2: 特定任务类型失败
    const taskTypeFailures = this.analyzeTaskTypeFailures(failedTasks);
    if (taskTypeFailures.length > 0) {
      patterns.push({
        type: 'task_type_failure',
        description: '特定任务类型频繁失败',
        occurrences: taskTypeFailures.length,
        details: taskTypeFailures,
        severity: 'medium',
        recommendation: '检查任务配置和依赖项'
      });
    }

    // 模式3: 时间模式失败
    const timePatternFailures = this.analyzeTimePatternFailures(failedTasks);
    if (timePatternFailures.length > 0) {
      patterns.push({
        type: 'time_pattern_failure',
        description: '特定时间段失败',
        occurrences: timePatternFailures.length,
        details: timePatternFailures,
        severity: 'medium',
        recommendation: '检查系统负载和资源使用情况'
      });
    }

    // 模式4: 错误代码模式
    const errorCodePatterns = this.analyzeErrorCodePatterns(failedTasks);
    if (errorCodePatterns.length > 0) {
      patterns.push({
        type: 'error_code_pattern',
        description: '特定错误代码重复出现',
        occurrences: errorCodePatterns.length,
        details: errorCodePatterns,
        severity: 'high',
        recommendation: '分析错误日志，修复根本原因'
      });
    }

    const failureRate = (failedTasks.length / taskHistory.length * 100).toFixed(2);

    return {
      success: true,
      failureRate: parseFloat(failureRate),
      failedTaskCount: failedTasks.length,
      totalTaskCount: taskHistory.length,
      patterns,
      overallSeverity: this.calculateOverallSeverity(patterns)
    };
  }

  /**
   * 分析性能瓶颈
   * @param {Array} performanceData - 性能数据
   * @returns {Object} 分析结果
   */
  analyzePerformanceBottlenecks(performanceData) {
    if (!performanceData || performanceData.length === 0) {
      return {
        success: false,
        message: '没有性能数据',
        bottlenecks: []
      };
    }

    const bottlenecks = [];

    // 分析CPU使用率
    const cpuAnalysis = this.analyzeMetric(performanceData, 'cpu_usage', 80);
    if (cpuAnalysis.hasIssue) {
      bottlenecks.push({
        metric: 'cpu_usage',
        description: 'CPU使用率过高',
        avgValue: cpuAnalysis.avgValue,
        maxValue: cpuAnalysis.maxValue,
        threshold: 80,
        severity: 'high',
        recommendation: '优化计算密集型任务，考虑负载均衡'
      });
    }

    // 分析内存使用率
    const memoryAnalysis = this.analyzeMetric(performanceData, 'memory_usage', 85);
    if (memoryAnalysis.hasIssue) {
      bottlenecks.push({
        metric: 'memory_usage',
        description: '内存使用率过高',
        avgValue: memoryAnalysis.avgValue,
        maxValue: memoryAnalysis.maxValue,
        threshold: 85,
        severity: 'high',
        recommendation: '检查内存泄漏，优化数据结构'
      });
    }

    // 分析响应时间
    const responseTimeAnalysis = this.analyzeMetric(performanceData, 'response_time', 5000);
    if (responseTimeAnalysis.hasIssue) {
      bottlenecks.push({
        metric: 'response_time',
        description: '响应时间过长',
        avgValue: responseTimeAnalysis.avgValue,
        maxValue: responseTimeAnalysis.maxValue,
        threshold: 5000,
        severity: 'medium',
        recommendation: '优化查询和算法，添加缓存'
      });
    }

    // 分析任务队列长度
    const queueAnalysis = this.analyzeMetric(performanceData, 'queue_length', 100);
    if (queueAnalysis.hasIssue) {
      bottlenecks.push({
        metric: 'queue_length',
        description: '任务队列积压',
        avgValue: queueAnalysis.avgValue,
        maxValue: queueAnalysis.maxValue,
        threshold: 100,
        severity: 'medium',
        recommendation: '增加并发处理能力，优化任务调度'
      });
    }

    return {
      success: true,
      bottlenecks,
      overallHealth: bottlenecks.length === 0 ? 'good' : 
                     bottlenecks.some(b => b.severity === 'high') ? 'poor' : 'degraded'
    };
  }

  /**
   * 综合异常检测
   * @param {Object} data - 包含各种数据的对象
   * @returns {Object} 综合检测结果
   */
  detectAllAnomalies(data) {
    const results = {
      scoreAnomalies: null,
      failurePatterns: null,
      performanceBottlenecks: null,
      summary: {
        totalAnomalies: 0,
        highSeverityCount: 0,
        mediumSeverityCount: 0,
        lowSeverityCount: 0,
        overallRisk: 'low'
      }
    };

    // 检测积分异常
    if (data.scoreHistory) {
      results.scoreAnomalies = this.detectScoreAnomalies(data.scoreHistory);
      if (results.scoreAnomalies.success) {
        results.summary.totalAnomalies += results.scoreAnomalies.anomalies.length;
        results.scoreAnomalies.anomalies.forEach(a => {
          if (a.severity === 'high') results.summary.highSeverityCount++;
          else if (a.severity === 'medium') results.summary.mediumSeverityCount++;
          else results.summary.lowSeverityCount++;
        });
      }
    }

    // 识别失败模式
    if (data.taskHistory) {
      results.failurePatterns = this.identifyFailurePatterns(data.taskHistory);
      if (results.failurePatterns.success) {
        results.failurePatterns.patterns.forEach(p => {
          results.summary.totalAnomalies += p.occurrences;
          if (p.severity === 'high') results.summary.highSeverityCount++;
          else if (p.severity === 'medium') results.summary.mediumSeverityCount++;
          else results.summary.lowSeverityCount++;
        });
      }
    }

    // 分析性能瓶颈
    if (data.performanceData) {
      results.performanceBottlenecks = this.analyzePerformanceBottlenecks(data.performanceData);
      if (results.performanceBottlenecks.success) {
        results.performanceBottlenecks.bottlenecks.forEach(b => {
          results.summary.totalAnomalies++;
          if (b.severity === 'high') results.summary.highSeverityCount++;
          else if (b.severity === 'medium') results.summary.mediumSeverityCount++;
          else results.summary.lowSeverityCount++;
        });
      }
    }

    // 计算总体风险
    if (results.summary.highSeverityCount > 0) {
      results.summary.overallRisk = 'high';
    } else if (results.summary.mediumSeverityCount > 2) {
      results.summary.overallRisk = 'medium';
    }

    return results;
  }

  /**
   * 计算统计量
   * @private
   */
  calculateStatistics(values) {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev };
  }

  /**
   * 计算严重程度
   * @private
   */
  calculateSeverity(sigmaLevel) {
    if (sigmaLevel >= 4) return 'high';
    if (sigmaLevel >= 3) return 'medium';
    return 'low';
  }

  /**
   * 检测连续失败
   * @private
   */
  detectConsecutiveFailures(taskHistory) {
    const consecutiveFailures = [];
    let currentStreak = 0;
    let streakStart = null;

    taskHistory.forEach((task, index) => {
      const isFailed = task.status === 'failed' || task.status === 'error';
      
      if (isFailed) {
        if (currentStreak === 0) {
          streakStart = index;
        }
        currentStreak++;
      } else {
        if (currentStreak >= 3) {
          consecutiveFailures.push({
            startIndex: streakStart,
            endIndex: index - 1,
            length: currentStreak,
            tasks: taskHistory.slice(streakStart, index)
          });
        }
        currentStreak = 0;
        streakStart = null;
      }
    });

    // 检查最后的连续失败
    if (currentStreak >= 3) {
      consecutiveFailures.push({
        startIndex: streakStart,
        endIndex: taskHistory.length - 1,
        length: currentStreak,
        tasks: taskHistory.slice(streakStart)
      });
    }

    return consecutiveFailures;
  }

  /**
   * 分析任务类型失败
   * @private
   */
  analyzeTaskTypeFailures(failedTasks) {
    const typeMap = new Map();

    failedTasks.forEach(task => {
      const type = task.type || task.taskType || 'unknown';
      if (!typeMap.has(type)) {
        typeMap.set(type, 0);
      }
      typeMap.set(type, typeMap.get(type) + 1);
    });

    const patterns = [];
    typeMap.forEach((count, type) => {
      if (count >= 3) {
        patterns.push({
          taskType: type,
          failureCount: count
        });
      }
    });

    return patterns;
  }

  /**
   * 分析时间模式失败
   * @private
   */
  analyzeTimePatternFailures(failedTasks) {
    const hourMap = new Map();

    failedTasks.forEach(task => {
      const hour = new Date(task.timestamp).getHours();
      if (!hourMap.has(hour)) {
        hourMap.set(hour, 0);
      }
      hourMap.set(hour, hourMap.get(hour) + 1);
    });

    const patterns = [];
    hourMap.forEach((count, hour) => {
      if (count >= 3) {
        patterns.push({
          hour,
          failureCount: count,
          timeRange: `${hour}:00-${hour}:59`
        });
      }
    });

    return patterns;
  }

  /**
   * 分析错误代码模式
   * @private
   */
  analyzeErrorCodePatterns(failedTasks) {
    const errorCodeMap = new Map();

    failedTasks.forEach(task => {
      const errorCode = task.errorCode || task.error?.code || task.errorMessage || 'unknown';
      if (!errorCodeMap.has(errorCode)) {
        errorCodeMap.set(errorCode, 0);
      }
      errorCodeMap.set(errorCode, errorCodeMap.get(errorCode) + 1);
    });

    const patterns = [];
    errorCodeMap.forEach((count, errorCode) => {
      if (count >= 3) {
        patterns.push({
          errorCode,
          failureCount: count
        });
      }
    });

    return patterns;
  }

  /**
   * 分析指标
   * @private
   */
  analyzeMetric(data, metricName, threshold) {
    const values = data
      .filter(d => d[metricName] !== undefined && d[metricName] !== null)
      .map(d => d[metricName]);

    if (values.length === 0) {
      return { hasIssue: false };
    }

    const sum = values.reduce((a, b) => a + b, 0);
    const avgValue = sum / values.length;
    const maxValue = Math.max(...values);

    return {
      hasIssue: avgValue > threshold || maxValue > threshold * 1.2,
      avgValue: avgValue.toFixed(2),
      maxValue: maxValue.toFixed(2),
      threshold
    };
  }

  /**
   * 计算总体严重程度
   * @private
   */
  calculateOverallSeverity(patterns) {
    if (patterns.some(p => p.severity === 'high')) {
      return 'high';
    }
    if (patterns.some(p => p.severity === 'medium')) {
      return 'medium';
    }
    return 'low';
  }
}

export default AnomalyDetector;
