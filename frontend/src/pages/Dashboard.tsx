// 主Dashboard页面
import React, { useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Button, Space } from 'antd';
import {
  UserOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAgents, useTeamOverview } from '../hooks/useAgents';
import ScoreTrendChart from '../components/charts/ScoreTrendChart';
import ScoreDistributionChart from '../components/charts/ScoreDistributionChart';
import { wsService } from '../services/websocket';

const Dashboard: React.FC = () => {
  const { agents, loading, refetch } = useAgents();
  const { overview } = useTeamOverview();

  useEffect(() => {
    // 连接WebSocket
    wsService.connect();

    return () => {
      wsService.disconnect();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'default';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const sortedAgents = [...agents].sort((a, b) => b.score - a.score);

  const columns = [
    {
      title: '排名',
      key: 'rank',
      render: (_: any, __: any, index: number) => index + 1,
      width: 80,
    },
    {
      title: 'Agent名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Space>
          <UserOutlined />
          {name}
          <Tag color={getStatusColor(record.status)}>{record.status}</Tag>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '积分',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => (
        <Statistic value={score} valueStyle={{ fontSize: '16px' }} />
      ),
      sorter: (a: any, b: any) => b.score - a.score,
    },
    {
      title: '任务完成',
      dataIndex: 'tasksCompleted',
      key: 'tasksCompleted',
      render: (completed: number, record: any) => (
        <Space>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          {completed}
          <CloseCircleOutlined style={{ color: '#f5222d' }} />
          {record.tasksFailed}
        </Space>
      ),
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActive',
      key: 'lastActive',
      render: (time: string) => new Date(time).toLocaleString(),
    },
  ];

  // 模拟图表数据
  const trendData = Array.from({ length: 24 }, (_, i) => ({
    timestamp: `${i}:00`,
    value: 100 + Math.random() * 200,
  }));

  const distributionData = [
    { name: '优秀 (>200)', value: agents.filter((a) => a.score > 200).length },
    { name: '良好 (150-200)', value: agents.filter((a) => a.score >= 150 && a.score <= 200).length },
    { name: '一般 (100-150)', value: agents.filter((a) => a.score >= 100 && a.score < 150).length },
    { name: '需改进 (<100)', value: agents.filter((a) => a.score < 100).length },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总Agent数"
              value={overview?.totalAgents || agents.length}
              prefix={<TeamOutlined />}
              loading={!overview}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="在线Agent"
              value={overview?.onlineAgents || agents.filter((a) => a.status === 'online').length}
              prefix={<SyncOutlined spin />}
              valueStyle={{ color: '#3f8600' }}
              loading={!overview}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总积分"
              value={overview?.totalScore || agents.reduce((sum, a) => sum + a.score, 0)}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#cf1322' }}
              loading={!overview}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="任务完成率"
              value={
                overview?.totalTasksCompleted && overview?.totalTasksFailed
                  ? (
                      (overview.totalTasksCompleted /
                        (overview.totalTasksCompleted + overview.totalTasksFailed)) *
                      100
                    ).toFixed(1)
                  : '0'
              }
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
              loading={!overview}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={16}>
          <ScoreTrendChart data={trendData} title="24小时积分趋势" height={350} />
        </Col>
        <Col xs={24} lg={8}>
          <ScoreDistributionChart data={distributionData} title="积分分布" height={350} />
        </Col>
      </Row>

      <Card
        title="Agent排行榜"
        extra={
          <Button type="primary" onClick={refetch} icon={<SyncOutlined />}>
            刷新
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={sortedAgents}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
