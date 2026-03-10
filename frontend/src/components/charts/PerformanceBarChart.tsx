// 性能对比柱状图
import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card } from 'antd';

interface PerformanceBarChartProps {
  data: { name: string; cpu: number; memory: number; responseTime: number }[];
  title?: string;
  height?: number;
}

const PerformanceBarChart: React.FC<PerformanceBarChartProps> = ({
  data,
  title = '性能对比',
  height = 300,
}) => {
  const option = {
    title: {
      text: title,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['CPU使用率 (%)', '内存使用率 (%)', '响应时间 (ms)'],
      top: 30,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.name),
    },
    yAxis: {
      type: 'value',
      name: '数值',
    },
    series: [
      {
        name: 'CPU使用率 (%)',
        type: 'bar',
        data: data.map((d) => d.cpu),
        itemStyle: { color: '#1890ff' },
      },
      {
    name: '内存使用率 (%)',
        type: 'bar',
        data: data.map((d) => d.memory),
        itemStyle: { color: '#52c41a' },
      },
      {
        name: '响应时间 (ms)',
        type: 'bar',
        data: data.map((d) => d.responseTime),
        itemStyle: { color: '#faad14' },
      },
    ],
  };

  return (
    <Card>
      <ReactECharts option={option} style={{ height: `${height}px` }} />
    </Card>
  );
};

export default PerformanceBarChart;
