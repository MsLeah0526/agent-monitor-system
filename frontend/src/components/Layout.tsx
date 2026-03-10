// 布局组件
import React from 'react';
import { Layout, Menu, theme, Dropdown, Avatar, Space } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined,
  BellFilled,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/auth';

const { Header, Sider, Content } = Layout;

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const currentUser = getCurrentUser();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/agents',
      icon: <UserOutlined />,
      label: 'Agents',
    },
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: '报表',
    },
    {
      key: '/alerts',
      icon: <BellOutlined />,
      label: '告警',
    },
    {
      key: '/alert-rules',
      icon: <BellFilled />,
      label: '告警规则',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === '/agents') {
      navigate('/dashboard');
    } else {
      navigate(key);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 16 : 20,
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'AMS' : 'Agent Monitor'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center' }}>
          {React.createElement(
            collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
            {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
              style: { fontSize: 20, cursor: 'pointer' },
            }
          )}
          <div style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
            Agent监控系统
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{currentUser?.username || 'User'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: '0', overflow: 'auto' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
