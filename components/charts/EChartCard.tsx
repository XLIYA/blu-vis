'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { ChartType } from '@/lib/auto-chart-generator';
import { generateChartOption } from '@/lib/auto-chart-generator';
import { Download, Maximize2 } from 'lucide-react';
import Button from '@/components/ui/Button';

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
  onExport?: () => void;
  onFullscreen?: () => void;
}

export default function EChartCard({
  title,
  data,
  xColumn,
  yColumn,
  type,
  onExport,
  onFullscreen,
}: EChartCardProps) {
  const option = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        title: {
          text: 'داده‌ای برای نمایش وجود ندارد',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontFamily: 'Vazirmatn',
          },
        },
      };
    }

    return generateChartOption({
      type,
      xColumn,
      yColumn,
      title,
      data,
    });
  }, [data, xColumn, yColumn, type, title]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          {onExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="p-2"
              aria-label="دانلود چارت"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {onFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onFullscreen}
              className="p-2"
              aria-label="تمام صفحه"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ReactECharts 
          option={option} 
          style={{ height: '400px', width: '100%' }} 
          opts={{ renderer: 'canvas' }}
        />
      </CardContent>
    </Card>
  );
}