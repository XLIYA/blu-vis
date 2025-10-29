'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import UploadDropzone from '@/components/upload/UploadDropzone';
import DataCleaningDialog from '@/components/preview/DatacleaningdialogImproved';

import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useDataStore } from '@/stores/dataStore';
import { useToast } from '@/components/ui/toast';
import { 
  Trash2, 
  Download, 
  ArrowRight, 
  FileSpreadsheet,
  Sparkles,
  Table2,
  Wand2
} from 'lucide-react';
import type { ColumnMeta } from '@/lib/format';
import QuickInsights from '@/components/preview/Quickinsights';
import VirtualizedTable from '@/components/table/VirtualizedTable';

export default function PreviewPage() {
  const router = useRouter();
  const { data, columns, fileName, setData, reset } = useDataStore();
  const { showToast } = useToast();
  
  // State برای مودال تمیزسازی
  const [isCleaningModalOpen, setIsCleaningModalOpen] = useState(false);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleDataLoaded = (
    loadedData: any[],
    loadedColumns: ColumnMeta[],
    loadedFileName: string
  ) => {
    setData({
      data: loadedData,
      columns: loadedColumns,
      fileName: loadedFileName,
      rows: loadedData.length,
    });
    showToast('success', 'داده‌ها با موفقیت بارگذاری شدند');
  };

  const handleClearData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'حذف داده‌ها',
      message: 'آیا مطمئن هستید که می‌خواهید تمام داده‌های بارگذاری شده را حذف کنید؟ این عمل قابل بازگشت نیست.',
      onConfirm: () => {
        reset();
        showToast('success', 'داده‌ها با موفقیت حذف شدند');
      },
    });
  };

  const handleExportCSV = () => {
    if (!data || data.length === 0) {
      showToast('error', 'داده‌ای برای خروجی وجود ندارد');
      return;
    }

    try {
      const headers = columns.map((col) => col.name).join(',');
      const rows = data
        .map((row) =>
          columns
            .map((col) => {
              const value = row[col.name];
              const stringValue = value === null || value === undefined ? '' : String(value);
              return `"${stringValue.replace(/"/g, '""')}"`;
            })
            .join(',')
        )
        .join('\n');

      const csv = `${headers}\n${rows}`;
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName || 'data'}_cleaned.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('success', 'فایل CSV با موفقیت دانلود شد');
    } catch (error) {
      showToast('error', 'خطا در دانلود فایل CSV');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            بارگذاری و پیش‌نمایش
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            فایل خود را بارگذاری کنید و داده‌ها را مشاهده کنید
          </p>
        </div>

        {!data || data.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <UploadDropzone onDataLoaded={handleDataLoaded} />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* File Info Card با دکمه‌های بهبود یافته */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <FileSpreadsheet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{fileName}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        {data.length.toLocaleString('fa-IR')} ردیف × {columns.length} ستون
                      </p>
                    </div>
                  </div>

                  {/* دکمه‌های عملیات - مربعی و هم‌اندازه */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsCleaningModalOpen(true)}
                      className="group relative flex items-center justify-center w-12 h-12 border-2 border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
                      aria-label="تمیزسازی پیشرفته"
                    >
                      <Wand2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      
                      {/* Tooltip */}
                      <span className="absolute bottom-full mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        تمیزسازی پیشرفته
                        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                      </span>
                    </button>

                    <button
                      onClick={handleExportCSV}
                      className="group relative flex items-center justify-center w-12 h-12 border-2 border-green-300 dark:border-green-700 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
                      aria-label="دانلود CSV"
                    >
                      <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
                      
                      {/* Tooltip */}
                      <span className="absolute bottom-full mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        دانلود CSV
                        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                      </span>
                    </button>

                    <button
                      onClick={handleClearData}
                      className="group relative flex items-center justify-center w-12 h-12 border-2 border-red-300 dark:border-red-700 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
                      aria-label="حذف داده‌ها"
                    >
                      <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                      
                      {/* Tooltip */}
                      <span className="absolute bottom-full mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        حذف داده‌ها
                        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                      </span>
                    </button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Quick Insights */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  بینش‌های سریع
                </h2>
              </div>
              <QuickInsights data={data} columns={columns} />
            </div>

            {/* Data Table */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table2 className="h-4 w-4 text-green-500" />
                    <CardTitle className="text-base">جدول داده</CardTitle>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    نمایش {Math.min(100, data.length)} از {data.length.toLocaleString('fa-IR')} ردیف
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <VirtualizedTable data={data} columns={columns} maxHeight={400} />
              </CardContent>
            </Card>

            {/* Action Button */}
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/dashboard')}
                className="px-6"
              >
                ادامه به داشبورد
                <ArrowRight className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal تمیزسازی پیشرفته */}
      <DataCleaningDialog
        isOpen={isCleaningModalOpen}
        onClose={() => setIsCleaningModalOpen(false)}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="حذف"
        cancelText="انصراف"
        type="danger"
      />
    </div>
  );
}