// Agent详情页
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Descriptions,
  Tag,
  Statistic,
  Table,
  Button,
  Space,
  Alert,
  Tabs,
} from 'antd';
import {
  UserOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { agentApi } from '../services/api';
import { AgentDetail } from '../types/agent';
import ScoreTrendChart from '../components/charts/ScoreTrendChart';
import PerformanceBarChart from '../components/charts/PerformanceBarChart';
import GaugeChart from '../components/charts/GaugeChart';

const AgentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchAgentDetail(id);
    }
  }, [id]);

  const fetchAgentDetail = async (agentId: string) => {
    try {
      setLoading(true);
      const data = await agentApi.getAgentDetail(agentId);
      setAgent(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch agent detail');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading...</div>;
  }

  if (error || !agent) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert message={error || 'Agent not found'} type="error" />
      </div>
    );
  }

  const taskColumns = [
    {
      title: '任务ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'completed' ? 'success' : status === 'failed' ? 'error' : 'default';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (time: string) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: '耗时(秒)',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => duration ? duration.toFixed(2) : '-',
    },
  ];

  const alertColumns = [
    {
      title: '告警ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          offline: '离线',
          score: '积分异常',
          performance: '性能异常',
          task: '任务失败',
        };
        return typeMap[type] || type;
      },
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        const color = severity === 'error' ? 'error' : severity === 'warning' ? 'warning' : 'default';
        return <Tag color={color}>{severity}</Tag>;
      },
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'resolved',
      key: 'resolved',
      render: (resolved: boolean) => (
        <Tag color={resolved ? 'success' : 'default'}>
          {resolved ? '已解决' : '未解决'}
        </Tag>
      ),
    },
  ];

  const trendData = agent.history.map((h) => ({
    timestamp: new Date(h.timestamp).toLocaleTimeString(),
    value: h.score,
  }));

  const performanceData = [
    {
      name: '当前',
      cpu: agent.performance.cpuUsage,
      memory: agent.performance.memoryUsage,
      responseTime: agent.performance.responseTime,
    },
  ];

  const taskCompletionRate =
    agent.tasksCompleted + agent.tasksFailed > 0
      ? (agent.tasksCompleted / (agent.tasksCompleted + agent.tasksFailed)) * 100
      : 0;

  return (
    <div style={{ padding: '24px' }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => window.history.back()}
        style={{ marginBottom: '16px' }}
      >
        返回
      </Button>

      <Card title="Agent基本信息" style={{ marginBottom: '24px' }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Agent ID">{agent.id}</Descriptions.Item>
          <Descriptions.Item label="名称">
            <Space>
              <UserOutlined />
              {agent.name}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="角色">{agent.role}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={agent.status === 'online' ? 'success' : agent.status === 'error' ? 'error' : 'default'}>
              {agent.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="积分">
            <Space>
              <TrophyOutlined />
              {agent.score}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="最后活跃">
            <Space>
              <ClockCircleOutlined />
              {new Date(agent.lastActive).toLocaleString()}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="任务完成"
              value={agent.tasksCompleted}
              prefix={<CheckOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="任务失败"
              value={agent.tasksFailed}
              prefix={<CloseOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="CPU使用率"
              value={agent.performance.cpuUsage}
              suffix="%"
              precision={1}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="内存使用率"
              value={agent.performance.memoryUsage}
              suffix="%"
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="trend" items={[
        {
          key: 'trend',
          label: '积分趋势',
          children: <ScoreTrendChart data={trendData} title="积分历史趋势" height={400} />,
        },
        {
          key: 'performance',
          label: '性能分析',
          children: <PerformanceBarChart data={performanceData} title="性能指标" height={400} />,
        },
        {
          key: 'completion',
          label: '目标达成',
          children: <GaugeChart value={taskCompletionRate} title="任务完成率" max={100} height={400} />,
        },
      ]} style={{ marginBottom: '24px' }} />

      <Card title="任务列表" style={{ marginBottom: '24px' }}>
        <Table
          columns={taskColumns}
          dataSource={agent.tasks}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Card title="告警记录">
        <Table
          columns={alertColumns}
          dataSource={agent.alerts}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default AgentDetail;
