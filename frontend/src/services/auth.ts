import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
});

// 请求拦截器 - 自动添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理token过期
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * 登录
 */
export async function login(username: string, password: string) {
  const response = await api.post('/auth/login', { username, password });
  if (response.data.success) {
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { success: true, user };
  }
  return { success: false };
}

/**
 * 登出
 */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

/**
 * 获取当前用户
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
}

/**
 * 检查是否已登录
 */
export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

export default api;
