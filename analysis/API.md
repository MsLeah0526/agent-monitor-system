# 智能分析与预测 API 文档

## 概述

本文档描述了Agent监控系统Phase 3智能分析与预测功能的API接口。

## 基础信息

- **Base URL**: `http://localhost:3001/api/analysis`
- **认证方式**: Bearer Token (需要登录后获取)
- **数据格式**: JSON

## API端点

### 1. 获取Agent趋势预测

**端点**: `GET /agent/:agentId/trends`

**描述**: 获取指定Agent的趋势预测结果，包括积分趋势、任务完成率预测和异常风险预警。

**路径参数**:
- `agentId` (string, required): Agent ID

**响应示例**:
```json
{
  "success": true,
  "agentId": "test-agent",
  "results": {
    "scoreTrend": {
      "success": true,
      "method": "linear",
      "trend": "up",
      "growthRate": 12.5,
      "currentScore": 140,
      "predictedScore": 157,
      "predictions": [
        {
          "timestamp": 1711234567890,
          "value": 142,
          "confidence": 92
        }
      ],
      "accuracy": 95.2,
      "r2": 0.952
    },
    "taskCompletionRate": {
      "success": true,
      "method": "moving_average",
      "currentRate": 85.5,
      "predictions": [...],
      "accuracy": 75,
      "riskLevel": "low"
    },
    "anomalyRisk": {
      "riskLevel": "low",
      "riskFactors": [],
      "maxDeviation": 1.2,
      "mean": 102.5,
      "stdDev": 8.3,
      "recommendations": []
    }
  },
  "timestamp": "2026-03-10T11:43:00.000Z"
}
```

---

### 2. 获取Agent异常识别结果

**端点**: `GET /agent/:agentId/anomalies`

**描述**: 获取指定Agent的异常识别结果，包括积分异常、任务失败模式和性能瓶颈。

**路径参数**:
- `agentId` (string, required): Agent ID

**响应示例**:
```json
{
  "success": true,
  "agentId": "test-agent",
  "results": {
    "scoreAnomalies": {
      "success": true,
      "method": "3_sigma",
      "mean": 102.5,
      "stdDev": 8.3,
      "threshold": 24.9,
      "anomalies": [
        {
          "timestamp": 1711234567890,
          "value": 150,
          "expected": 102.5,
          "deviation": 47.5,
          "sigmaLevel": 5.7,
          "type": "positive",
          "severity": "high"
        }
      ],
      "anomalyCount": 1,
      "anomalyRate": "5.00"
    },
    "failurePatterns": {
      "success": true,
      "failureRate": 10.0,
      "failedTaskCount": 5,
      "totalTaskCount": 50,
      "patterns": [
        {
          "type": "consecutive_failures",
          "description": "连续失败任务",
          "occurrences": 1,
          "details": [...],
          "severity": "high",
          "recommendation": "检查Agent健康状态，考虑重启服务"
        }
      ],
      "overallSeverity": "high"
    },
    "performanceBottlenecks": {
      "success": true,
      "bottlenecks": [
        {
          "metric": "cpu_usage",
          "description": "CPU使用率过高",
          "avgValue": "85.50",
          "maxValue": "90.00",
          "threshold": 80,
          "severity": "high",
          "recommendation": "优化计算密集型任务，考虑负载均衡"
        }
      ],
      "overallHealth": "degraded"
    },
    "summary": {
      "totalAnomalies": 6,
      "highSeverityCount": 3,
      "mediumSeverityCount": 2,
      "lowSeverityCount": 1,
      "overallRisk": "high"
    }
  },
  "timestamp": "2026-03-10T11:43:00.000Z"
}
```

---

### 3. 获取Agent智能建议

**端点**: `GET /agent/:agentId/suggestions`

**描述**: 获取指定Agent的智能建议，包括个性化建议、最佳实践和资源优化建议。

**路径参数**:
- `agentId` (string, required): Agent ID

**响应示例**:
```json
{
  "success": true,
  "agentId": "test-agent",
  "results": {
    "timestamp": "2026-03-10T11:43:00.000Z",
    "agentId": "test-agent",
    "summary": {
      "totalSuggestions": 8,
      "highPriority": 3,
      "mediumPriority": 4,
      "lowPriority": 1
    },
    "categories": {
      "personalized": [
        {
          "category": "score",
          "title": "积分呈下降趋势",
          "description": "最近积分平均下降3.5分，建议检查任务质量和完成情况",
          "priority": "high",
          "applicable": true,
          "metrics": ["score_trend", "task_completion_rate"]
        }
      ],
      "bestPractices": [
        {
          "category": "best_practice",
          "title": "代码质量检查",
          "description": "定期运行代码质量检查工具，保持代码规范",
          "priority": "high",
          "applicable": true,
          "metrics": ["code_quality_score"]
        }
      ],
      "resourceOptimizations": [
        {
          "category": "resource",
          "title": "CPU优化建议",
          "description": "平均CPU使用率85.5%，建议：1) 优化算法复杂度 2) 增加缓存 3) 考虑负载均衡",
          "priority": "high",
          "applicable": true,
          "metrics": ["cpu_usage"],
          "potentialImprovement": "18.1%"
        }
      ],
      "ruleBased": [
        {
          "category": "rule_based",
          "title": "低积分警告",
          "description": "当前积分低于100分，建议提高任务完成质量",
          "priority": "high",
          "applicable": true,
          "ruleId": "low_score_warning",
          "actions": ["review_tasks", "improve_quality"]
        }
      ]
    }
  },
  "timestamp": "2026-03-10T11:43:00.000Z"
}
```

