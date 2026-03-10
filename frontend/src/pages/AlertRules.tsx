import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, InputNumber, message, Card, Switch, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

interface AlertRule {
  id: number;
  name: string;
  type: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high';
  enabled: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

const AlertRules: React.FC = () => {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [form] = Form.useForm();

  const API_BASE = 'http://localhost:3001/api';

  // 加载告警规则
  const loadRules = async () => {
    setLoading(true);
    try {
      // 暂时使用模拟数据，因为后端还没有实现告警规则API
      const mockRules: AlertRule[] = [
        {
          id: 1,
          name: 'Agent离线告警',
          type: 'agent_offline',
          condition: 'offline_duration',
          threshold: 300,
          severity: 'high',
          enabled: true,
          description: '当Agent离线超过5分钟时触发告警',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: '积分异常告警',
          type: 'score_anomaly',
          condition: 'score_change',
          threshold: 50,
          severity: 'medium',
          enabled: true,
          description: '当积分变化超过50分时触发告警',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          name: '任务失败率告警',
          type: 'high_failure_rate',
          condition: 'failure_rate',
          threshold: 0.5,
          severity: 'high',
          enabled: true,
          description: '当任务失败率超过50%时触发告警',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setRules(mockRules);
    } catch (error) {
      message.error('加载告警规则失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 打开新增/编辑弹窗
  const openModal = (rule: AlertRule | null = null) => {
    setEditingRule(rule);
    if (rule) {
      form.setFieldsValue(rule);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 保存规则
  const saveRule = async (values: any) => {
    try {
      // 暂时只更新前端状态
      if (editingRule) {
        // 编辑
        setRules(rules.map(r => r.id === editingRule.id ? { ...r, ...values, updated_at: new Date().toISOString() } : r));
        message.success('规则更新成功');
      } else {
        // 新增
        const newRule: AlertRule = {
          id: Date.now(),
          ...values,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setRules([...rules, newRule]);
        message.success('规则创建成功');
      }
      setModalVisible(false);
    } catch (error) {
      message.error('保存规则失败');
      console.error(error);
    }
  };

  // 删除规则
  const deleteRule = async (id: number) => {
    try {
      setRules(rules.filter(r => r.id !== id));
      message.success('规则删除成功');
    } catch (error) {
      message.error('删除规则失败');
      console.error(error);
    }
  };

  // 切换规则启用状态
  const toggleRule = async (id: number, enabled: boolean) => {
    try {
      setRules(rules.map(r => r.id === id ? { ...r, enabled, updated_at: new Date().toISOString() } : r));
      message.success(enabled ? '规则已启用' : '规则已禁用');
    } catch (error) {
      message.error('切换规则状态失败');
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
    return <span style={{ color: color === 'error' ? '#ff4d4f' : color === 'warning' ? '#faad14' : '#8c8c8c' }}>{text}</span>;
  };

  useEffect(() => {
    loadRules();
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          agent_offline: 'Agent离线',
          score_anomaly: '积分异常',
          high_failure_rate: '高失败率',
          high_response_time: '高响应时间',
          low_score: '低积分'
        };
        return typeMap[type] || type;
      }
    },
    {
      title: '条件',
      dataIndex: 'condition',
      key: 'condition',
      width: 150
    },
    {
      title: '阈值',
      dataIndex: 'threshold',
      key: 'threshold',
      width: 100
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => getSeverityTag(severity)
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled: boolean, record: AlertRule) => (
        <Switch
          checked={enabled}
          onChange={(checked) => toggleRule(record.id, checked)}
        />
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: AlertRule) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个规则吗？"
            onConfirm={() => deleteRule(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="告警规则配置"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            新增规则
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={rules}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            show: total => `共 ${total} 条`
          }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingRule ? '编辑告警规则' : '新增告警规则规则'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} onFinish={saveRule} layout="vertical">
          <Form.Item
            label="规则名称"
            name="name"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item
            label="告警类型"
            name="type"
            rules={[{ required: true, message: '请选择告警类型' }]}
          >
            <Select placeholder="请选择告警类型">
              <Option value="agent_offline">Agent离线</Option>
              <Option value="score_anomaly">积分异常</Option>
              <Option value="high_failure_rate">高失败率</Option>
              <Option value="high_response_time">高响应时间</Option>
              <Option value="low_score">低积分</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="条件"
            name="condition"
            rules={[{ required: true, message: '请输入条件' }]}
          >
            <Input placeholder="例如: offline_duration, score_change, failure_rate" />
          </Form.Item>
          <Form.Item
            label="阈值"
            name="threshold"
            rules={[{ required: true, message: '请输入阈值' }]}
          >
            <InputNumber placeholder="请输入阈值" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="严重程度"
            name="severity"
            rules={[{ required: true, message: '请选择严重程度' }]}
          >
            <Select placeholder="请选择严重程度">
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea rows={4} placeholder="请输入规则描述" />
          </Form.Item>
          <Form.Item
            label="启用"
            name="enabled"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AlertRules;
