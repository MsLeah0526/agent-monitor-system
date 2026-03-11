# Agent监控系统部署报告

## 部署概述

**部署时间**: 2026-03-11 14:54 (UTC+8)
**部署状态**: ✅ 成功
**部署环境**: 生产环境 (Production)
**操作系统**: OpenCloudOS 9 (Linux 6.6.117-45.1.oc9.x86_64)

---

## 系统架构

### 后端服务
- **技术栈**: Node.js v24.14.0 + Express + WebSocket
- **数据库**: MySQL 8.0.45
- **进程管理**: PM2
- **状态**: ✅ 运行中

### 前端服务
- **技术栈**: React 18 + Vite + Ant Design
- **Web服务器**: Nginx 1.26.3
- **状态**: ✅ 运行中

---

## 服务端口配置

| 服务 | 端口 | 协议 | 状态 | 访问地址 |
|------|------|------|------|----------|
| API服务 | 3001 | HTTP | ✅ 运行中 | http://localhost:3001 |
| WebSocket服务 | 8080 | WS | ✅ 运行中 | ws://localhost:8080 |
| Nginx前端 | 5000 | HTTP | ✅ 运行中 | http://81.70.153.159:5000 |

## 外网访问配置

### 公网访问信息
- **服务器IP**: 81.70.153.159
- **外网访问地址**: http://81.70.153.159:5000
- **WebSocket地址**: ws://81.70.153.159:8080

### 访问说明
1. **前端访问**: http://81.70.153.159:5000
   - 浏览器打开上述地址即可访问监控面板
   - 使用管理员账号登录：admin / admin123

2. **API访问**: http://81.70.153.159:5000/api
   - API接口通过Nginx反向代理访问

3. **WebSocket访问**: ws://81.70.153.159:8080
   - WebSocket服务直接暴露，用于实时数据推送

### 防火墙配置
当前系统未检测到防火墙服务（firewalld/ufw），端口5000和8080已对外开放。

**建议安全措施**:
- 如需启用防火墙，请开放以下端口：
  ```bash
  # 如果使用firewalld
  firewall-cmd --permanent --add-port=5000/tcp
  firewall-cmd --permanent --add-port=8080/tcp
  firewall-cmd --reload

  # 如果使用ufw
  ufw allow 5000/tcp
  ufw allow 8080/tcp
  ```

---

## 数据库配置

### 数据库信息
- **类型**: MySQL 8.0.45
- **数据库名**: agent_monitor_prod
- **字符集**: utf8mb4_unicode_ci
- **用户**: agent_monitor

### 数据表
- agents (Agent基本信息)
- agent_status (Agent状态)
- agent_tasks (Agent任务)
- agent_invocations (Agent调用)
- agent_communications (Agent通信)
- agent_overview (Agent概览视图)
- users (用户管理)
- alerts (告警)
- alert_rules (告警规则)
- agent_score_history (分数历史)
- agent_configs (配置)

---

## 访问凭证

### 管理员账号
- **用户名**: admin
- **密码**: admin123
- **角色**: admin

### API访问
- **健康检查**: http://localhost/health
- **登录接口**: http://localhost:3001/api/auth/login
- **API根路径**: http://localhost:3001/api

---

## 部署路径

### 项目路径
- **项目根目录**: /root/.openclaw/dev-agent/archives/agent-monitor-system
- **后端代码**: /root/.openclaw/dev-agent/archives/agent-monitor-system/backend
- **前端构建**: /var/www/agent-monitor

### 配置文件
- **PM2配置**: /root/.openclaw/dev-agent/archives/agent-monitor-system/ecosystem.config.cjs
- **Nginx配置**: /etc/nginx/conf.d/agent-monitor.conf
- **环境变量**: /root/.openclaw/dev-agent/archives/agent-monitor-system/.env.production

