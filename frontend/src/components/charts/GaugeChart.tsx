// 目标达成仪表盘
import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card } from 'antd';

interface GaugeChartProps {
  value: number;
  title?: string;
  max?: number;
  height?: number;
  unit?: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  title = '目标达成',
  max = 100,
  height = 300,
  unit = '%',
}) => {
  const percentage = (value / max) * 100;

  const option = {
    title: {
      text: title,
      left: 'center',
    },
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: max,
        splitNumber: 8,
        itemStyle: {
          color: '#1890ff',
          shadowColor: 'rgba(0,138,255,0.45)',
          shadowBlur: 10,
          shadowOffsetX: 2,
          shadowOffsetY: 2,
        },
        progress: {
          show: true,
          roundCap: true,
          width: 18,
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '12%',
          width: 20,
          offsetCenter: [0, '-60%'],
          itemStyle: {
            color: 'auto',
          },
        },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 18,
          },
        },
        axisTick: {
          roundCap: true,
          splitNumber: 2,
          lineStyle: {
            width: 2,
          },
        },
        splitLine: {
          roundCap: true,
          lineStyle: {
            width: 4,
          },
        },
        axisLabel: {
          distance: 25,
          color: '#999',
          fontSize: 12,
        },
        detail: {
          valueAnimation: true,
          formatter: `{value}${unit}`,
          color: 'inherit',
          fontSize: 30,
          offsetCenter: [0, '70%'],
        },
        data: [
          {
            value: value,
            name: '当前值',
          },
        ],
      },
    ],
  };

  return (
    <Card>
      <ReactECharts option={option} style={{ height: `${height}px` }} />
    </Card>
  );
};

export default GaugeChart;
