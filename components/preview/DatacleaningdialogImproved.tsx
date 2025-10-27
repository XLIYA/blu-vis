'use client';

import { useState, type ReactNode } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/toast';
import { useDataStore } from '@/stores/dataStore';
import { inferColumnTypes } from '@/lib/format';
import {
  Trash2,
  Replace,
  TrendingUp,
  Zap,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface DataCleaningDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CleaningMethod {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  action: () => void;
  category: 'basic' | 'advanced';
}

export default function DataCleaningDialog({
  isOpen,
  onClose,
}: DataCleaningDialogProps) {
  const { data, columns, setData } = useDataStore();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cleaningLog, setCleaningLog] = useState<string[]>([]);

  const addToLog = (message: string) => {
    setCleaningLog((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString('fa-IR')}: ${message}`,
    ]);
  };

  // حذف ردیف‌های تکراری
  const removeDuplicates = () => {
    setIsProcessing(true);
    const seen = new Set<string>();
    const uniqueData = data.filter((row) => {
      const key = JSON.stringify(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const removed = data.length - uniqueData.length;
    setData({ data: uniqueData, rows: uniqueData.length });
    showToast('success', `${removed} ردیف تکراری حذف شد`);
    addToLog(`حذف ${removed} ردیف تکراری - روش: مقایسه کامل ردیف‌ها`);
    setIsProcessing(false);
  };

  // پر کردن با مقدار پیش‌فرض
  const fillMissingWithDefault = () => {
    setIsProcessing(true);
    let filledCount = 0;
    const cleanedData = data.map((row) => {
      const newRow: any = {};
      columns.forEach((col) => {
        const value = row[col.name];
        if (value === null || value === undefined || value === '') {
          newRow[col.name] = col.type === 'number' ? 0 : '-';
          filledCount++;
        } else {
          newRow[col.name] = value;
        }
      });
      return newRow;
    });

    setData({ data: cleanedData });
    showToast('success', `${filledCount} سلول با مقدار پیش‌فرض پر شد`);
    addToLog(
      `پر کردن ${filledCount} سلول خالی - روش: مقدار پیش‌فرض (0 برای اعداد، "-" برای متن)`
    );
    setIsProcessing(false);
  };

  // پر کردن با میانگین
  const fillMissingWithMean = () => {
    setIsProcessing(true);
    const means: Record<string, number> = {};
    let filledCount = 0;

    columns
      .filter((c) => c.type === 'number')
      .forEach((col) => {
        const values = data
          .map((row) => parseFloat(row[col.name]))
          .filter((v) => !isNaN(v));
        means[col.name] =
          values.length > 0
            ? values.reduce((sum, v) => sum + v, 0) / values.length
            : 0;
      });

    const cleanedData = data.map((row) => {
      const newRow: any = {};
      columns.forEach((col) => {
        const value = row[col.name];
        if (value === null || value === undefined || value === '') {
          if (col.type === 'number' && means[col.name] !== undefined) {
            newRow[col.name] = means[col.name].toFixed(2);
            filledCount++;
          } else {
            newRow[col.name] = '-';
            filledCount++;
          }
        } else {
          newRow[col.name] = value;
        }
      });
      return newRow;
    });

    setData({ data: cleanedData });
    showToast('success', `${filledCount} سلول با میانگین/پیش‌فرض پر شد`);
    addToLog(
      `پر کردن ${filledCount} سلول - روش: میانگین حسابی (Mean) برای ستون‌های عددی`
    );
    setIsProcessing(false);
  };

  // پر کردن با میانه
  const fillMissingWithMedian = () => {
    setIsProcessing(true);
    const medians: Record<string, number> = {};
    let filledCount = 0;

    columns
      .filter((c) => c.type === 'number')
      .forEach((col) => {
        const values = data
          .map((row) => parseFloat(row[col.name]))
          .filter((v) => !isNaN(v))
          .sort((a, b) => a - b);

        if (values.length > 0) {
          const mid = Math.floor(values.length / 2);
          medians[col.name] =
            values.length % 2 === 0
              ? (values[mid - 1] + values[mid]) / 2
              : values[mid];
        } else {
          medians[col.name] = 0;
        }
      });

    const cleanedData = data.map((row) => {
      const newRow: any = {};
      columns.forEach((col) => {
        const value = row[col.name];
        if (value === null || value === undefined || value === '') {
          if (col.type === 'number' && medians[col.name] !== undefined) {
            newRow[col.name] = medians[col.name].toFixed(2);
            filledCount++;
          } else {
            newRow[col.name] = '-';
          }
        } else {
          newRow[col.name] = value;
        }
      });
      return newRow;
    });

    setData({ data: cleanedData });
    showToast('success', `${filledCount} سلول با میانه پر شد`);
    addToLog(
      `پر کردن ${filledCount} سلول - روش: میانه (Median) - مقاوم در برابر outlier‌ها`
    );
    setIsProcessing(false);
  };

  // حذف ردیف‌های ناقص
  const removeRowsWithTooManyNulls = () => {
    setIsProcessing(true);
    const threshold = columns.length * 0.5;

    const cleanedData = data.filter((row) => {
      let nullCount = 0;
      Object.values(row).forEach((val) => {
        if (val === null || val === undefined || val === '') {
          nullCount++;
        }
      });
      return nullCount < threshold;
    });

    const removed = data.length - cleanedData.length;
    setData({ data: cleanedData, rows: cleanedData.length });
    showToast('success', `${removed} ردیف با داده ناقص حذف شد`);
    addToLog(`حذف ${removed} ردیف - روش: حذف ردیف‌های با بیش از 50% داده مفقود`);
    setIsProcessing(false);
  };

  // حذف outlier ها با IQR
  const removeOutliers = () => {
    setIsProcessing(true);
    let removedCount = 0;

    const numericColumns = columns.filter((c) => c.type === 'number');
    const outlierIndices = new Set<number>();

    numericColumns.forEach((col) => {
      const values = data
        .map((row, idx) => ({ value: parseFloat(row[col.name]), index: idx }))
        .filter(({ value }) => !isNaN(value))
        .sort((a, b) => a.value - b.value);

      if (values.length < 4) return;

      const q1Index = Math.floor(values.length * 0.25);
      const q3Index = Math.floor(values.length * 0.75);
      const q1 = values[q1Index].value;
      const q3 = values[q3Index].value;
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;

      values.forEach(({ value, index }) => {
        if (value < lowerBound || value > upperBound) {
          outlierIndices.add(index);
        }
      });
    });

    const cleanedData = data.filter((_, idx) => !outlierIndices.has(idx));
    removedCount = outlierIndices.size;

    setData({ data: cleanedData, rows: cleanedData.length });
    showToast('success', `${removedCount} outlier حذف شد`);
    addToLog(
      `حذف ${removedCount} ردیف - روش: IQR (Interquartile Range) - شناسایی و حذف داده‌های پرت`
    );
    setIsProcessing(false);
  };

  const cleaningMethods: CleaningMethod[] = [
    {
      id: 'duplicates',
      name: 'حذف تکراری‌ها',
      description: 'ردیف‌های کاملاً مشابه را حذف می‌کند',
      icon: <Trash2 className="h-5 w-5" />,
      action: removeDuplicates,
      category: 'basic',
    },
    {
      id: 'default',
      name: 'پر کردن با پیش‌فرض',
      description: 'سلول‌های خالی را با مقدار پیش‌فرض (0 یا "-") پر می‌کند',
      icon: <Replace className="h-5 w-5" />,
      action: fillMissingWithDefault,
      category: 'basic',
    },
    {
      id: 'mean',
      name: 'پر کردن با میانگین',
      description: 'استفاده از میانگین حسابی (Mean) برای پر کردن داده‌های مفقود',
      icon: <TrendingUp className="h-5 w-5" />,
      action: fillMissingWithMean,
      category: 'advanced',
    },
    {
      id: 'median',
      name: 'پر کردن با میانه',
      description: 'استفاده از میانه (Median) - مقاوم در برابر outlier‌ها',
      icon: <Sparkles className="h-5 w-5" />,
      action: fillMissingWithMedian,
      category: 'advanced',
    },
    {
      id: 'remove-nulls',
      name: 'حذف ردیف‌های ناقص',
      description: 'حذف ردیف‌هایی با بیش از 50% داده مفقود',
      icon: <Trash2 className="h-5 w-5" />,
      action: removeRowsWithTooManyNulls,
      category: 'advanced',
    },
    {
      id: 'outliers',
      name: 'حذف Outlier‌ها',
      description: 'شناسایی و حذف داده‌های پرت با روش IQR',
      icon: <Zap className="h-5 w-5" />,
      action: removeOutliers,
      category: 'advanced',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تمیزسازی داده پیشرفته"
      size="xl"
      // ❌ type وجود ندارد، حذف شد
    >
      <div className="space-y-6">
        {/* توضیحات */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                درباره تمیزسازی داده
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                تمیزسازی داده فرآیند شناسایی و رفع مشکلات کیفی داده است. این روش‌ها به بهبود دقت تحلیل‌ها کمک می‌کنند.
              </p>
            </div>
          </div>
        </div>

        {/* روش‌های پایه */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            روش‌های پایه
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {cleaningMethods
              .filter((m) => m.category === 'basic')
              .map((method) => (
                <button
                  key={method.id}
                  onClick={method.action}
                  disabled={isProcessing}
                  className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-right disabled:opacity-50"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {method.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {method.description}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* روش‌های پیشرفته */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            روش‌های پیشرفته
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {cleaningMethods
              .filter((m) => m.category === 'advanced')
              .map((method) => (
                <button
                  key={method.id}
                  onClick={method.action}
                  disabled={isProcessing}
                  className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-right disabled:opacity-50"
                >
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {method.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {method.description}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* لاگ عملیات */}
        {cleaningLog.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h4 className="font-medium text-gray-900 dark:text-white">
                گزارش عملیات
              </h4>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {cleaningLog.map((log, idx) => (
                <p key={idx} className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {log}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* دکمه بستن */}
        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            بستن
          </Button>
        </div>
      </div>
    </Modal>
  );
}
