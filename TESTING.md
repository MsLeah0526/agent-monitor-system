# Agent监控系统测试指南

## 测试环境

- **前端地址**: http://localhost:5000
- **后端API**: http://localhost:3001
- **测试时间**: 2026-03-09

## 测试项目

### 1. 积分显示测试 ✅

**测试目标**: 验证从蔡文姬（DataAgent）获取的积分信息正确显示

**测试步骤**:
1. 访问前端页面 http://localhost:5000
2. 查看所有Agent卡片上的积分显示
3. 验证积分数据与数据库中的数据一致

**预期结果**:
- 每个Agent的积分正确显示
- 积分数值与各Agent的MEMORY.md中的积分一致

**当前积分数据**:
- dataAgent (Fiz): 155分 (Elite)
- dev-agent (贾维斯): 161分 (Elite)
- monitor-agent (蔡文姬): 100分 (Normal)
- mrleader (小李子): 100分 (Normal)
- ops-agent (欧派): 120分 (High)
- pm-agent (小红): 223分 (Elite)
- test-agent (Jojo): 242分 (Elite)

**测试命令**:
```bash
curl -s http://localhost:3001/api/agents/detail | python3 -c "
import json, sys
data = json.load(sys.stdin)
if data.get('success'):
    print('✅ API返回成功')
    print(f'📊 Agent数量: {len(data[\"data\"])}')
    print('\\n积分信息:')
    for agent in data['data']:
        print(f'  {agent[\"id\"]}: {agent[\"name\"]} - 积分={agent[\"score\"]}, 优先级={agent[\"priority\"]}')
"
```

### 2. 卡片点击测试 ✅

**测试目标**: 验证点击Agent卡片能弹出详细信息

**测试步骤**:
1. 访问前端页面 http://localhost:5000
2. 点击任意Agent卡片
3. 验证详细信息面板展开

**预期结果**:
- 点击卡片后，详细信息区域展开
- 显示当前任务列表
- 显示未来任务列表
- 显示其他指标（CPU、内存、成功率等）

### 3. 任务信息显示测试 ✅

**测试目标**: 验证当前任务和未来任务正确显示

**测试步骤**:
1. 点击任意Agent卡片
2. 查看"正在进行的任务"部分
3. 查看"未来工作计划"部分

**预期结果**:
- 显示当前正在执行的任务
- 显示任务进度条
- 显示任务状态（进行中/已完成/等待中）
- 显示未来计划任务列表

**当前任务数据**:
- data-agent: 数据处理任务
- dev-agent: 系统开发任务
- monitor-agent: 积分管理任务
- mrleader: 团队协调任务
- ops-agent: 运维任务
- pm-agent: 需求分析任务
- test-agent: 测试任务

### 4. 实时数据更新测试

**测试目标**: 验证数据每5秒自动刷新

**测试步骤**:
1. 访问前端页面
2. 观察CPU、内存等指标
3. 等待5-10秒
4. 验证指标数值发生变化

**预期结果**:
- 指标数值会自动更新
- 更新间隔约为5秒

### 5. 后端API测试

**测试目标**: 验证后端API正常工作

**测试步骤**:
```bash
# 健康检查
curl http://localhost:3001/health

# 获取Agent详细信息
curl http://localhost:3001/api/agents/detail

# 获取Agent概览
curl http://localhost:3001/api/agents/overview
```

**预期结果**:
- 所有API返回success: true
- 数据格式正确
- 包含完整的Agent信息

## 测试清单

- [ ] 1. 积分信息正确显示
- [ ] 2. 卡片点击功能正常
- [ ] 3. 当前任务正确显示
- [ ] 4. 未来任务正确显示
- [ ] 5. 实时数据自动刷新
- [ ] 6. 后端API正常响应
- [ ] 7. 数据库连接正常
- [ ] 8. 前端UI显示正常

## 已知问题

无

## 测试结果

**测试人员**: Jojo (test-agent)
**测试日期**: 待填写
**测试结果**: 待填写

## 备注

- 积分数据每5分钟自动同步一次
- 数据源为各Agent的MEMORY.md文件
- 任务数据存储在MySQL数据库中
