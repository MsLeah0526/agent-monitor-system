/**
 * 智能建议引擎
 * 基于规则和数据生成个性化建议
 */

class SuggestionEngine {
  constructor() {
    this.rules = this.initializeRules();
  }

  /**
   * 生成个性化建议
   * @param {Object} agentData - Agent数据
   * @returns {Array} 建议列表
   */
  generatePersonalizedSuggestions(agentData) {
    const suggestions = [];

    // 分析积分趋势
    if (agentData.scoreHistory && agentData.scoreHistory.length > 0) {
      const scoreSuggestions = this.analyzeScoreTrend(agentData.scoreHistory);
      suggestions.push(...scoreSuggestions);
    }

    // 分析任务完成情况
    if (agentData.taskHistory && agentData.taskHistory.length > 0) {
      const taskSuggestions = this.analyzeTaskPerformance(agentData.taskHistory);
      suggestions.push(...taskSuggestions);
    }

    // 分析性能指标
    if (agentData.performanceData && agentData.performanceData.length > 0) {
      const perfSuggestions = this.analyzePerformance(agentData.performanceData);
      suggestions.push(...perfSuggestions);
    }

    // 分析Agent状态
    if (agentData.status) {
      const statusSuggestions = this.analyzeAgentStatus与其他(agentData);
      suggestions.push(...statusSuggestions);
    }

    // 去重并排序
    const uniqueSuggestions = this.deduplicateSuggestions(suggestions);
    return this.prioritizeSuggestions(uniqueSuggestions);
  }

  /**
   * 生成最佳实践推荐
   * @param {string} agentType - Agent类型
   * @returns {Array} 最佳实践列表
   */
  generateBestPractices(agentType) {
    const practices = this.getBestPracticesByType(agentType);
    
    return practices.map(p => ({
      category: 'best_practice',
      title: p.title,
      description: p.description,
      priority: p.priority || 'medium',
      applicable: true,
      metrics: p.metrics || []
    }));
  }

  /**
   * 生成资源优化建议
   * @param {Object} resourceData - 资源使用数据
   * @returns {Array} 优化建议列表
   */
  generateResourceOptimizations(resourceData) {
    const optimizations = [];

    // CPU优化
    if (resourceData.cpu_usage) {
      const cpuOpt = this.optimizeCPU(resourceData.cpu_usage);
      if (cpuOpt) optimizations.push(cpuOpt);
    }

    // 内存优化
    if (resourceData.memory_usage) {
      const memOpt = this.optimizeMemory(resourceData.memory_usage);
      if (memOpt) optimizations.push(memOpt);
    }

    // 磁盘优化
    if (resourceData.disk_usage) {
      const diskOpt = this.optimizeDisk(resourceData.disk_usage);
      if (diskOpt) optimizations.push(diskOpt);
    }

    // 网络优化
    if (resourceData.network_usage) {
      const netOpt = this.optimizeNetwork(resourceData.network_usage);
      if (netOpt) optimizations.push(netOpt);
    }

    return optimizations;
  }

  /**
   * 基于规则生成建议
   * @param {Object} context - 上下文数据
   * @returns {Array} 建议列表
   */
  generateRuleBasedSuggestions(context) {
    const suggestions = [];

    this.rules.forEach(rule => {
      if (this.evaluateRule(rule, context)) {
        suggestions.push({
          category: 'rule_based',
          title: rule.title,
          description: rule.description,
          priority: rule.priority,
          applicable: true,
          ruleId: rule.id,
          actions: rule.actions || []
        });
      }
    });

    return suggestions;
  }

  /**
   * 生成综合建议报告
   * @param {Object} fullData - 完整数据
   * @returns {Object} 综合报告
   */
  generateComprehensiveReport(fullData) {
    const report = {
      timestamp: new Date().toISOString(),
      agentId: fullData.agentId,
      summary: {
        totalSuggestions: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0
      },
      categories: {
        personalized: [],
        bestPractices: [],
        resourceOptimizations: [],
        ruleBased: []
      }
    };

    // 个性化建议
    report.categories.personalized = this.generatePersonalizedSuggestions(fullData);

    // 最佳实践
    if (fullData.agentTypeType) {
      report.categories.bestPractices = this.generateBestPractices(fullData.agentType);
    }

    // 资源优化
    if (fullData.resourceData) {
      report.categories.resourceOptimizations = this.generateResourceOptimizations(fullData.resourceData);
    }

    // 基于规则的建议
    report.categories.ruleBased = this.generateRuleBasedSuggestions(fullData);

    // 统计
    Object.values(report.categories).forEach(category => {
      report.summary.totalSuggestions += category.length;
      category.forEach(s => {
        if (s.priority === 'high') report.summary.highPriority++;
        else if (s.priority === 'medium') report.summary.mediumPriority++;
        else report.summary.lowPriority++;
      });
    });

    return report;
  }

