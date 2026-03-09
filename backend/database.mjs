import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// 数据库连接池
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

// 测试连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
  }
}

testConnection();

export default pool;