### 日志文件
- **API日志**: /var/log/agent-monitor/api-*.log
- **WebSocket日志**: /var/log/agent-monitor/ws-*.log
- **Nginx日志**: /var/log/nginx/*.log

---

## 进程管理 (PM2)

### 当前运行的进程
```
┌────┬──────────────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┐
│ id │ name                 │ status  │ pid     │ uptime   │ cpu    │ mem   │ restarts  │
├────┼──────────────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┤
│ 0  │ agent-monitor-api    │ online  │ 508545  │ 15m      │ 0%     │ 65MB  │ 0         │
│ 1  │ agent-monitor-ws     │ online  │ 508546  │ 15m      │ 0%     │ 62MB  │ 0         │
└────┴──────────────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┘
```

### PM2管理命令
```bash
# 查看进程状态
pm2 status

# 查看日志
pm2 logs

# 重启服务
pm2 restart all

# 停止服务
pm2 stop all

# 删除服务
pm2 delete all
```

---

## 服务管理命令

### 启动服务
```bash
# 启动PM2服务
pm2 start /root/.openclaw/dev-agent/archives/agent-monitor-system/ecosystem.config.cjs

# 启动Nginx
systemctl start nginx
```

### 停止服务
```bash
# 停止PM2服务
pm2 stop all

# 停止Nginx
systemctl stop nginx
```

### 重启服务
```bash
# 重启PM2服务
pm2 restart all

# 重启Nginx
systemctl restart nginx
```

### 查看服务状态
```bash
# PM2状态
pm2 status

# Nginx状态
systemctl status nginx

# 查看端口占用
netstat -tlnp | grep -E '3001|8080|80'
```

---

## 验证测试

### ✅ 后端服务验证
- [x] API服务启动成功 (端口3001)
- [x] WebSocket服务启动成功 (端口8080)
- [x] 数据库连接成功
- [x] 健康检查接口正常
- [x] 登录接口正常

### ✅ 前端服务验证
- [x] 前端构建成功
- [x] Nginx配置成功
- [x] 静态文件部署成功
- [x] 反向代理配置成功
- [x] 前端页面可访问

### ✅ 功能验证
- [x] 管理员账号创建成功
- [x] 登录功能正常
- [x] API接口响应正常
- [x] WebSocket服务响应正常

---

## 常见问题处理

### 1. 服务无法启动
**症状**: PM2服务启动失败

**解决方案**:
```bash
# 查看PM2日志
pm2 logs

# 检查端口占用
netstat -tlnp | grep -E '3001|8080'

# 检查数据库连接
mysql -u agent_monitor -p agent_monitor_prod -e "SELECT 1;"
```

### 2. 数据库连接失败
**症状**: API日志显示数据库连接错误

**解决方案**:
```bash
# 检查MySQL服务状态
systemctl status mysqld

# 检查数据库用户权限
mysql -u root -e "SHOW GRANTS FOR 'agent_monitor'@'localhost';"

# 重新授权
mysql -u root -e "GRANT ALL PRIVILEGES ON agent_monitor_prod.* TO 'agent_monitor'@'localhost'; FLUSH PRIVILEGES;"
```

### 3. 前端页面404
**症状**: 访问http://localhost显示404

**解决方案**:
```bash
# 检查Nginx配置
nginx -t

# 检查文件权限
ls -la /var/www/agent-monitor

# 重新设置权限
chown -R nginx:nginx /var/www/agent-monitor
chmod -R 755 /var/www/agent-monitor

# 重启Nginx
systemctl restart nginx
```

### 4. WebSocket连接失败
**症状**: 前端无法连接WebSocket

**解决方案**:
```bash
# 检查WebSocket服务状态
pm2 status

# 检查端口
curl http://localhost:8080/

# 查看WebSocket日志
pm2 logs agent-monitor-ws
```

### 5. 登录失败
**症状**: 无法使用admin账号登录

**解决方案**:
```bash
# 检查用户表
mysql -u agent_monitor -p agent_monitor_prod -e "SELECT id, username, role FROM users;"

# 重置管理员密码（如需要）
# 需要运行数据库初始化脚本
```

---

## 安全建议

### 生产环境安全配置
1. **修改默认密码**: 建议修改admin账号的默认密码
2. **JWT密钥**: 修改.env.production中的JWT_SECRET为强密钥
3. **数据库密码**: 确保数据库密码足够复杂
4. **HTTPS配置**: 建议配置SSL证书启用HTTPS
5. **防火墙**: 配置防火墙规则限制访问
6. **日志监控**: 定期检查日志文件，监控异常访问

### 建议的安全措施
```bash
# 修改JWT密钥（编辑.env.production）
JWT_SECRET=your_strong_random_secret_key_here

# 配置防火墙（示例）
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --addport=443/tcp
firewall-cmd --reload
```

---

## 监控和维护

### 日志监控
```bash
# 实时查看API日志
tail -f /var/log/agent-monitor/api-out.log

# 实时查看WebSocket日志
tail -f /var/log/agent-monitor/ws-out.log

# 查看Nginx访问日志
tail -f /var/log/nginx/access.log

# 查看Nginx错误日志
tail -f /var/log/nginx/error.log
```

### 性能监控
```bash
# 查看PM2进程资源使用
pm2 monit

# 查看系统资源
top -p $(pm2 jlist | jq '.[].pid' | tr '\n' ',' | sed 's/,$//')
```

### 数据库维护
```bash
# 备份数据库
mysqldump -u agent_monitor -p agent_monitor_prod > backup_$(date +%Y%m%d).sql

# 查看数据库大小
mysql -u agent_monitor -p agent_monitor_prod -e "
  SELECT table_name AS 'Table',
         ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
  FROM information_schema.TABLES
  WHERE table_schema = 'agent_monitor_prod'
  ORDER BY (data_length + index_length) DESC;
"
```

---

## 更新和升级

### 更新后端代码
```bash
cd /root/.openclaw/dev-agent/archives/agent-monitor-system

# 拉取最新代码
git pull

# 重启服务
pm2 restart all
```

### 更新前端代码
```bash
cd /root/.openclaw/dev-agent/archives/agent-monitor-system/frontend

# 拉取最新代码
git pull

# 安装依赖
npm install

# 构建生产版本
npm run build

# 部署到Nginx
cp -r dist/* /var/www/agent-monitor/
chown -R nginx:nginx /var/www/agent-monitor

# 重启Nginx
systemctl restart nginx
```

---

## 联系和支持

如有问题，请联系开发团队或查看项目文档：
- 项目文档: /root/.openclaw/dev-agent/archives/agent-monitor-system/README.md
- 开发报告: /root/.openclaw/dev-agent/archives/agent-monitor-system/DEVELOPMENT_REPORT.md

---

## 部署总结

✅ **部署状态**: 成功完成
✅ **后端服务**: 运行正常
✅ **前端服务**: 运行正常
✅ **数据库**: 连接正常
✅ **进程守护**: PM2配置完成
✅ **反向代理**: Nginx配置完成
✅ **访问测试**: 全部通过

**系统已成功部署到生产环境，可以开始使用！**

---

*报告生成时间: 2026-03-11 14:54 (UTC+8)*
*部署人员: DevAgent (贾维斯)*
