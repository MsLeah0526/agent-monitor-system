/**
 * 趋势预测模块
 * 使用线性回归预测未来趋势
 */

class TrendPredictor {
  constructor() {
    this.minDataPoints = 3; // 最少需要3个数据点
  }

  /**
   * 线性回归预测
   * @param {Array} data - 历史数据 [{timestamp, value}, ...]
   * @param {number} days - 预测天数
   * @returns {Object} 预测结果
   */
  predictLinear(data, days = 7) {
    if (!data || data.length < this.minDataPoints) {
      throw new Error(`至少需要${this.minDataPoints}个数据点才能进行预测`);
    }

    // 按时间排序
    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);

    // 转换为数值数组
    const x = sortedData.map((d, i) => i);
    const y = sortedData.map(d => d.value);

    // 计算线性回归参数
    const { slope, intercept, r2 } = this.calculateLinearRegression(x, y);

    // 预测未来数据
    const predictions = [];
    const lastTimestamp = sortedData[sortedData.length - 1].timestamp;
    const avgInterval = this.calculateAverageInterval(sortedData);

    for (let i = 1; i <= days; i++) {
      const nextIndex = x.length + i - 1;
      const predictedValue = slope * nextIndex + intercept;
      const nextTimestamp = lastTimestamp + (avgInterval * i);

      predictions.push({
        timestamp: nextTimestamp,
        value: Math.max(0, Math.round(predictedValue)), // 确保非负
        confidence: this.calculateConfidence(r2, i)
      });
    }

