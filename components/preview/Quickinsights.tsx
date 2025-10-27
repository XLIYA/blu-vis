'use client';

import { useMemo } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ColumnMeta } from '@/lib/format';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

interface QuickInsightsProps {
  data: any[];
  columns: ColumnMeta[];
}

interface Insight {
  type: 'success' | 'warning' | 'info' | 'trend';
  icon: React.ReactNode;
  title: string;
  description: string;
  value?: string;
}

export default function QuickInsights({ data, columns }: QuickInsightsProps) {
  const insights = useMemo<Insight[]>(() => {
    if (!data || data.length === 0 || !columns || columns.length === 0) {
      return [];
    }

    const insights: Insight[] = [];
    const numericColumns = columns.filter((c) => c.type === 'number');
    const categoricalColumns = columns.filter((c) => c.type === 'string');

    // 1. تعداد کل رکوردها
    insights.push({
      type: 'info',
      icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
      title: 'تعداد کل رکوردها',
      description: `مجموع ${data.length.toLocaleString('fa-IR')} ردیف داده`,
      value: data.length.toLocaleString('fa-IR'),
    });

    // 2. تعداد ستون‌ها
    insights.push({
      type: 'info',
      icon: <PieChart className="h-5 w-5 text-purple-500" />,
      title: 'تعداد ستون‌ها',
      description: `${columns.length} ستون شامل ${numericColumns.length} عددی و ${categoricalColumns.length} متنی`,
      value: columns.length.toString(),
    });

    // 3. بررسی مقادیر خالی
    let totalMissing = 0;
    data.forEach((row) => {
      Object.values(row).forEach((value) => {
        if (value === null || value === undefined || value === '') {
          totalMissing++;
        }
      });
    });

    if (totalMissing > 0) {
      const missingPercent = ((totalMissing / (data.length * columns.length)) * 100).toFixed(1);
      insights.push({
        type: 'warning',
        icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
        title: 'مقادیر مفقود',
        description: `${totalMissing.toLocaleString('fa-IR')} سلول خالی (${missingPercent}% کل داده)`,
        value: totalMissing.toLocaleString('fa-IR'),
      });
    } else {
      insights.push({
        type: 'success',
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        title: 'کیفیت داده عالی',
        description: 'هیچ مقدار مفقودی در داده وجود ندارد',
      });
    }

    // 4. بررسی تکراری‌ها
    const seen = new Set<string>();
    let duplicates = 0;
    data.forEach((row) => {
      const key = JSON.stringify(row);
      if (seen.has(key)) {
        duplicates++;
      } else {
        seen.add(key);
      }
    });

    if (duplicates > 0) {
      insights.push({
        type: 'warning',
        icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
        title: 'رکوردهای تکراری',
        description: `${duplicates.toLocaleString('fa-IR')} ردیف تکراری شناسایی شد`,
        value: duplicates.toLocaleString('fa-IR'),
      });
    }

    // 5. تحلیل ستون‌های عددی
    numericColumns.forEach((col) => {
      const values = data
        .map((row) => parseFloat(row[col.name]))
        .filter((v) => !isNaN(v) && v !== null);

      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;

        // روند (مقایسه نیمه اول با نیمه دوم)
        const mid = Math.floor(values.length / 2);
        const firstHalf = values.slice(0, mid);
        const secondHalf = values.slice(mid);
        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const trend = avgSecond > avgFirst;

        insights.push({
          type: 'trend',
          icon: trend ? (
            <TrendingUp className="h-5 w-5 text-green-500" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-500" />
          ),
          title: `تحلیل ${col.name}`,
          description: `میانگین: ${avg.toFixed(2)} | دامنه: ${min.toFixed(2)} تا ${max.toFixed(2)} | روند: ${trend ? 'صعودی' : 'نزولی'}`,
          value: avg.toFixed(2),
        });
      }
    });

    // 6. تنوع داده در ستون‌های دسته‌ای
    categoricalColumns.slice(0, 3).forEach((col) => {
      const uniqueValues = new Set(data.map((row) => row[col.name])).size;
      const diversity = ((uniqueValues / data.length) * 100).toFixed(1);

      insights.push({
        type: 'info',
        icon: <Info className="h-5 w-5 text-indigo-500" />,
        title: `تنوع ${col.name}`,
        description: `${uniqueValues.toLocaleString('fa-IR')} مقدار منحصر به فرد (${diversity}% تنوع)`,
        value: uniqueValues.toLocaleString('fa-IR'),
      });
    });

    return insights.slice(0, 8); // محدود به 8 بینش
  }, [data, columns]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          بینش‌های سریع
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    trend: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  };

  return (
    <div
      className={`p-4 rounded-lg border ${bgColors[insight.type]} transition-all hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{insight.icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
            {insight.title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {insight.description}
          </p>
          {insight.value && (
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
              {insight.value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}