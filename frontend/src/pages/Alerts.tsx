import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, Form, Select, Input, message, Card, Row, Col, Statistic } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

interface Alert {
  id: number;
  agent_id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  status: 'pending' | 'acknowledged' | 'resolved';
  comment?: string;
  created_at: string;
  updated_at: string;
}

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusForm] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    acknowledged: 0,
    resolved: 0
  });

  const API_BASE = 'http://localhost:3001/api';

  // 加载告警列表
  const loadAlerts = async (status: string = 'all') => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/alerts?status=${status}`);
      if (response.data.success) {
        setAlerts(response.data.data);
        updateStats(response.data.data);
      }
    } catch (error) {
      message.error('加载告警列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 更新统计信息
  const updateStats = (data: Alert[]) => {
    setStats({
      total: data.length,
      pending: data.filter(a => a.status === 'pending').length,
      acknowledged: data.filter(a => a.status === 'acknowledged').length,
      resolved: data.filter(a => a.status === 'resolved').length
    });
  };

  // 查看告警详情
  const viewDetail = async (alertId: number) => {
    try {
      const response = await axios.get(`${API_BASE}/alerts/${alertId}`);
      if (response.data.success) {
        setSelectedAlert(response.data.data);
        setDetailModalVisible(true);
      }
    } catch (error) {
      message.error('获取告警详情失败');
      console.error(error);
    }
  };

  // 打开状态更新弹窗
  const openStatusModal = (alert: Alert) => {
    setSelectedAlert(alert);
    statusForm.setFieldsValue({
      status: alert.status,
      comment: alert.comment || ''
    });
    setStatusModalVisible(true);
  };

  // 更新告警状态
  const updateStatus = async (values: any) => {
    if (!selectedAlert) return;

    try {
      const response = await axios.put(`${API_BASE}/alerts/${selectedAlert.id}/status`, values);
      if (response.data.success) {
        message.success('告警状态更新成功');
        setStatusModalVisible(false);
        loadAlerts();
      }
    } catch (error) {
      message.error('更新告警状态失败');
      console.error(error);
    }
  };

  // 获取严重程度标签
  const getSeverityTag = (severity: string) => {
    const config = {
      low: { color: 'default', text: '低' },
      medium: { color: 'warning', text: '中' },
      high: { color: 'error', text: '高' }
    };
    const { color, text } = config[severity as keyof typeof config] || config.low;
    return <Tag color={color}>{text}</Tag>;
  };

  // 获取状态标签
  const getStatusTag = (status: string) => {
    const config = {
      pending: { color: 'orange', text: '待处理' },
      acknowledged: { color: 'blue', text: '已确认' },
      resolved: { color: 'green', text: '已解决' }
    };
    const { color, text } = config[status as keyof typeof config] || config.pending;
    return <Tag color={color}>{text}</Tag>;
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: 'Agent ID',
      dataIndex: 'agent_id',
      key: 'agent_id',
      width: 150
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => getSeverityTag(severity)
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status)
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (time: string) => new Date(time).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Alert) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => viewDetail(record.id)}
          >
            查看
          </Button>
          <Button
            type="link"
            onClick={() => openStatusModal(record)}
          >
            处理
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic title="总告警数" value={stats.total} />
          </Col>
          <Col span={6}>
            <Statistic title="待处理" value={stats.pending} valueStyle={{ color: '#faad14' }} />
          </Col>
          <Col span={6}>
            <Statistic title="已确认" value={stats.acknowledged} valueStyle={{ color: '#1890ff' }} />
          </Col>
          <Col span={6}>
            <Statistic title="已解决" value={stats.resolved} valueStyle={{ color: '#52c41a' }} />
          </Col>
        </Row>

        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ReloadOutlined />} onClick={() => loadAlerts()}>
            刷新
          </Button>
          <Button onClick={() => loadAlerts('pending')}>
            待处理
          </Button>
          <Button onClick={() => loadAlerts('acknowledged')}>
            已确认
          </Button>
          <Button onClick={() => loadAlerts('resolved')}>
            已解决
          </Button>
          <Button onClick={() => loadAlerts('all')}>
            全部
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={alerts}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="告警详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedAlert && (
          <div>
            <p><strong>ID:</strong> {selectedAlert.id}</p>
            <p><strong>Agent ID:</strong> {selectedAlert.agent_id}</p>
            <p><strong>类型:</strong> {selectedAlert.type}</p>
            <p><strong>严重程度:</strong> {getSeverityTag(selectedAlert.severity)}</p>
            <p><strong>状态:</strong> {getStatusTag(selectedAlert.status)}</p>
            <p><strong>消息:</strong> {selectedAlert.message}</p>
            {selectedAlert.comment && (
              <p><strong>备注:</strong> {selectedAlert.comment}</p>
            )}
            <p><strong>创建时间:</strong> {new Date(selectedAlert.created_at).toLocaleString('zh-CN')}</p>
            <p><strong>更新时间:</strong> {new Date(selectedAlert.updated_at).toLocaleString('zh-CN')}</p>
          </div>
        )}
      </Modal>

      {/* 状态更新弹窗 */}
      <Modal
        title="更新告警状态"
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        onOk={() => statusForm.submit()}
      >
        <Form form={statusForm} onFinish={updateStatus} layout="vertical">
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="pending">待处理</Option>
              <Option value="acknowledged">已确认</Option>
              <Option value="resolved">已解决</Option>
            </Select>
          </Form.Item>
          <Form.Item label="备注" name="comment">
            <Input.TextArea rows={4} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Alerts;
