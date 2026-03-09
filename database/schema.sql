-- Agent监测系统数据库脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS agent_monitor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agent_monitor;

-- 1. Agent基本信息表
CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(50) PRIMARY KEY COMMENT 'Agent唯一ID',
    name VARCHAR(100) NOT NULL COMMENT 'Agent名称',
    nickname VARCHAR(100) COMMENT 'Agent昵称',
    role VARCHAR(100) NOT NULL COMMENT 'Agent角色/职责',
    description TEXT COMMENT 'Agent详细描述',
    status ENUM('online', 'offline', 'warning', 'error') DEFAULT 'online' COMMENT 'Agent状态',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    last_seen DATETIME COMMENT '最后活跃时间',
    INDEX idx_status (status),
    INDEX idx_role (role)
) COMMENT='Agent基本信息表';

-- 2. Agent实时状态表
CREATE TABLE IF NOT EXISTS agent_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL COMMENT 'Agent唯一ID',
    cpu_usage DECIMAL(5,2) COMMENT 'CPU使用率(%)',
    memory_usage DECIMAL(5,2) COMMENT '内存使用率(%)',
    requests_per_minute INT COMMENT '每分钟请求数',
    success_rate DECIMAL(5,2) COMMENT '请求成功率(%)',
    uptime VARCHAR(50) COMMENT '运行时间',
    current_task VARCHAR(200) COMMENT '当前处理的任务',
    subagent_count INT DEFAULT 0 COMMENT '子Agent数量',
    is_communicating BOOLEAN DEFAULT FALSE COMMENT '是否在与其他Agent沟通',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '数据时间戳',
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    INDEX idx_agent_id (agent_id),
    INDEX idx_timestamp (timestamp)
) COMMENT='Agent实时状态表';

-- 3. Agent任务记录表
CREATE TABLE IF NOT EXISTS agent_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL COMMENT 'Agent唯一ID',
    task_id VARCHAR(50) COMMENT '任务ID',
    task_name VARCHAR(200) NOT NULL COMMENT '任务名称',
    task_type VARCHAR(100) COMMENT '任务类型',
    status ENUM('pending', 'running', 'completed', 'failed') COMMENT '任务状态',
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    duration INT COMMENT '任务持续时间(秒)',
    result TEXT COMMENT '任务结果',
    error_message TEXT COMMENT '错误信息',
    parent_task_id BIGINT COMMENT '父任务ID',
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_task_id) REFERENCES agent_tasks(id) ON DELETE CASCADE,
    INDEX idx_agent_id (agent_id),
    INDEX idx_task_id (task_id),
    INDEX idx_status (status)
) COMMENT='Agent任务记录表';

-- 4. Agent调用记录表
CREATE TABLE IF NOT EXISTS agent_invocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    caller_id VARCHAR(50) NOT NULL COMMENT '调用方Agent ID',
    callee_id VARCHAR(50) NOT NULL COMMENT '被调用方Agent ID',
    invocation_type VARCHAR(100) COMMENT '调用类型',
    status ENUM('success', 'failed', 'pending') COMMENT '调用状态',
    request TEXT COMMENT '请求内容',
    response TEXT COMMENT '响应内容',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '调用时间',
    duration INT COMMENT '调用持续时间(毫秒)',
    FOREIGN KEY (caller_id) REFERENCES agents(id) ON DELETE CASCADE,
    FOREIGN KEY (callee_id) REFERENCES agents(id) ON DELETE CASCADE,
    INDEX idx_caller_id (caller_id),
    INDEX idx_callee_id (callee_id),
    INDEX idx_timestamp (timestamp)
) COMMENT='Agent调用记录表';

-- 5. Agent沟通记录表
CREATE TABLE IF NOT EXISTS agent_communications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    from_agent_id VARCHAR(50) NOT NULL COMMENT '发送方Agent ID',
    to_agent_id VARCHAR(50) NOT NULL COMMENT '接收方Agent ID',
    communication_type VARCHAR(100) COMMENT '沟通类型',
    content TEXT COMMENT '沟通内容',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '沟通时间',
    status ENUM('sent', 'received', 'read') COMMENT '沟通状态',
    FOREIGN KEY (from_agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    FOREIGN KEY (to_agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    INDEX idx_from_agent_id (from_agent_id),
    INDEX idx_to_agent_id (to_agent_id),
    INDEX idx_timestamp (timestamp)
) COMMENT='Agent沟通记录表';

-- 6. Agent配置表
CREATE TABLE IF NOT EXISTS agent_configs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL COMMENT 'Agent唯一ID',
    config_key VARCHAR(100) NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    description VARCHAR(200) COMMENT '配置描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    UNIQUE KEY uk_agent_config (agent_id, config_key),
    INDEX idx_agent_id (agent_id)
) COMMENT='Agent配置表';

