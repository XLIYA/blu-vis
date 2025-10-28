'use client';

import { useMemo } from 'react';
import Card, { CardContent } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import type { ColumnMeta } from '@/lib/format';

interface QuickInsightsProps {
  data: any[];
  columns: ColumnMeta[];
}

export default function QuickInsights({ data, columns }: QuickInsightsProps) {
  const insights = useMemo(() => {
    if (!data || data.length === 0) return [];

    const numericColumns = columns.filter((col) => col.type === 'number');
    const results = [];

    // تعداد ردیف‌ها و ستون‌ها
    results.push({
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      label: 'کل داده‌ها',
      value: `${data.length.toLocaleString('fa-IR')} × ${columns.length}`,
      color: 'green',
    });

    // مقادیر خالی
    const emptyCount = data.reduce((sum, row) => {
      return (
        sum +
        columns.filter((col) => {
          const value = row[col.name];
          return value === null || value === undefined || value === '';
        }).length
      );
    }, 0);

    const emptyPercent = ((emptyCount / (data.length * columns.length)) * 100).toFixed(1);
    
    results.push({
      icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
      label: 'مقادیر خالی',
      value: `${emptyPercent}%`,
      color: 'amber',
    });

    // بیشترین و کمترین مقدار
    if (numericColumns.length > 0) {
      const firstNumCol = numericColumns[0];
      const values = data
        .map((row) => parseFloat(row[firstNumCol.name]))
        .filter((val) => !isNaN(val));

      if (values.length > 0) {
        const maxVal = Math.max(...values);
        const minVal = Math.min(...values);

        results.push({
          icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
          label: `بیشترین ${firstNumCol.name}`,
          value: maxVal.toLocaleString('fa-IR'),
          color: 'blue',
        });

        results.push({
          icon: <TrendingDown className="h-5 w-5 text-purple-500" />,
          label: `کمترین ${firstNumCol.name}`,
          value: minVal.toLocaleString('fa-IR'),
          color: 'purple',
        });
      }
    }

    return results.slice(0, 4);
  }, [data, columns]);

  if (insights.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {insights.map((insight, index) => (
        <Card key={index} className="border-2">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              {insight.icon}
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {insight.label}
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {insight.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}