    return {
      method: 'linear',
      slope,
      intercept,
      r2,
      predictions,
      accuracy: Math.min(100, Math.max(0, r2 * 100))
    };
  }

  /**
   * 移动平均预测
   * @param {Array} data - 历史数据
   * @param {number} days - 预测天数
   * @param {number} window - 移动窗口大小
   * @returns {Object} 预测结果
   */
  predictMovingAverage(data, days = 7, window = 3) {
    if (!data || data.length < window) {
      throw new Error(`至少需要${window}个数据点才能进行移动平均预测`);
    }

    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
    const values = sortedData.map(d => d.value);

    // 计算移动平均
    const movingAverages = [];
    for (let i = window - 1; i < values.length; i++) {
      const sum = values.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
      movingAverages.push(sum / window);
    }

    // 使用最后一个移动平均值作为预测基准
    const lastAverage = movingAverages[movingAverages.length - 1];
    const trend = movingAverages.length > 1 
      ? (movingAverages[movingAverages.length - 1] - movingAverages[movingAverages.length - 2])
      : 0;

    const predictions = [];
    const lastTimestamp = sortedData[sortedData.length - 1].timestamp;
    const avgInterval = this.calculateAverageInterval(sortedData);

    for (let i = 1; i <= days; i++) {
      const predictedValue = lastAverage + (trend * i);
      const nextTimestamp = lastTimestamp + (avgInterval * i);

      predictions.push({
        timestamp: nextTimestamp,
            value: Math.max(0, Math.round(predictedValue)),
        confidence: 
          Math.max(50, 100 - (i * 5)) // 简单的置信度衰减
      });
    }

    return {
      method: 'moving_average',
      window,
      lastAverage,
      trend,
      predictions,
      accuracy: 75 // 移动平均的准确率通常在75%左右
    };
  }

  /**
   * 预测积分趋势
   * @param {Array} scoreHistory - 积分历史记录
   * @returns {Object} 预测结果
   */
  predictScoreTrend(scoreHistory) {
    if (!scoreHistory || scoreHistory.length === 0) {
      return {
        success: false,
        message: '没有积分历史数据'
      };
    }

    try {
      // 使用线性回归预测
      const linearResult = this.predictLinear(scoreHistory, 7);

      // 计算趋势方向
      const trend = linearResult.slope > 0.5 ? 'up' : 
                   linearResult.slope < -0.5 ? 'down' : 'stable';

      // 计算预计增长率
      const currentScore = scoreHistory[scoreHistory.length - 1].value;
      const predictedScore = linearResult.predictions[6].value;
      const growthRate = ((predictedScore - currentScore) / currentScore * 100).toFixed(2);

      return {
        success: true,
        method: 'linear',
        trend,
        growthRate: parseFloat(growthRate),
        currentScore,
        predictedScore,
        predictions: linearResult.predictions,
        accuracy: linearResult.accuracy,
        r2: linearResult.r2,
        confidence: linearResult.predictions.map(p => p.confidence)
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 预测任务完成率
   * @param {Array} taskHistory - 任务历史记录
   * @returns {Object} 预测结果
   */
  predictTaskCompletionRate(taskHistory) {
    if (!taskHistory || taskHistory.length < 3) {
      return {
        success: false,
        message: '任务历史数据不足'
      };
    }

    try {
      // 计算每日完成率
      const dailyRates = this.calculateDailyCompletionRates(taskHistory);

      if (dailyRates.length < 3) {
        return {
          success: false,
          message: '有效数据不足'
        };
      }

      // 使用移动平均预测
      const maResult = this.predictMovingAverage(dailyRates, 7, 3);

      // 计算平均完成率
      const avgRate = dailyRates.reduce((sum, d) => sum + d.value, 0) / dailyRates.length;

      return {
        success: true,
        method: 'moving_average',
        currentRate: avgRate,
        predictions: maResult.predictions,
        accuracy: maResult.accuracy,
        riskLevel: this.assessCompletionRisk(avgRate)
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 异常风险预警
   * @param {Array} data - 历史数据
   * @returns {Object} 风险评估结果
   */
  assessAnomalyRisk(data) {
    if (!data || data.length < 5) {
      return {
        riskLevel: 'unknown',
        message: '数据不足'
      };
    }

    const values = data.map(d => d.value);
    const { mean, stdDev } = this.calculateStatistics(values);

    // 检查最近的数据点是否偏离均值
    const recentValues = values.slice(-3);
    const deviations = recentValues.map(v => Math.abs(v - mean) / stdDev);

    const maxDeviation = Math.max(...deviations);

    let riskLevel = 'low';
    let riskFactors = [];

    if (maxDeviation > 3) {
      riskLevel = 'high';
      riskFactors.push('检测到异常波动（超过3σ）');
    } else if (maxDeviation > 2) {
      riskLevel = 'medium';
      riskFactors.push('检测到潜在异常（超过2σ）');
    }

    // 检查趋势
    const trend = this.calculateTrend(values);
    if (trend < -0.5) {
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      riskFactors.push('呈下降趋势');
    }

    return {
      riskLevel,
      riskFactors,
      maxDeviation,
      mean,
      stdDev,
      recommendations: this.generateRiskRecommendations(riskLevel, riskFactors)
    };
  }

  /**
   * 计算线性回归参数
   * @private
   */
  calculateLinearRegression(x, y) {
    const n = x.length;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // 计算R²
    const meanY = sumY / n;
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
    const ssResidual = y.reduce((sum, yi, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);

    const r2 = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0;

    return { slope, intercept, r2 };
  }

  /**
   * 计算平均时间间隔
   * @private
   */
  calculateAverageInterval(data) {
    if (data.length < 2) return 86400000; // 默认1天

    let totalInterval = 0;
    for (let i = 1; i < data.length; i++) {
      totalInterval += data[i].timestamp - data[i - 1].timestamp;
    }

    return totalInterval / (data.length - 1);
  }

  /**
   * 计算置信度
   * @private
   */
  calculateConfidence(r2, daysAhead) {
    // R²越高，置信度越高
    // 预测天数越远，置信度越低
    const baseConfidence = r2 * 100;
    const decayFactor = Math.max(0.5, 1 - (daysAhead * 0.05));
    return Math.max(50, Math.min(95, baseConfidence * decayFactor));
  }

  /**
   * 计算每日完成率
   * @private
   */
  calculateDailyCompletionRates(taskHistory) {
    const dailyMap = new Map();

    taskHistory.forEach(task => {
      const date = new Date(task.timestamp).toDateString();
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { total: 0, completed: 0 });
      }

      const day = dailyMap.get(date);
      day.total++;
      if (task.status === 'completed' || task.status === 'success') {
        day.completed++;
      }
    });

    const dailyRates = [];
    dailyMap.forEach((value, date) => {
      dailyRates.push({
        timestamp: new Date(date).getTime(),
        value: (value.completed / value.total) * 100
      });
    });

    return dailyRates.sort((a, b) => a.timestamp - b.timestamp);
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
   * 计算趋势
   * @private
   */
  calculateTrend(values) {
    if (values.length < 2) return 0;

    const n = values.length;
    const x = values.map((_, i) => i);
    const y = values;

    const { slope } = this.calculateLinearRegression(x, y);
    return slope;
  }

  /**
   * 评估完成率风险
   * @private
   */
  assessCompletionRateRisk(avgRate) {
    if (avgRate >= 90) return 'low';
    if (avgRate >= 70) return 'medium';
    return 'high';
  }

  /**
   * 生成风险建议
   * @private
   */
  generateRiskRecommendations(riskLevel, riskFactors) {
    const recommendations = [];

    if (riskLevel === 'high') {
      recommendations.push('立即检查Agent状态');
      recommendations.push('审查最近的任务日志');
      recommendations.push('考虑重启Agent服务');
    } else if (riskLevel === 'medium') {
      recommendations.push('监控Agent性能指标');
      recommendations.push('检查资源使用情况');
    }

    if (riskFactors.includes('呈下降趋势')) {
      recommendations.push('分析积分下降原因');
      recommendations.push('评估任务质量');
    }

    return recommendations;
  }
}

export default TrendPredictor;