-- 插入初始Agent数据
INSERT INTO agents (id, name, nickname, role, description, status)
VALUES 
('agent-001', 'DevAgent', '开发特工', '软件开发专家', '负责代码开发、架构设计和代码质量保障', 'online'),
('agent-002', 'DataAgent', '数据分析师', '数据处理专家', '负责数据采集、分析和可视化', 'online'),
('agent-003', 'TestAgent', '测试专家', '软件测试工程师', '负责测试用例编写、自动化测试和质量保障', 'warning'),
('agent-004', 'OpsAgent', '运维达人', '系统运维工程师', '负责系统部署、监控和维护', 'online'),
('agent-005', 'PMAgent', '项目经理', '项目管理专家', '负责项目规划、进度跟踪和团队协调', 'online')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 插入初始状态数据
INSERT INTO agent_status (agent_id, cpu_usage, memory_usage, requests_per_minute, success_rate, uptime, current_task, subagent_count)
VALUES 
('agent-001', 45.5, 62.3, 150, 98.5, '2天12小时', '开发Agent监测系统前端', 2),
('agent-002', 32.1, 45.8, 89, 99.2, '1天8小时', '分析Agent性能数据', 1),
('agent-003', 88.9, 76.5, 45, 82.3, '3天5小时', '执行系统压力测试', 0),
('agent-004', 28.7, 39.2, 210, 99.8, '5天3小时', '监控系统运行状态', 3),
('agent-005', 38.2, 52.1, 125, 97.6, '4天12小时', '协调项目资源分配', 1)
ON DUPLICATE KEY UPDATE timestamp=CURRENT_TIMESTAMP;

-- 创建视图：Agent综合信息视图
DROP VIEW IF EXISTS agent_overview;
CREATE VIEW agent_overview AS
SELECT 
    a.id,
    a.name,
    a.nickname,
    a.role,
    a.status,
    s.cpu_usage,
    s.memory_usage,
    s.requests_per_minute,
    s.success_rate,
    s.uptime,
    s.current_task,
    s.subagent_count,
    s.is_communicating,
    a.last_seen,
    a.created_at
FROM agents a
LEFT JOIN agent_status s ON a.id = s.agent_id
ORDER BY a.status, a.name;

-- 创建存储过程：获取Agent实时状态
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS get_agent_status(
    IN p_agent_id VARCHAR(50)
)
BEGIN
    IF p_agent_id IS NULL OR p_agent_id = '' THEN
        SELECT * FROM agent_overview;
    ELSE
        SELECT * FROM agent_overview WHERE id = p_agent_id;
    END IF;
END //
DELIMITER ;

-- 创建事件：定期清理历史数据（保留7天）
DELIMITER //
CREATE EVENT IF NOT EXISTS clean_old_data
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP + INTERVAL 1 HOUR
DO
BEGIN
    DELETE FROM agent_status WHERE timestamp < NOW() - INTERVAL 7 DAY;
    DELETE FROM agent_invocations WHERE timestamp < NOW() - INTERVAL 30 DAY;
    DELETE FROM agent_communications WHERE timestamp < NOW() - INTERVAL 30 DAY;
END //
DELIMITER ;

-- 开启事件调度器
SET GLOBAL event_scheduler = ON;

-- 创建用户并授权
CREATE USER IF NOT EXISTS 'agent_monitor_user'@'localhost' IDENTIFIED BY 'AgentMonitor@123';
GRANT ALL PRIVILEGES ON agent_monitor.* TO 'agent_monitor_user'@'localhost';
FLUSH PRIVILEGES;

-- 输出提示信息
SELECT '数据库创建完成！' AS message;
SELECT 'Agent监测系统数据库已成功创建，包含以下表：' AS info;
SELECT '1. agents - Agent基本信息表' AS table_name;
SELECT '2. agent_status - Agent实时状态表' AS table_name;
SELECT '3. agent_tasks - Agent任务记录表' AS table_name;
SELECT '4. agent_invocations - Agent调用记录表' AS table_name;
SELECT '5. agent_communications - Agent沟通记录表' AS table_name;
SELECT '6. agent_configs - Agent配置表' AS table_name;
SELECT '用户信息：agent_monitor_user / AgentMonitor@123' AS user_info;