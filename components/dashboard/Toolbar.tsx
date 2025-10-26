'use client';

import { useState } from 'react';
import type { ColumnMeta } from '@/lib/format';
import type { ChartType } from '@/lib/auto-chart-generator';

interface ToolbarProps {
  columns: ColumnMeta[];
  onChartChange: (type: ChartType, xColumn: string, yColumn: string) => void;
}

export default function Toolbar({ columns, onChartChange }: ToolbarProps) {
  const numericCols = columns.filter((c) => c.type === 'number');
  const allCols = columns;

  const [chartType, setChartType] = useState<ChartType>('bar');
  const [xColumn, setXColumn] = useState(allCols[0]?.name || '');
  const [yColumn, setYColumn] = useState(numericCols[0]?.name || '');

  const handleApply = () => {
    if (xColumn && yColumn) {
      onChartChange(chartType, xColumn, yColumn);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          نوع نمودار
        </label>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value as ChartType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="bar">میله‌ای</option>
          <option value="line">خطی</option>
          <option value="scatter">پراکنش</option>
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          محور X
        </label>
        <select
          value={xColumn}
          onChange={(e) => setXColumn(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {allCols.map((col) => (
            <option key={col.name} value={col.name}>
              {col.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          محور Y
        </label>
        <select
          value={yColumn}
          onChange={(e) => setYColumn(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {numericCols.map((col) => (
            <option key={col.name} value={col.name}>
              {col.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleApply}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        اعمال
      </button>
    </div>
  );
}