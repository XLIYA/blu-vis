'use client';

import { useState, useMemo } from 'react';
import {
  Download,
  Trash2,
  Sparkles,
  Info,
  TrendingUp,
  PieChart,
  BarChart3,
  Activity,
} from 'lucide-react';
import UploadDropzone from '@/components/upload/UploadDropzone';
import VirtualizedTable from '@/components/table/VirtualizedTable';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useDataStore } from '@/stores/dataStore';
import { useToast } from '@/components/ui/toast';
import QuickInsights from '@/components/preview/Quickinsights';
import DataCleaningDialog from '@/components/preview/DatacleaningdialogImproved';
import ExportDialog from '@/components/preview/Exportdialog';
import Modal from '@/components/ui/Modal'; // ✅ default import
import type { ColumnMeta } from '@/lib/format';

type Row = Record<string, any>;

export default function PreviewPage() {
  const { data, columns, setData, reset, fileName } = useDataStore();
  const { showToast } = useToast();
  const [showCleaningDialog, setShowCleaningDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Helper: normalize incoming columns to ColumnMeta[]
  const normalizeColumns = (cols: any[]): ColumnMeta[] => {
    return (Array.isArray(cols) ? cols : []).map((c) => {
      // اطمینان از داشتن name و type معتبر
      const name = typeof c?.name === 'string' ? c.name : String(c?.name ?? '');
      const t = c?.type ?? 'string';
      // اگر ColumnType در پروژه‌تان مقادیر دیگری دارد، این مپ را کامل‌تر کنید
      const type =
        t === 'number' || t === 'date' || t === 'string'
          ? t
          : 'string';

      return {
        // سایر فیلدهای ColumnMeta را اگر دارید همین‌جا پاس بدهید
        name,
        type,
      } as ColumnMeta;
    });
  };

  // محاسبه آمار پیشرفته
  const advancedStats = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0 || !Array.isArray(columns)) return null;

    const numericColumns = columns.filter((c) => c.type === 'number');
    const stringColumns = columns.filter((c) => c.type === 'string');
    const dateColumns = columns.filter((c) => c.type === 'date');

    // محاسبه مقادیر خالی
    const totalCells = data.length * columns.length;
    let emptyCells = 0;
    data.forEach((row: Row) => {
      columns.forEach((col) => {
        const value = row[col.name];
        if (value === null || value === undefined || value === '') {
          emptyCells++;
        }
      });
    });

    // محاسبه تکراری‌ها
    const seen = new Set<string>();
    let duplicates = 0;
    data.forEach((row: Row) => {
      const key = JSON.stringify(row);
      if (seen.has(key)) {
        duplicates++;
      } else {
        seen.add(key);
      }
    });

    // محاسبه حافظه تقریبی
    const estimatedMemory = (JSON.stringify(data).length / 1024).toFixed(2);

    return {
      totalRows: data.length,
      totalColumns: columns.length,
      numericColumns: numericColumns.length,
      stringColumns: stringColumns.length,
      dateColumns: dateColumns.length,
      emptyCells,
      emptyPercentage: ((emptyCells / Math.max(1, totalCells)) * 100).toFixed(2),
      duplicates,
      uniqueRows: data.length - duplicates,
      estimatedMemory,
      fileName: fileName || 'نامشخص',
    };
  }, [data, columns, fileName]);

  const handleDataLoaded = (
    newData: Row[],
    newColumns: any[],
    loadedFileName: string
  ) => {
    const normalizedCols = normalizeColumns(newColumns); // ✅ تطبیق با ColumnMeta[]

    setData({
      data: Array.isArray(newData) ? newData : [],
      columns: normalizedCols,
      rows: Array.isArray(newData) ? newData.length : 0,
      fileName: loadedFileName,
    });
    showToast('success', `${newData.length} ردیف با موفقیت بارگذاری شد`);
  };

  const handleReset = () => {
    reset(); // ✅ در استور اضافه شده
    showToast('info', 'داده‌ها پاک شدند');
    setShowResetConfirm(false);
  };

  const hasData = Array.isArray(data) && data.length > 0;
  const colsCount = Array.isArray(columns) ? columns.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      {hasData && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {fileName || 'داده بارگذاری شده'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {data.length.toLocaleString('fa-IR')} ردیف × {colsCount} ستون
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCleaningDialog(true)}
                >
                  <Sparkles className="h-4 w-4 ml-2" />
                  تمیزسازی
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportDialog(true)}
                >
                  <Download className="h-4 w-4 ml-2" />
                  خروجی
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowResetConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                  پاک کردن
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!hasData ? (
          <UploadDropzone onDataLoaded={handleDataLoaded} />
        ) : (
          <div className="space-y-6">
            {/* آمار کلی */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">تعداد ردیف‌ها</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {advancedStats?.totalRows.toLocaleString('fa-IR')}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">ستون‌های عددی</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {advancedStats?.numericColumns}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">داده خالی</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {advancedStats?.emptyPercentage}%
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <Activity className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">ردیف‌های تکراری</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {advancedStats?.duplicates}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <PieChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* اطلاعات تکمیلی */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  اطلاعات تکمیلی
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">نام فایل:</span>
                    <span className="mr-2 font-medium text-gray-900 dark:text-white">
                      {advancedStats?.fileName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">ستون‌های متنی:</span>
                    <span className="mr-2 font-medium text-gray-900 dark:text-white">
                      {advancedStats?.stringColumns}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">ستون‌های تاریخ:</span>
                    <span className="mr-2 font-medium text-gray-900 dark:text-white">
                      {advancedStats?.dateColumns}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">ردیف‌های منحصر به فرد:</span>
                    <span className="mr-2 font-medium text-gray-900 dark:text-white">
                      {advancedStats?.uniqueRows.toLocaleString('fa-IR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">سلول‌های خالی:</span>
                    <span className="mr-2 font-medium text-gray-900 dark:text-white">
                      {advancedStats?.emptyCells.toLocaleString('fa-IR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">حجم تقریبی:</span>
                    <span className="mr-2 font-medium text-gray-900 dark:text-white">
                      {advancedStats?.estimatedMemory} KB
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* جدول و Insights */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <VirtualizedTable data={data} columns={columns} />
              </div>
              <div>
                <QuickInsights data={data} columns={columns} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <DataCleaningDialog
        isOpen={showCleaningDialog}
        onClose={() => setShowCleaningDialog(false)}
      />

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />

      {/* ✅ استفاده از Modal عمومی به جای ConfirmModal سفارشی */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="پاک کردن داده‌ها"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>
              لغو
            </Button>
            <Button variant="danger" onClick={handleReset}>
              بله، پاک کن
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-700 dark:text-gray-300">
          آیا مطمئن هستید که می‌خواهید تمام داده‌های بارگذاری شده را پاک کنید؟ این عمل قابل بازگشت نیست.
        </p>
      </Modal>
    </div>
  );
}
