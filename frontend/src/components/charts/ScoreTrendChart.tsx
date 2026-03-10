// 积分趋势折线图
import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card } from 'antd';
import { ChartData } from '../../types/agent';

interface ScoreTrendChartProps {
  data: ChartData[];
  title?: string;
  height?: number;
}

const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({
  data,
  title = '积分趋势',
  height = 300,
}) => {
  const option = {
    title: {
      text: title,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0];
        return `${param.axisValue}<br/>积分: ${param.value}`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map((d) => d.timestamp),
    },
    yAxis: {
      type: 'value',
      name: '积分',
    },
    series: [
      {
        name: '积分',
        type: 'line',
        smooth: true,
        data: data.map((d) => d.value),
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
            ],
          },
        },
        itemStyle: {
          color: '#1890ff',
        },
      },
    ],
  };

  return (
    <Card>
      <ReactECharts option={option} style={{ height: `${height}px` }} />
    </Card>
  );
};

export default ScoreTrendChart;
