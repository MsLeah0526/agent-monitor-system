import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'agent_monitor',
  user: process.env.DB_USER || 'agent_monitor_user',
  password: process.env.DB_PASSWORD || 'AgentMonitor@123',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci'
});

async function initDatabase() {
  try {
    console.log('开始初始化Phase 2数据库表...');

    // 创建alerts表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent_id VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
        message TEXT NOT NULL,
        status ENUM('pending', 'acknowledged', 'resolved') DEFAULT 'pending',
        comment TEXT,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_agent_id (agent_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ alerts表创建成功');

    // 创建users表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ users表创建成功');

    // 创建alert_rules表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alert_rules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        condition VARCHAR(100) NOT NULL,
        threshold DECIMAL(10, 2) NOT NULL,
        severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
        enabled BOOLEAN DEFAULT TRUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ alert_rules表创建成功');

    // 创建agent_score_history表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agent_score_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent_id VARCHAR(255) NOT NULL,
        score INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_agent_id (agent_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ agent_score_history表创建成功');

    // 检查是否需要创建默认管理员用户
    const [users] = await pool.query('SELECT id FROM users WHERE username = ?', ['admin']);
    
    if (users.length === 0) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(
        'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 'admin@example.com', 'admin']
      );
      console.log('✅ 默认管理员用户创建成功 (admin/admin123)');
    } else {
      console.log('ℹ️  管理员用户已存在');
    }

    // 插入默认告警规则
    const [rules] = await pool.query('SELECT id FROM alert_rules');
    
    if (rules.length === 0) {
      await pool.query(`
        INSERT INTO alert_rules (name, type, condition, threshold, severity, enabled, description) VALUES
        ('Agent离线告警', 'agent_offline', 'offline_duration', 300, 'high', TRUE, '当Agent离线超过5分钟时触发告警'),
        ('积分异常告警', 'score_anomaly', 'score_change', 50, 'medium', TRUE, '当积分变化超过50分时触发告警'),
        ('任务失败率告警', 'high_failure_rate', 'failure_rate', 0.5, 'high', TRUE, '当任务失败率超过50%时触发告警')
      `);
      console.log('✅ 默认告警规则创建成功');
    } else {
      console.log('ℹ️  告警规则已存在');
    }

    console.log('\n🎉 Phase 2数据库初始化完成！');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
