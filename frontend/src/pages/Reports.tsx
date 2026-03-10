// 报表页面
import React, { useState } from 'react';
import {
  Card,
  Form,
  DatePicker,
  Select,
  Button,
  Table,
  Space,
  message,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { agentApi } from '../../services/api';
import { ReportFilter, ReportExport } from '../../types/agent';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const handleSearch = async (values: any) => {
    try {
      setLoading(true);
      const filter: ReportFilter = {
        timeRange: values.timeRange,
        startTime: values.dateRange?.[0]?.toISOString(),
        endTime: values.dateRange?.[1]?.toISOString(),
        agents: values.agents,
        types: values.types,
      };

      const result = await agentApi.generateReport(filter);
      setData(result);
      setFilteredData(result);
      message.success('报表生成成功');
    } catch (error) {
      message.error('报表生成失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const exportConfig: ReportExport = {
        format,
        data: filteredData,
        filename: `agent_report_${dayjs().format('YYYYMMDD_HHmmss')}.${format}`,
      };

      const blob = await agentApi.exportReport(exportConfig);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportConfig.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      message.success(`报表导出成功: ${exportConfig.filename}`);
    } catch (error) {
      message.error('报表导出失败');
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'Agent ID',
      dataIndex: 'agentId',
      key: 'agentId',
    },
    {
      title: 'Agent名称',
      dataIndex: 'agentName',
      key: 'agentName',
    },
    {
      title: '积分变化',
      dataIndex: 'scoreChange',
      key: 'scoreChange',
      render: (change: number) => (
        <span style={{ color: change >= 0 ? '#52c41a' : '#f5222d' }}>
          {change >= 0 ? '+' : ''}{change}
        </span>
      ),
    },
    {
      title: '任务完成数',
      dataIndex: 'tasksCompleted',
      key: 'tasksCompleted',
    },
    {
      title: '任务失败数',
      dataIndex: 'tasksFailed',
      key: 'tasksFailed',
    },
    {
      title: '平均CPU使用率',
      dataIndex: 'avgCpuUsage',
      key: 'avgCpuUsage',
      render: (value: number) => `${value.toFixed(2)}%`,
    },
    {
      title: '平均内存使用率',
      dataIndex: 'avgMemoryUsage',
      key: 'avgMemoryUsage',
      render: (value: number) => `${value.toFixed(2)}%`,
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time: string) => new Date(time).toLocaleString(),
    },
  ];

  const totalScoreChange = filteredData.reduce((sum, item) => sum + (item.scoreChange || 0), 0);
  const totalTasksCompleted = filteredData.reduce((sum, item) => sum + (item.tasksCompleted || 0), 0);
  const totalTasksFailed = filteredData.reduce((sum, item) => sum + (item.tasksFailed || 0), 0);

  return (
    <div style={{ padding: '24px' }}>
      <Card title="报表筛选" style={{ marginBottom: '24px' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
          initialValues={{
            timeRange: '24h',
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="时间范围" name="timeRange">
                <Select>
                  <Option value="1h">最近1小时</Option>
                  <Option value="24h">最近24小时</Option>
                  <Option value="7d">最近7天</Option>
                  <Option value="30d">最近30天</Option>
                  <Option value="custom">自定义</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="自定义时间" name="dateRange">
                <RangePicker showTime />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="Agent筛选" name="agents">
                <Select mode="multiple" placeholder="选择Agent" allowClear>
                  <Option value="dev-agent">贾维斯</Option>
                  <Option value="test-agent">Jojo</Option>
                  <Option value="ops-agent">蔡文姬</Option>
                  <Option value="pm-agent">小红</Option>
                  <Option value="data-agent">小李子</Option>
                </Select>
              </Form.Item.Item>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Form.Item label="操作">
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} block>
                  生成报表
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {filteredData.length > 0 && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="总积分变化"
                  value={totalScoreChange}
                  valueStyle={{ color: totalScoreChange >= 0 ? '#3f8600' : '#cf1322' }}
                  prefix={totalScoreChange >= 0 ? '+' : ''}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="总任务完成数"
                  value={totalTasksCompleted}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="总任务失败数"
                  value={totalTasksFailed}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>

          <Card
            title="报表数据"
            extra={
              <Space>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={() => handleExport('excel')}
                >
                  导出Excel
                </Button>
                <Button
                  icon={<FilePdfOutlined />}
                  onClick={() => handleExport('pdf')}
                >
                  导出PDF
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => handleExport('csv')}
                >
                  导出CSV
                </Button>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey={(record) => `${record.agentId}_${record.timestamp}`}
              loading={loading}
              pagination={{ pageSize: 20 }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default Reports;
