'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { ChartType } from '@/lib/auto-chart-generator';

const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  ),
});

interface EChartCardProps {
  title: string;
  data: any[];
  xColumn: string;
  yColumn: string;
  type: ChartType;
}

export default function EChartCard({
  title,
  data,
  xColumn,
  yColumn,
  type,
}: EChartCardProps) {
  const option = useMemo(() => {
    if (!data || data.length === 0) return {};

    // محدود کردن به 100 نقطه برای عملکرد بهتر
    const sampleData = data.slice(0, 100);

    const xData = sampleData.map((row) => row[xColumn] ?? '');
    const yData = sampleData.map((row) => {
      const val = parseFloat(row[yColumn]);
      return isNaN(val) ? 0 : val;
    });

    const baseOption = {
      title: {
        text: title,
        textStyle: { fontFamily: 'Vazirmatn' },
      },
      tooltip: {
        trigger: type === 'scatter' ? 'item' : 'axis',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: type === 'scatter' ? 'value' : 'category',
        data: type === 'scatter' ? undefined : xData,
        name: xColumn,
      },
      yAxis: {
        type: 'value',
        name: yColumn,
      },
    };

    if (type === 'bar') {
      return {
        ...baseOption,
        series: [
          {
            type: 'bar',
            data: yData,
            itemStyle: { color: '#3b82f6' },
          },
        ],
      };
    }

    if (type === 'line') {
      return {
        ...baseOption,
        series: [
          {
            type: 'line',
            data: yData,
            smooth: true,
            itemStyle: { color: '#10b981' },
          },
        ],
      };
    }

    if (type === 'scatter') {
      const scatterData = sampleData.map((row) => {
        const x = parseFloat(row[xColumn]);
        const y = parseFloat(row[yColumn]);
        return [isNaN(x) ? 0 : x, isNaN(y) ? 0 : y];
      });

      return {
        ...baseOption,
        series: [
          {
            type: 'scatter',
            data: scatterData,
            itemStyle: { color: '#8b5cf6' },
          },
        ],
      };
    }

    return baseOption;
  }, [data, xColumn, yColumn, type, title]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: '400px' }} />
      </CardContent>
    </Card>
  );
}