'use client';

import { useState, type ReactNode } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/toast';
import { useDataStore } from '@/stores/dataStore';
import {
  Trash2,
  Replace,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Filter,
  Activity,
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
  color: string;
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
    showToast('success', `${removed.toLocaleString('fa-IR')} ردیف تکراری حذف شد`);
    addToLog(`حذف ${removed.toLocaleString('fa-IR')} ردیف تکراری - روش: مقایسه کامل ردیف‌ها`);
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
    showToast('success', `${filledCount.toLocaleString('fa-IR')} سلول با مقدار پیش‌فرض پر شد`);
    addToLog(
      `پر کردن ${filledCount.toLocaleString('fa-IR')} سلول خالی - روش: مقدار پیش‌فرض (0 برای اعداد، "-" برای متن)`
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
    showToast('success', `${filledCount.toLocaleString('fa-IR')} سلول با میانگین پر شد`);
    addToLog(
      `پر کردن ${filledCount.toLocaleString('fa-IR')} سلول - روش: میانگین حسابی (Mean) برای ستون‌های عددی`
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
    showToast('success', `${filledCount.toLocaleString('fa-IR')} سلول با میانه پر شد`);
    addToLog(
      `پر کردن ${filledCount.toLocaleString('fa-IR')} سلول - روش: میانه (Median) - مقاوم در برابر outlier‌ها`
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
    showToast('success', `${removed.toLocaleString('fa-IR')} ردیف با داده ناقص حذف شد`);
    addToLog(`حذف ${removed.toLocaleString('fa-IR')} ردیف - روش: حذف ردیف‌های با بیش از 50% داده مفقود`);
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
    showToast('success', `${removedCount.toLocaleString('fa-IR')} outlier حذف شد`);
    addToLog(
      `حذف ${removedCount.toLocaleString('fa-IR')} ردیف - روش: IQR (Interquartile Range) - شناسایی و حذف داده‌های پرت`
    );
    setIsProcessing(false);
  };

  const cleaningMethods: CleaningMethod[] = [
    {
      id: 'duplicates',
      name: 'حذف تکراری‌ها',
      description: 'ردیف‌های کاملاً مشابه را شناسایی و حذف می‌کند',
      icon: <Trash2 className="h-5 w-5" />,
      action: removeDuplicates,
      category: 'basic',
      color: 'blue',
    },
    {
      id: 'default',
      name: 'پر کردن با پیش‌فرض',
      description: 'سلول‌های خالی را با مقدار پیش‌فرض (0 برای اعداد، "-" برای متن) پر می‌کند',
      icon: <Replace className="h-5 w-5" />,
      action: fillMissingWithDefault,
      category: 'basic',
      color: 'green',
    },
    {
      id: 'mean',
      name: 'پر کردن با میانگین',
      description: 'استفاده از میانگین حسابی (Mean) برای پر کردن داده‌های مفقود - مناسب برای داده‌های نرمال',
      icon: <TrendingUp className="h-5 w-5" />,
      action: fillMissingWithMean,
      category: 'advanced',
      color: 'purple',
    },
    {
      id: 'median',
      name: 'پر کردن با میانه',
      description: 'استفاده از میانه (Median) - مقاوم در برابر outlier‌ها و مناسب برای داده‌های کج',
      icon: <Sparkles className="h-5 w-5" />,
      action: fillMissingWithMedian,
      category: 'advanced',
      color: 'indigo',
    },
    {
      id: 'remove-nulls',
      name: 'حذف ردیف‌های ناقص',
      description: 'حذف ردیف‌هایی که بیش از 50% ستون‌هایشان خالی است - بهبود کیفیت داده',
      icon: <Filter className="h-5 w-5" />,
      action: removeRowsWithTooManyNulls,
      category: 'advanced',
      color: 'orange',
    },
    {
      id: 'outliers',
      name: 'حذف Outlier‌ها',
      description: 'شناسایی و حذف داده‌های پرت با روش IQR - بهبود دقت تحلیل‌ها',
      icon: <Activity className="h-5 w-5" />,
      action: removeOutliers,
      category: 'advanced',
      color: 'red',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🧹 تمیزسازی داده پیشرفته"
      size="xl"
    >
      <div className="space-y-6">
        {/* توضیحات */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                درباره تمیزسازی داده
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                تمیزسازی داده فرآیند شناسایی و رفع مشکلات کیفی داده است. انتخاب روش مناسب بر اساس نوع داده و هدف تحلیل، به بهبود دقت نتایج کمک می‌کند.
              </p>
            </div>
          </div>
        </div>

        {/* روش‌های پایه */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              روش‌های پایه
            </h3>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
              ساده و سریع
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {cleaningMethods
              .filter((m) => m.category === 'basic')
              .map((method) => (
                <button
                  key={method.id}
                  onClick={method.action}
                  disabled={isProcessing}
                  className="group flex items-start gap-4 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-200 text-right disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                >
                  <div className={`p-3 bg-${method.color}-100 dark:bg-${method.color}-900/30 rounded-xl text-${method.color}-600 dark:text-${method.color}-400 group-hover:scale-110 transition-transform`}>
                    {method.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                      {method.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {method.description}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* روش‌های پیشرفته */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              روش‌های پیشرفته
            </h3>
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
              تخصصی و دقیق
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {cleaningMethods
              .filter((m) => m.category === 'advanced')
              .map((method) => (
                <button
                  key={method.id}
                  onClick={method.action}
                  disabled={isProcessing}
                  className="group flex items-start gap-4 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all duration-200 text-right disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                >
                  <div className={`p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform`}>
                    {method.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                      {method.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {method.description}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* لاگ عملیات */}
        {cleaningLog.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h4 className="font-semibold text-gray-900 dark:text-white">
                گزارش عملیات ({cleaningLog.length})
              </h4>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {cleaningLog.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                  <p className="text-gray-700 dark:text-gray-300 font-mono text-xs">
                    {log}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* دکمه بستن */}
        <div className="flex justify-end pt-2 border-t dark:border-gray-700">
          <Button onClick={onClose} variant="outline" size="lg">
            بستن
          </Button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568;
        }
      `}</style>
    </Modal>
  );
}