'use client';

import Card, { CardContent } from '@/components/ui/Card';
import { Database, Columns3, Hash, Type, Calendar, ToggleLeft, AlertCircle, Copy } from 'lucide-react';
import type { DataStatistics } from '@/lib/data-mining';
import { formatNumber } from '@/lib/format';

interface StatsPanelProps {
  stats: DataStatistics;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const statItems = [
    {
      icon: <Database className="h-5 w-5 text-blue-500" />,
      label: 'تعداد ردیف‌ها',
      value: formatNumber(stats.totalRows, 0),
    },
    {
      icon: <Columns3 className="h-5 w-5 text-green-500" />,
      label: 'تعداد ستون‌ها',
      value: formatNumber(stats.totalColumns, 0),
    },
    {
      icon: <Hash className="h-5 w-5 text-purple-500" />,
      label: 'ستون‌های عددی',
      value: formatNumber(stats.numericColumns, 0),
    },
    {
      icon: <Type className="h-5 w-5 text-orange-500" />,
      label: 'ستون‌های متنی',
      value: formatNumber(stats.stringColumns, 0),
    },
    {
      icon: <Calendar className="h-5 w-5 text-teal-500" />,
      label: 'ستون‌های تاریخ',
      value: formatNumber(stats.dateColumns, 0),
    },
    {
      icon: <ToggleLeft className="h-5 w-5 text-indigo-500" />,
      label: 'ستون‌های boolean',
      value: formatNumber(stats.booleanColumns, 0),
    },
    {
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      label: 'مقادیر مفقود',
      value: formatNumber(stats.missingValues, 0),
    },
    {
      icon: <Copy className="h-5 w-5 text-red-500" />,
      label: 'ردیف‌های تکراری',
      value: formatNumber(stats.duplicateRows, 0),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, idx) => (
        <Card key={idx}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">{item.icon}</div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">{item.label}</p>
                <p className="text-xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}