  /**
   * 分析积分趋势
   * @private
   */
  analyzeScoreTrend(scoreHistory) {
    const suggestions = [];
    const values = scoreHistory.map(d => d.value);
    
    if (values.length < 3) return suggestions;

    // 计算趋势
    const recent = values.slice(-5);
    const trend = this.calculateTrend(recent);
    const currentScore = values[values.length - 1];

    if (trend < -2) {
      suggestions.push({
        category: 'score',
        title: '积分呈下降趋势',
        description: `最近积分平均下降${Math.abs(trend).toFixed(1)}分，建议检查任务质量和完成情况`,
        priority: 'high',
        applicable: true,
        metrics: ['score_trend', 'task_completion_rate']
      });
    } else if (trend > 2) {
      suggestions.push({
        category: 'score',
        title: '积分增长良好',
        description: `最近积分平均增长${trend.toFixed(1)}分，保持当前工作模式`,
        priority: 'low',
        applicable: true,
        metrics: ['score_trend']
      });
    }

    // 检查积分波动
    const volatility = this.calculateVolatility(values);
    if (volatility > 20) {
      suggestions.push({
        category: 'score',
        title: '积分波动较大',
        description: `积分波动系数为${volatility.toFixed(2)}，建议保持稳定的工作节奏`,
        priority: 'medium',
        applicable: true,
        metrics: ['score_volatility']
      });
    }

    return suggestions;
  }

  /**
   * 分析任务性能
   * @private
   */
  analyzeTaskPerformance(taskHistory) {
    const suggestions = [];

    // 计算完成率
    const completed = taskHistory.filter(t => 
      t.status === 'completed' || t.status === 'success'
    ).length;
    const completionRate = (completed / taskHistory.length) * 100;

    if (completionRate < 70) {
      suggestions.push({
        category: 'task',
        title: '任务完成率偏低',
        description: `当前完成率为${completionRate.toFixed(1)}%，建议分析失败原因并优化`,
        priority: 'high',
        applicable: true,
        metrics: ['task_completion_rate', 'failure_rate']
      });
    } else if (completionRate >= 95) {
      suggestions.push({
        category: 'task',
        title: '任务完成率优秀',
        description: `当前完成率为${completionRate.toFixed(1)}%，表现优异`,
        priority: 'low',
        applicable: true,
        metrics: ['task_completion_rate']
      });
    }

    // 分析任务时长
    const durations = taskHistory
      .filter(t => t.duration)
      .map(t => t.duration);
    
    if (durations.length > 0) {
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      
      if (avgDuration > 300000) { // 超过5分钟
        suggestions.push({
          category: 'task',
          title: '任务执行时间较长',
          description: `平均任务执行时间为${(avgDuration / 1000 / 60).toFixed(1)}分钟，建议优化任务流程`,
          priority: 'medium',
          applicable: true,
          metrics: ['task_duration']
        });
      }
    }

    return suggestions;
  }

  /**
   * 分析性能
   * @private
   */
  analyzePerformance(performanceData) {
    const suggestions = [];

    // CPU使用率
    const cpuValues = performanceData
      .filter(d => d.cpu_usage !== undefined)
      .map(d => d.cpu_usage);
    
    if (cpuValues.length > 0) {
      const avgCPU = cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length;
      
      if (avgCPU > 80) {
        suggestions.push({
          category: 'performance',
          title: 'CPU使用率过高',
          description: `平均CPU使用率为${avgCPU.toFixed(1)}%，建议优化计算密集型任务`,
          priority: 'high',
          applicable: true,
          metrics: ['cpu_usage']
        });
      }
    }

    // 内存使用率
    const memValues = performanceData
      .filter(d => d.memory_usage !== undefined)
      .map(d => d.memory_usage);
    
    if (memValues.length > 0) {
      const avgMem = memValues.reduce((a, b) => a + b, 0) / memValues.length;
      
      if (avgMem > 85) {
        suggestions.push({
          category: 'performance',
          title: '内存使用率过高',
          description: `平均内存使用率为${avgMem.toFixed(1)}%，建议检查内存泄漏`,
          priority: 'high',
          applicable: true,
          metrics: ['memory_usage']
        });
      }
    }

    return suggestions;
  }

