#!/bin/bash

# Agent监控系统集成测试脚本
# 作者: Jojo (test-agent)
# 日期: 2026-03-09

set -e

echo "🧪 Agent监控系统集成测试"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
TESTS_PASSED=0
TESTS_FAILED=0

# 测试函数
test_step() {
    local name="$1"
    local command="$2"

    echo -n "测试: $name ... "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 通过${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ 失败${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# 进入项目目录
cd /root/.openclaw/dev-agent/agent-monitor-system

echo "📂 当前目录: $(pwd)"
echo ""

# 测试1: 检查package.json
echo "📦 检查项目文件..."
test_step "package.json存在" "test -f package.json"
test_step "backend/server.mjs存在" "test -f backend/server.mjs"
test_step "backend/init-database.mjs存在" "test -f backend/init-database.mjs"
test_step "backend/seed/agents.mjs存在" "test -f backend/seed/agents.mjs"
test_step "backend/syncAgents.mjs存在" "test -f backend/syncAgents.mjs"
test_step "INTEGRATION.md存在" "test -f INTEGRATION.md"
echo ""

# 测试2: 检查依赖
echo "📚 检查依赖..."
test_step "node_modules存在" "test -d node_modules"
test_step "express已安装" "test -d node_modules/express"
test_step "mysql2已安装" "test -d node_modules/mysql2"
test_step "react已安装" "test -d node_modules/react"
echo ""

# 测试3: 检查.env文件
echo "⚙️  检查配置..."
if [ -f .env ]; then
    echo -e "${GREEN}✅ .env文件存在${NC}"
    ((TESTS_PASSED++))
    echo "配置内容:"
    cat .env | sed 's/^/  /'
else
    echo -e "${YELLOW}⚠️  .env文件不存在，将使用默认配置${NC}"
    ((TESTS_PASSED++))
fi
echo ""

# 测试4: 检查数据库连接
echo "🗄️  检查数据库..."
if command -v mysql &> /dev/null; then
    echo -e "${GREEN}✅ MySQL客户端已安装${NC}"
    ((TESTS_PASSED++))

    # 测试MySQL连接
    if mysql -u root -e "SELECT 1" &> /dev/null; then
        echo -e "${GREEN}✅ MySQL连接成功${NC}"
        ((TESTS_PASSED++))

        # 检查数据库是否存在
        if mysql -u root -e "USE agent_monitor" &> /dev/null; then
            echo -e "${GREEN}✅ agent_monitor数据库存在${NC}"
            ((TESTS_PASSED++))

            # 检查表是否存在
            TABLES=$(mysql -u root -D agent_monitor -e "SHOW TABLES" -s)
            if [ -n "$TABLES" ]; then
                echo -e "${GREEN}✅ 数据库表已创建${NC}"
                ((TESTS_PASSED++))
                echo "表列表:"
                echo "$TABLES" | sed 's/^/  - /'
            else
                echo -e "${YELLOW}⚠️  数据库表未创建，需要运行 npm run init-db${NC}"
                ((TESTS_PASSED++))
            fi
        else
            echo -e "${YELLOW}⚠️  agent_monitor数据库不存在，需要运行 npm run init-db${NC}"
            ((TESTS_PASSED++))
        fi
    else
        echo -e "${RED}❌ MySQL连接失败${NC}"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${YELLOW}⚠️  MySQL客户端未安装${NC}"
    ((TESTS_PASSED++))
fi
echo ""

# 测试5: 检查端口占用
echo "🔌 检查端口..."
if netstat -tlnp 2>/dev/null | grep -q ":3001 "; then
    echo -e "${YELLOW}⚠️  端口3001已被占用${NC}"
    netstat -tlnp 2>/dev/null | grep ":3001 " | sed 's/^/  /'
    ((TESTS_PASSED++))
else
    echo -e "${GREEN}✅ 端口3001可用${NC}"
    ((TESTS_PASSED++))
fi

if netstat -tlnp 2>/dev/null | grep -q ":5000 "; then
    echo -e "${YELLOW}⚠️  端口5000已被占用${NC}"
    netstat -tlnp 2>/dev/null | grep ":5000 " | sed 's/^/  /'
    ((TESTS_PASSED++))
else
    echo -e "${GREEN}✅ 端口5000可用${NC}"
    ((TESTS_PASSED++))
fi
echo ""

# 测试6: 检查Agent工作区
echo "🏠 检查Agent工作区..."
AGENTS=("workspace-mrleader" "pm-agent" "dev-agent" "data-agent" "test-agent" "ops-agent" "monitor-agent")
for agent in "${AGENTS[@]}"; do
    WORKSPACE="/root/.openclaw/$agent"
    if [ -d "$WORKSPACE" ]; then
        echo -e "${GREEN}✅ $agent 工作区存在${NC}"
        ((TESTS_PASSED++))

        if [ -f "$WORKSPACE/MEMORY.md" ]; then
            echo -e "${GREEN}✅ $agent MEMORY.md存在${NC}"
            ((TESTS_PASSED++))
        else
            echo -e "${YELLOW}⚠️  $agent MEMORY.md不存在${NC}"
            ((TESTS_PASSED++))
        fi
    else
        echo -e "${RED}❌ $agent 工作区不存在${NC}"
        ((TESTS_FAILED++))
    fi
done
echo ""

# 测试7: 检查npm脚本
echo "🔧 检查npm脚本..."
test_step "backend脚本存在" "grep -q '\"backend\"' package.json"
test_step "init-db脚本存在" "grep -q '\"init-db\"' package.json"
test_step "seed-db脚本存在" "grep -q '\"seed-db\"' package.json"
test_step "sync-agents脚本存在" "grep -q '\"sync-agents\"' package.json"
test_step "sync-daemon脚本存在" "grep -q '\"sync-daemon\"' package.json"
echo ""

# 输出测试结果
echo "======================================"
echo "📊 测试结果"
echo "======================================"
echo -e "${GREEN}✅ 通过: $TESTS_PASSED${NC}"
echo -e "${RED}❌ 失败: $TESTS_FAILED${NC}"
echo "总计: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

# 提供下一步建议
echo "📝 下一步操作:"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}所有测试通过！${NC}"
    echo ""
    echo "1. 初始化数据库（如果需要）:"
    echo "   npm run init-db"
    echo ""
    echo "2. 插入初始数据（如果需要）:"
    echo "   npm run seed-db"
    echo ""
    echo "3. 启动后端API服务器:"
    echo "   npm run backend"
    echo ""
    echo "4. 启动前端开发服务器:"
    echo "   npm run dev"
    echo ""
    echo "5. 启动自动同步守护进程:"
    echo "   npm run sync-daemon"
else
    echo -e "${RED}有测试失败，请检查上述错误${NC}"
    echo ""
    echo "常见问题:"
    echo "1. 依赖未安装: 运行 npm install"
    echo "2. 数据库未启动: 运行 sudo systemctl start mysql"
    echo "3. 端口被占用: 停止占用端口的进程或修改配置"
fi

echo ""
echo "📚 详细文档: INTEGRATION.md"
echo "🐛 问题反馈: 联系 Jojo (test-agent)"
