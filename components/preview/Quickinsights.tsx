'use client';

import { useMemo } from 'react';
import { Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { ColumnMeta } from '@/lib/format';
import type { Insight } from '@/stores/dataStore';
import { getFrequencyDistribution } from '@/lib/data-mining';

interface QuickInsightsProps {
  data: any[];
  columns: ColumnMeta[];
}

export default function QuickInsights({ data, columns }: QuickInsightsProps) {
  const insights = useMemo(() => {
    const results: Insight[] = [];

    if (data.length === 0) return results;

    // بررسی مقادیر مفقود
    let totalMissing = 0;
    data.forEach((row) => {
      Object.values(row).forEach((val) => {
        if (val === null || val === undefined || val === '') {
          totalMissing++;
        }
      });
    });

    const missingPercent = (totalMissing / (data.length * columns.length)) * 100;

    if (missingPercent > 10) {
      results.push({
        type: 'warning',
        title: 'مقادیر مفقود زیاد',
        description: `${missingPercent.toFixed(1)}% از داده‌ها خالی هستند`,
      });
    } else if (missingPercent > 0) {
      results.push({
        type: 'info',
        title: 'مقادیر مفقود',
        description: `${missingPercent.toFixed(1)}% از داده‌ها خالی هستند`,
      });
    }

    // بررسی تنوع داده در ستون‌های متنی
    const stringColumns = columns.filter((c) => c.type === 'string');
    if (stringColumns.length > 0) {
      const firstStringCol = stringColumns[0].name;
      const uniqueValues = new Set(data.map((row) => row[firstStringCol])).size;
      const uniquePercent = (uniqueValues / data.length) * 100;

      if (uniquePercent < 10) {
        const topValues = getFrequencyDistribution(data, firstStringCol, 3);
        results.push({
          type: 'info',
          title: `ستون "${firstStringCol}" تنوع کمی دارد`,
          description: `فقط ${uniqueValues} مقدار منحصر‌به‌فرد. رایج‌ترین: ${topValues.map((v) => v.value).join('، ')}`,
        });
      }
    }

    // بررسی ستون‌های عددی
    const numericColumns = columns.filter((c) => c.type === 'number');
    if (numericColumns.length > 0) {
      results.push({
        type: 'success',
        title: 'ستون‌های عددی شناسایی شدند',
        description: `${numericColumns.length} ستون عددی برای تحلیل آماری موجود است`,
      });
    }

    // بررسی تعداد ردیف‌ها
    if (data.length > 10000) {
      results.push({
        type: 'info',
        title: 'دیتاست بزرگ',
        description: `${data.length.toLocaleString('fa-IR')} ردیف - محاسبات ممکن است کمی زمان‌بر باشند`,
      });
    }

    return results.slice(0, 5); // حداکثر 5 بینش
  }, [data, columns]);

  if (insights.length === 0) {
    return null;
  }

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <Lightbulb className="h-5 w-5 text-blue-500" />,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          بینش‌های سریع
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              {icons[insight.type]}
              <div className="flex-1">
                <h4 className="font-medium text-sm text-gray-900">
                  {insight.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {insight.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}