  /**
   * 分析Agent状态
   * @private
   */
  analyzeAgentStatus与其他(agentData) {
    const suggestions = [];

    if (agentData.status === 'offline') {
      suggestions.push({
        category: 'status',
        title: 'Agent离线',
        description: 'Agent当前处于离线状态，建议检查网络连接和服务状态',
        priority: 'high',
        applicable: true,
        metrics: ['agent_status']
      });
    }

    if (agentData.lastHeartbeat) {
      const lastHeartbeatTime = new Date(agentData.lastHeartbeat).getTime();
      const currentTime = Date.now();
      const diffMinutes = (currentTime - lastHeartbeatTime) / 1000 / 60;

      if (diffMinutes > 5) {
        suggestions.push({
          category: 'status',
          title: '心跳超时',
          description: `上次心跳已超过${diffMinutes.toFixed(0)}分钟，建议检查Agent健康状态`,
          priority: 'high',
          applicable: true,
          metrics: ['heartbeat_interval']
        });
      }
    }

    return suggestions;
  }

  /**
   * 获取最佳实践
   * @private
   */
  getBestPracticesByType(agentType) {
    const commonPractices = [
      {
        title: '定期备份数据',
        description: '建议每天备份重要数据，防止数据丢失',
        priority: 'medium',
        metrics: ['backup_frequency']
      },
      {
        title: '监控关键指标',
        description: '持续监控CPU、内存、任务执行等关键指标',
        priority: 'high',
        metrics: ['cpu_usage', 'memory_usage', 'task_completion_rate']
      },
      {
        title: '日志记录',
        description: '详细记录操作日志，便于问题排查',
        priority: 'medium',
        metrics: ['log_level', 'log_retention']
      }
    ];

    const typeSpecificPractices = {
      'dev-agent': [
        {
          title: '代码质量检查',
          description: '定期运行代码质量检查工具，保持代码规范',
          priority: 'high',
          metrics: ['code_quality_score']
        },
        {
          title: '单元测试覆盖率',
          description: '保持单元测试覆盖率在80%以上',
          priority: 'high',
          metrics: ['test_coverage']
        }
      ],
      'test-agent': [
        {
          title: '测试用例维护',
          description: '定期更新和维护测试用例，确保测试有效性',
          priority: 'high',
          metrics: ['test_case_count', 'test_pass_rate']
        },
        {
          title: '自动化测试',
          description: '尽可能实现测试自动化，提高测试效率',
          priority: 'medium',
          metrics: ['automation_rate']
        }
      ],
      'ops-agent': [
        {
          title: '系统健康检查',
          description: '定期进行系统健康检查，及时发现潜在问题',
          priority: 'high',
          metrics: ['system_health_score']
        },
        {
          title: '资源监控',
          description: '持续监控系统资源使用情况，优化资源配置',
          priority: 'high',
          metrics: ['resource_utilization']
        }
      ],
      'data-agent': [
        {
          title: '数据质量验证',
          description: '定期验证数据质量，确保数据准确性',
          priority: 'high',
          metrics: ['data_quality_score']
        },
        {
          title: '数据备份',
          description: '建立完善的数据备份机制，确保数据安全',
          priority: 'high',
          metrics: ['backup_frequency', 'data_retention']
        }
      ],
      'pm-agent': [
        {
          title: '需求文档更新',
          description: '及时更新需求文档，保持文档与实际同步',
          priority: 'medium',
          metrics: ['document_completeness']
        },
        {
          title: '进度跟踪',
          description: '持续跟踪项目进度，及时调整计划',
          priority: 'high',
          metrics: ['milestone_completion_rate']
        }
      ]
    };

    return [
      ...commonPractices,
      ...(typeSpecificPractices[agentType] || [])
    ];
  }

  /**
   * 优化CPU
   * @private
   */
  optimizeCPU(cpuData) {
    const avgCPU = cpuData.reduce((a, b) => a + b, 0) / cpuData.length;

    if (avgCPU > 80) {
      return {
        category: 'resource',
        title: 'CPU优化建议',
        description: `平均CPU使用率${avgCPU.toFixed(1)}%，建议：1) 优化算法复杂度 2) 增加缓存 3) 考虑负载均衡`,
        priority: 'high',
        applicable: true,
        metrics: ['cpu_usage'],
        potentialImprovement: `${((avgCPU - 70) / avgCPU * 100).toFixed(1)}%`
      };
    }

    return null;
  }

