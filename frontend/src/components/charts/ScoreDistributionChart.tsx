// 积分分布饼图
import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card } from 'antd';

interface ScoreDistributionChartProps {
  data: { name: string; value: number }[];
  title?: string;
  height?: number;
}

const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({
  data,
  title = '积分分布',
  height = 300,
}) => {
  const option = {
    title: {
      text: title,
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '积分分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((d, i) => ({
          ...d,
          itemStyle: {
            color: [
              '#1890ff',
              '#52c41a',
              '#faad14',
              '#f5222d',
              '#722ed1',
            ][i % 5],
          },
        })),
      },
    ],
  };

  return (
    <Card>
      <ReactECharts option={option} style={{ height: `${height}px` }} />
    </Card>
  );
};

export default ScoreDistributionChart;