---

### 4. 获取Agent综合分析报告

**端点**: `GET /agent/:agentId/comprehensive`

**描述**: 获取指定Agent的综合分析报告，包含趋势预测、异常识别和智能建议的完整结果。

**路径参数**:
- `agentId` (string, required): Agent ID

**响应示例**:
```json
{
  "success": true,
  "agentId": "test-agent",
  "results": {
    "timestamp": "2026-03-10T11:43:00.000Z",
    "agentId": "test-agent",
    "trends": { ... },
    "anomalies": { ... },
    "suggestions": { ... },
    "summary": {
      "totalIssues": 14,
      "highPriorityIssues": 6,
      "mediumPriorityIssues": 6,
      "lowPriorityIssues": 2
    }
  },
  "timestamp": "2026-03-10T11:43:00.000Z"
}
```

---

### 5. 获取团队趋势预测

**端点**: `GET /team/trends`

**描述**: 获取所有Agent的趋势预测结果。

**响应示例**:
```json
{
  "success": true,
  "teamResults": [
    {
      "agentId": "test-agent",
      "success": true,
      "results": { ... }
    },
    {
      "agentId": "dev-agent",
      "success": true,
      "results": { ... }
    }
  ],
  "timestamp": "2026-03-10T11:43:00.000Z"
}
```

---

### 6. 获取团队异常识别结果

**端点**: `GET /team/anomalies`

**描述**: 获取所有Agent的异常识别结果及团队整体风险评估。

**响应示例**:
```json
{
  "success": true,
  "teamResults": [
    {
      "agentId": "test-agent",
      "success": true,
      "results": { ... }
    }
  ],
  "summary": {
    "totalAnomalies": 12,
    "highSeverityCount": 5,
    "overallRisk": "high"
  },
  "timestamp": "2026-03-10T11:43:00.000Z"
}
```

---

### 7. 跟踪建议采纳情况

**端点**: `POST /suggestion/track`

**描述**: 记录用户对建议的采纳情况，用于改进建议算法。

**请求体**:
```json
{
  "agentId": "test-agent",
  "suggestionId": "low_score_warning",
  "action": "accepted",
  "feedback": "建议很有帮助"
}
```

**请求参数**:
- `agentId` (string, required): Agent ID
- `suggestionId` (string, required): 建议ID
- `action` (string, required): 操作类型 (accepted/rejected/ignored)
- `feedback` (string, optional): 用户反馈

**响应示例**:
```json
{
  "success": true,
  "message": "建议采纳记录成功",
  "data": {
    "agentId": "test-agent",
    "suggestionId": "low_score_warning",
    "action": "accepted",
    "feedback": "建议很有帮助",
    "timestamp": "2026-03-10T11:43:00.000Z"
  }
}
```

---

## 错误响应

所有API在出错时返回以下格式：

```json
{
  "success": false,
  "message": "错误描述",
  "error": "详细错误信息（开发环境）"
}
```

常见HTTP状态码：
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 算法说明

### 趋势预测算法

1. **线性回归**
   - 用于积分趋势预测
   - 计算R²预测准确率
   - 提供置信区间

2. **移动平均**
   - 用于任务完成率预测
   - 支持自定义窗口大小
   - 计算趋势方向

### 异常检测算法

1. **3σ原则**
   - 检测积分异常波动
   - 计算偏离程度
   - 评估严重程度

2. **模式识别**
   - 连续失败检测
   - 任务类型失败分析
   - 时间模式分析
   - 错误代码模式分析

### 智能建议引擎

1. **规则引擎**
   - 基于条件生成建议
   - 支持优先级排序
   - 提供可执行操作

2. **最佳实践库**
   - 按Agent类型分类
   - 包含通用和特定实践
   - 提供改进建议

3. **资源优化**
   - CPU/内存/磁盘/网络分析
   - 计算优化潜力
   - 提供具体建议

---

## 使用示例

### JavaScript (fetch)

```javascript
// 获取趋势预测
const response = await fetch('http://localhost:3001/api/analysis/agent/test-agent/trends', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
const data = await response.json();

// 获取综合分析
const response = await fetch('http://localhost:3001/api/analysis/agent/test-agent/comprehensive', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
const data = await response.json();
```

### cURL

```bash
# 获取趋势预测
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/analysis/agent/test-agent/trends

# 获取异常识别
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/analysis/agent/test-agent/anomalies

# 获取智能建议
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/analysis/agent/test-agent/suggestions

# 获取综合分析
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/analysis/agent/test-agent/comprehensive

# 获取团队趋势
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/analysis/team/trends

# 记录建议采纳
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test-agent","suggestionId":"low_score_warning","action":"accepted"}' \
  http://localhost:3001/api/analysis/suggestion/track
```

---

## 性能指标

- **趋势预测响应时间**: < 500ms
- **异常识别响应时间**: < 500ms
- **智能建议生成时间**: < 300ms
- **综合分析响应时间**: < 1s

---

## 注意事项

1. 所有API都需要认证
2. 建议数据基于历史30天数据
3. 预测准确率随时间推移可能降低
4. 建议定期更新数据以获得准确结果
5. 建议采纳情况可用于改进算法

---

## 版本历史

- **v1.0** (2026-03-10): 初始版本，支持趋势预测、异常识别和智能建议
