'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import UploadDropzone from '@/components/upload/UploadDropzone';
import VirtualizedTable from '@/components/table/VirtualizedTable';
import QuickInsights from '@/components/preview/Quickinsights';
import DataCleaningDialog from '@/components/preview/Datacleaningdialog';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useDataStore } from '@/stores/dataStore';
import { useToast } from '@/components/ui/toast';
import { 
  ArrowRight, 
  Download, 
  Sparkles, 
  RefreshCw,
  Trash2,
  FileText,
  TrendingUp
} from 'lucide-react';

export default function PreviewPage() {
  const router = useRouter();
  const { data, columns, fileName, setData, resetData } = useDataStore();
  const { showToast } = useToast();
  const [isCleaningOpen, setIsCleaningOpen] = useState(false);

  const handleDataLoaded = (
    loadedData: any[],
    loadedColumns: any[],
    name: string
  ) => {
    setData({
      data: loadedData,
      columns: loadedColumns,
      fileName: name,
      rows: loadedData.length,
    });
  };

  const handleExportCSV = () => {
    if (!data || data.length === 0) {
      showToast('error', 'داده‌ای برای خروجی وجود ندارد');
      return;
    }

    try {
      const headers = columns.map((col) => col.name).join(',');
      const rows = data.map((row) =>
        columns.map((col) => {
          const value = row[col.name];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value ?? '';
        }).join(',')
      );

      const csv = [headers, ...rows].join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `cleaned-${fileName || 'data.csv'}`;
      link.click();

      showToast('success', 'فایل CSV با موفقیت دانلود شد');
    } catch (error) {
      showToast('error', 'خطا در تولید فایل CSV');
      console.error(error);
    }
  };

  const handleReset = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید تمام داده‌ها را حذف کنید؟')) {
      resetData();
      showToast('success', 'داده‌ها پاک شدند');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            بارگذاری و پیش‌نمایش داده
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            فایل خود را بارگذاری کنید و داده‌ها را مشاهده و تمیز کنید
          </p>
        </div>

        {/* Upload Area */}
        {!data || data.length === 0 ? (
          <Card className="mb-8">
            <CardContent className="p-8">
              <UploadDropzone onDataLoaded={handleDataLoaded} />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* File Info Card */}
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500 text-white p-3 rounded-lg">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {fileName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {data.length.toLocaleString('fa-IR')} ردیف × {columns.length} ستون
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCleaningOpen(true)}
                    >
                      <Sparkles className="h-4 w-4 ml-2" />
                      تمیزسازی
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCSV}
                    >
                      <Download className="h-4 w-4 ml-2" />
                      خروجی CSV
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => router.push('/builder')}
                    >
                      <TrendingUp className="h-4 w-4 ml-2" />
                      ساخت داشبورد
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleReset}
                    >
                      <Trash2 className="h-4 w-4 ml-2" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Insights */}
            <div className="mb-6">
              <QuickInsights data={data} columns={columns} />
            </div>

            {/* Data Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>جدول داده</span>
                  <span className="text-sm font-normal text-gray-500">
                    نمایش {Math.min(100, data.length)} از {data.length.toLocaleString('fa-IR')} ردیف
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <VirtualizedTable data={data} columns={columns} />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  resetData();
                  showToast('info', 'برای بارگذاری فایل جدید آماده هستید');
                }}
              >
                <RefreshCw className="h-4 w-4 ml-2" />
                بارگذاری فایل جدید
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/builder')}
              >
                ادامه به ساخت داشبورد
                <ArrowRight className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Data Cleaning Dialog */}
      <DataCleaningDialog
        isOpen={isCleaningOpen}
        onClose={() => setIsCleaningOpen(false)}
      />
    </div>
  );
}