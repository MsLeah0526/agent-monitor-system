/**
 * 智能分析与预测功能测试脚本
 */

import AnalysisEngine from './index.js';

async function testAnalysis() {
  console.log('🧪 开始测试智能分析与预测功能...\n');

  const engine = new AnalysisEngine();

  // 模拟测试数据
  const testData = {
    agentId: 'test-agent',
    agentType: 'dev-agent',
    currentScore: 140,
    status: 'online',
    lastHeartbeat: new Date().toISOString(),
    scoreHistory: [
      { timestamp: Date.now() - 86400000 * 5, value: 100 },
      { timestamp: Date.now() - 86400000 * 4, value: 110 },
      { timestamp: Date.now() - 86400000 * 3, value: 120 },
      { timestamp: Date.now() - 86400000 * 2, value: 130 },
      { timestamp: Date.now() - 86400000 * 1, value: 140 }
    ],
    taskHistory: [
      { timestamp: Date.now() - 3600000 * 5, status: 'completed', type: 'code_review' },
      { timestamp: Date.now() - 3600000 * 4, status: 'completed', type: 'code_review' },
      { timestamp: Date.now() - 3600000 * 3, status: 'failed', type: 'code_review', error_code: 'E001' },
      { timestamp: Date.now() - 3600000 * 2, status: 'completed', type: 'code_review' },
      { timestamp: Date.now() - 3600000 * 1, status: 'completed', type: 'code_review' }
    ],
    performanceData: [
      { timestamp: Date.now() - 3600000 * 5, cpu_usage: 75, memory_usage: 70, response_time: 2000 },
      { timestamp: Date.now() - 3600000 * 4, cpu_usage: 80, memory_usage: 75, response_time: 2500 },
      { timestamp: Date.now() - 3600000 * 3, cpu_usage: 85, memory_usage: 80, response_time: 3000 },
      { timestamp: Date.now() - 3600000 * 2, cpu_usage: 78, memory_usage: 72, response_time: 2200 },
      { timestamp: Date.now() - 3600000 * 1, cpu_usage: 82, memory_usage: 76, response_time: 2800 }
    ],
    resourceData: {
      cpu_usage: [75, 80, 85, 78, 82],
      memory_usage: [70, 75, 80, 72, 76]
    }
  };

  try {
    // 测试趋势预测
    console.log('📈 测试趋势预测...');
    const trends = await engine.predictTrends(testData);
    console.log('✅ 趋势预测成功');
    console.log(`   - 积分趋势: ${trends.scoreTrend.trend}`);
    console.log(`   - 预测准确率: ${trends.scoreTrend.accuracy.toFixed(1)}%`);
    console.log(`   - 异常风险: ${trends.anomalyRisk.riskLevel}\n`);

    // 测试异常识别
    console.log('🔍 测试异常识别...');
    const anomalies = await engine.detectAnomalies(testData);
    console.log('✅ 异常识别成功');
    console.log(`   - 总异常数: ${anomalies.summary.totalAnomalies}`);
    console.log(`   - 高严重性: ${anomalies.summary.highSeverityCount}`);
    console.log(`   - 总体风险: ${anomalies.summary.overallRisk}\n`);

    // 测试智能建议
    console.log('💡 测试智能建议...');
    const suggestions = await engine.generateSuggestions(testData);
    console.log('✅ 智能建议生成成功');
    console.log(`   - 总建议数: ${suggestions.summary.totalSuggestions}`);
    console.log(`   - 高优先级: ${suggestions.summary.highPriority}`);
    console.log(`   - 中优先级: ${suggestions.summary.mediumPriority}\n`);

    // 测试综合分析
    console.log('📊 测试综合分析...');
    const comprehensive = await engine.analyze(testData);
    console.log('✅ 综合分析成功');
    console.log(`   - 总问题数: ${comprehensive.summary.totalIssues}`);
    console.log(`   - 高优先级问题: ${comprehensive.summary.highPriorityIssues}`);
    console.log(`   - 中优先级问题: ${comprehensive.summary.mediumPriorityIssues}\n`);

    console.log('🎉 所有测试通过！\n');

    // 输出详细结果
    console.log('========== 详细结果 ==========\n');
    console.log(JSON.stringify(comprehensive, null, 2));

    return true;
  } catch (error) {
    console.error('❌ 测试失败:', error);
    return false;
  }
}

// 运行测试
testAnalysis().then(success => {
  process.exit(success ? 0 : 1);
});