  /**
   * 优化内存
   * @private
   */
  optimizeMemory(memoryData) {
    const avgMemory = memoryData.reduce((a, b) => a + b, 0) / memoryData.length;

    if (avgMemory > 85) {
      return {
        category: 'resource',
        title: '内存优化建议',
        description: `平均内存使用率${avgMemory.toFixed(1)}%，建议：1) 检查内存泄漏 2) 优化数据结构 3) 增加垃圾回收频率`,
        priority: 'high',
        applicable: true,
        metrics: ['memory_usage'],
        potentialImprovement: `${((avgMemory - 75) / avgMemory * 100).toFixed(1)}%`
      };
    }

    return null;
  }

  /**
   * 优化磁盘
   * @private
   */
  optimizeDisk(diskData) {
    const avgDisk = diskData.reduce((a, b) => a + b, 0) / diskData.length;

    if (avgDisk > 80) {
      return {
        category: 'resource',
        title: '磁盘优化建议',
        description: `平均磁盘使用率${avgDisk.toFixed(1)}%，建议：1) 清理临时文件 2) 压缩日志文件 3) 归档旧数据`,
        priority: 'medium',
        applicable: true,
        metrics: ['disk_usage'],
        potentialImprovement: `${((avgDisk - 70) / avgDisk * 100).toFixed(1)}%`
      };
    }

    return null;
  }

  /**
   * 优化网络
   * @private
   */
  optimizeNetwork(networkData) {
    // 简化的网络优化建议
    return {
      category: 'resource',
      title: '网络优化建议',
      description: '建议：1) 使用CDN加速 2) 启用HTTP/2 3) 优化API调用频率',
      priority: 'low',
      applicable: true,
      metrics: ['network_bandwidth', 'network_latency']
    };
  }

  /**
   * 计算趋势
   * @private
   */
  calculateTrend(values) {
    if (values.length < 2) return 0;
    return (values[values.length - 1] - values[0]) / values.length;
  }

  /**
   * 计算波动性
   * @private
   */
  calculateVolatility(values) {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return (stdDev / mean) * 100;
  }

  /**
   * 去重建议
   * @private
   */
  deduplicateSuggestions(suggestions) {
    const seen = new Set();
    return suggestions.filter(s => {
      const key = `${s.category}-${s.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * 优先级排序
   * @private
   */
  prioritizeSuggestions(suggestions) {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return suggestions.sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * 评估规则
   * @private
   */
  evaluateRule(rule, context) {
    try {
      return rule.condition(context);
    } catch (error) {
      console.error(`规则评估失败: ${rule.id}`, error);
      return false;
    }
  }

  /**
   * 初始化规则
   * @private
   */
  initializeRules() {
    return [
      {
        id: 'low_score_warning',
        title: '积分过低警告',
        description: '当前积分低于100分，建议提高任务完成质量',
        priority: 'high',
        condition: (ctx) => ctx.currentScore && ctx.currentScore < 100,
        actions: ['review_tasks', 'improve_quality']
      },
      {
        id: 'high_failure_rate',
        title: '高失败率警告',
        description: '任务失败率超过30%，建议检查任务配置',
        priority: 'high',
        condition: (ctx) => ctx.failureRate && ctx.failureRate > 30,
        actions: ['check_logs', 'review_configuration']
      },
      {
        id: 'offline_warning',
        title: 'Agent离线警告',
        description: 'Agent处于离线状态，请检查服务',
        priority: 'high',
        condition: (ctx) => ctx.status === 'offline',
        actions: ['check_service', 'check_network']
      },
      {
        id: 'performance_degradation',
        title: '性能下降警告',
        description: '响应时间增加超过50%，建议优化性能',
        priority: 'medium',
        condition: (ctx) => ctx.responseTime && ctx.responseTime > 5000,
        actions: ['optimize_queries', 'add_cache']
      },
      {
        id: 'memory_pressure',
        title: '内存压力警告',
        description: '内存使用率超过80%，建议优化内存使用',
        priority: 'medium',
        condition: (ctx) => ctx.memoryUsage && ctx.memoryUsage > 80,
        actions: ['check_memory_leaks', 'optimize_data_structures']
      }
    ];
  }
}

export default SuggestionEngine;
