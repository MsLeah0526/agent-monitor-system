import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'agent_monitor',
  charset: 'utf8mb4_unicode_ci'
};

async function initDatabase() {
  let connection;
  try {
    console.log('🔧 开始初始化数据库...');

    // 连接到MySQL服务器（不指定数据库）
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      charset: 'utf8mb4_unicode_ci'
    });

    // 创建数据库
    console.log('📦 创建数据库...');
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );

    // 切换到目标数据库
    await connection.changeUser({ database: dbConfig.database });

    // 创建agents表
    console.log('📋 创建agents表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS agents (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(100) NOT NULL,
        emoji VARCHAR(10),
        workspace VARCHAR(255),
        description TEXT,
        status ENUM('online', 'warning', 'offline') DEFAULT 'online',
        score INT DEFAULT 100,
        priority ENUM('Elite', 'High', 'Normal', 'Low', 'Warning', 'Critical') DEFAULT 'Normal',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_score (score)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建agent_status表
    console.log('📊 创建agent_status表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS agent_status (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent_id VARCHAR(50) NOT NULL,
        cpu_usage DECIMAL(5,2),
        memory_usage DECIMAL(5,2),
        requests_per_minute INT,
        success_rate DECIMAL(5,2),
        current_task VARCHAR(255),
        subagent_count INT DEFAULT 0,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
        INDEX idx_agent_id (agent_id),
        INDEX idx_timestamp (timestamp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建agent_tasks表
    console.log('📝 创建agent_tasks表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS agent_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent_id VARCHAR(50) NOT NULL,
        task_name VARCHAR(255) NOT NULL,
        task_type VARCHAR(100),
        status ENUM('pending', 'running', 'completed', 'failed') DEFAULT 'pending',
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP NULL,
        duration INT,
        error_message TEXT,
        FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
        INDEX idx_agent_id (agent_id),
        INDEX idx_status (status),
        INDEX idx_start_time (start_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建agent_invocations表
    console.log('🔄 创建agent_invocations表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS agent_invocations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        caller_id VARCHAR(50) NOT NULL,
        callee_id VARCHAR(50) NOT NULL,
        invocation_type VARCHAR(100),
        status ENUM('success', 'failed') DEFAULT 'success',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        duration INT,
        error_message TEXT,
        FOREIGN KEY (caller_id) REFERENCES agents(id) ON DELETE CASCADE,
        FOREIGN KEY (callee_id) REFERENCES agents(id) ON DELETE CASCADE,
        INDEX idx_caller_id (caller_id),
        INDEX idx_callee_id (callee_id),
        INDEX idx_timestamp (timestamp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建agent_communications表
    console.log('💬 创建agent_communications表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS agent_communications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        from_agent_id VARCHAR(50) NOT NULL,
        to_agent_id VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        channel VARCHAR(100),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_agent_id) REFERENCES agents(id) ON DELETE CASCADE,
        FOREIGN KEY (to_agent_id) REFERENCES agents(id) ON DELETE CASCADE,
        INDEX idx_from_agent_id (from_agent_id),
        INDEX idx_to_agent_id (to_agent_id),
        INDEX idx_timestamp (timestamp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建agent_overview视图
    console.log('👁️ 创建agent_overview视图...');
    await connection.execute(`
      CREATE OR REPLACE VIEW agent_overview AS
      SELECT
        a.id,
        a.name,
        a.role,
        a.emoji,
        a.status,
        a.score,
        a.priority,
        a.last_seen,
        s.cpu_usage,
        s.memory_usage,
        s.requests_per_minute,
        s.success_rate,
        s.current_task,
        s.subagent_count,
        (SELECT COUNT(*) FROM agent_tasks WHERE agent_id = a.id AND status = 'running') as running_tasks,
        (SELECT COUNT(*) FROM agent_tasks WHERE agent_id = a.id AND DATE(start_time) = CURDATE()) as today_tasks,
        (SELECT COUNT(*) FROM agent_invocations WHERE caller_id = a.id AND DATE(timestamp) = CURDATE()) as today_invocations
      FROM agents a
      LEFT JOIN agent_status s ON a.id = s.agent_id AND s.id = (
        SELECT MAX(id) FROM agent_status WHERE agent_id = a.id
      )
    `);

    console.log('✅ 数据库初始化完成！');
    console.log(`📦 数据库名称: ${dbConfig.database}`);
    console.log(`🌐 主机: ${dbConfig.host}`);

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 运行初始化
initDatabase().catch(console.error);
