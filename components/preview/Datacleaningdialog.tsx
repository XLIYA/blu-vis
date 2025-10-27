'use client';

import { useState, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/toast';
import { useDataStore } from '@/stores/dataStore';
import { CheckCircle, XCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface DataCleaningDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CleaningStats {
  duplicates: number;
  missingValues: number;
  outliers: number;
  inconsistentTypes: number;
}

export default function DataCleaningDialog({
  isOpen,
  onClose,
}: DataCleaningDialogProps) {
  const { data, columns, setData } = useDataStore();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState<'before' | 'after'>('before');
  const [cleanedPreview, setCleanedPreview] = useState<any[]>([]);

  // محاسبه آمار تمیزسازی
  const stats = useMemo<CleaningStats>(() => {
    if (!data || data.length === 0) {
      return { duplicates: 0, missingValues: 0, outliers: 0, inconsistentTypes: 0 };
    }

    const seen = new Set<string>();
    let duplicates = 0;
    let missingValues = 0;

    data.forEach((row) => {
      const key = JSON.stringify(row);
      if (seen.has(key)) {
        duplicates++;
      } else {
        seen.add(key);
      }

      Object.values(row).forEach((value) => {
        if (value === null || value === undefined || value === '') {
          missingValues++;
        }
      });
    });

    return {
      duplicates,
      missingValues,
      outliers: 0,
      inconsistentTypes: 0,
    };
  }, [data]);

  const removeDuplicates = () => {
    setIsProcessing(true);
    try {
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
    } catch (error) {
      showToast('error', 'خطا در حذف ردیف‌های تکراری');
    } finally {
      setIsProcessing(false);
    }
  };

  const fillMissingWithDefault = () => {
    setIsProcessing(true);
    try {
      const cleanedData = data.map((row) => {
        const newRow: any = {};
        columns.forEach((col) => {
          const value = row[col.name];
          if (value === null || value === undefined || value === '') {
            newRow[col.name] = col.type === 'number' ? 0 : '-';
          } else {
            newRow[col.name] = value;
          }
        });
        return newRow;
      });

      setCleanedPreview(cleanedData.slice(0, 10));
      setData({ data: cleanedData });
      showToast('success', 'مقادیر مفقود با مقدار پیش‌فرض پر شدند');
    } catch (error) {
      showToast('error', 'خطا در پرکردن مقادیر مفقود');
    } finally {
      setIsProcessing(false);
    }
  };

  const fillMissingWithMean = () => {
    setIsProcessing(true);
    try {
      const means: Record<string, number> = {};

      columns
        .filter((c) => c.type === 'number')
        .forEach((col) => {
          const values = data
            .map((row) => parseFloat(row[col.name]))
            .filter((v) => !isNaN(v) && v !== null);
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
            newRow[col.name] =
              col.type === 'number' && means[col.name] !== undefined
                ? Math.round(means[col.name] * 100) / 100
                : '-';
          } else {
            newRow[col.name] = value;
          }
        });
        return newRow;
      });

      setCleanedPreview(cleanedData.slice(0, 10));
      setData({ data: cleanedData });
      showToast('success', 'مقادیر مفقود با میانگین پر شدند');
    } catch (error) {
      showToast('error', 'خطا در پرکردن مقادیر با میانگین');
    } finally {
      setIsProcessing(false);
    }
  };

  const fillMissingWithMedian = () => {
    setIsProcessing(true);
    try {
      const medians: Record<string, number> = {};

      columns
        .filter((c) => c.type === 'number')
        .forEach((col) => {
          const values = data
            .map((row) => parseFloat(row[col.name]))
            .filter((v) => !isNaN(v) && v !== null)
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
            newRow[col.name] =
              col.type === 'number' && medians[col.name] !== undefined
                ? Math.round(medians[col.name] * 100) / 100
                : '-';
          } else {
            newRow[col.name] = value;
          }
        });
        return newRow;
      });

      setCleanedPreview(cleanedData.slice(0, 10));
      setData({ data: cleanedData });
      showToast('success', 'مقادیر مفقود با میانه پر شدند');
    } catch (error) {
      showToast('error', 'خطا در پرکردن مقادیر با میانه');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeRowsWithMissing = () => {
    setIsProcessing(true);
    try {
      const cleanedData = data.filter((row) => {
        return columns.every((col) => {
          const value = row[col.name];
          return value !== null && value !== undefined && value !== '';
        });
      });

      const removed = data.length - cleanedData.length;
      setData({ data: cleanedData, rows: cleanedData.length });
      showToast('success', `${removed.toLocaleString('fa-IR')} ردیف با مقادیر مفقود حذف شد`);
    } catch (error) {
      showToast('error', 'خطا در حذف ردیف‌ها');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="تمیزسازی هوشمند داده" 
      size="lg"
      footer={
        <Button onClick={onClose} variant="secondary">
          بستن
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Data Quality Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">ردیف‌های تکراری</p>
                <p className="text-2xl font-bold text-blue-600">{stats.duplicates}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">مقادیر مفقود</p>
                <p className="text-2xl font-bold text-amber-600">{stats.missingValues}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">کل ردیف‌ها</p>
                <p className="text-2xl font-bold text-green-600">{data.length.toLocaleString('fa-IR')}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">کل ستون‌ها</p>
                <p className="text-2xl font-bold text-purple-600">{columns.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Cleaning Actions */}
        <div className="space-y-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              حذف ردیف‌های تکراری
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              تمام ردیف‌هایی که کاملاً مشابه هم هستند حذف می‌شوند
            </p>
            <Button
              onClick={removeDuplicates}
              disabled={isProcessing || stats.duplicates === 0}
              variant="outline"
              size="sm"
            >
              حذف {stats.duplicates} ردیف تکراری
            </Button>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              مدیریت مقادیر مفقود
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              سلول‌های خالی را با روش‌های مختلف پر کنید یا حذف کنید
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={fillMissingWithDefault}
                disabled={isProcessing || stats.missingValues === 0}
                variant="outline"
                size="sm"
              >
                مقدار پیش‌فرض
              </Button>
              <Button
                onClick={fillMissingWithMean}
                disabled={isProcessing || stats.missingValues === 0}
                variant="outline"
                size="sm"
              >
                میانگین
              </Button>
              <Button
                onClick={fillMissingWithMedian}
                disabled={isProcessing || stats.missingValues === 0}
                variant="outline"
                size="sm"
              >
                میانه
              </Button>
              <Button
                onClick={removeRowsWithMissing}
                disabled={isProcessing || stats.missingValues === 0}
                variant="danger"
                size="sm"
              >
                حذف ردیف‌ها
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Toggle */}
        {cleanedPreview.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">پیش‌نمایش نتیجه:</h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={previewMode === 'before' ? 'primary' : 'outline'}
                  onClick={() => setPreviewMode('before')}
                >
                  قبل
                </Button>
                <Button
                  size="sm"
                  variant={previewMode === 'after' ? 'primary' : 'outline'}
                  onClick={() => setPreviewMode('after')}
                >
                  بعد
                </Button>
              </div>
            </div>
            <div className="max-h-60 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    {columns.slice(0, 5).map((col) => (
                      <th key={col.name} className="px-3 py-2 text-right font-medium">
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(previewMode === 'before' ? data.slice(0, 10) : cleanedPreview).map(
                    (row, idx) => (
                      <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                        {columns.slice(0, 5).map((col) => (
                          <td key={col.name} className="px-3 py-2">
                            {row[col.name] ?? '-'}
                          </td>
                        ))}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}