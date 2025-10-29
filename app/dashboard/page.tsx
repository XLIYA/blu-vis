'use client';

import { useState, useRef } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { useDataStore } from '@/stores/dataStore';
import Navigation from '@/components/Navigation';
import DashboardBuilderModal from '@/components/dashboard/DashboardBuilderModal';
import EChartCard from '@/components/charts/EChartCard';
import Button from '@/components/ui/Button';
import Card, { CardContent} from '@/components/ui/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/toast';
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  Grid3x3,
  LayoutDashboard,
  FileText,
  LayoutGrid,
  LayoutList
} from 'lucide-react';
import { generateAdvancedReport } from '@/lib/pdf-export-advanced';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { charts, removeChart, clearCharts } = useDashboard();
  const { data, columns, fileName } = useDataStore();
  const { showToast } = useToast();
  const router = useRouter();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
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

  const handleExportAdvancedReport = async () => {
    if (charts.length === 0) {
      showToast('warning', 'هیچ چارتی برای تولید گزارش وجود ندارد');
      return;
    }

    setIsExporting(true);
    try {
      const chartElements = charts.map((chart) => ({
        element: document.getElementById(`chart-${chart.id}`) as HTMLElement,
        title: chart.title,
        description: `تحلیل ${chart.yColumn} بر اساس ${chart.xColumn} با استفاده از نمودار ${chart.type}`,
      })).filter(item => item.element !== null);

      if (chartElements.length === 0) {
        showToast('error', 'المان‌های چارت یافت نشد');
        return;
      }

      const insights = [
        {
          key: 'حجم داده',
          value: `مجموعاً ${data?.length.toLocaleString('fa-IR')} ردیف داده در ${columns?.length} ستون تحلیل شده است.`,
        },
        {
          key: 'تنوع تحلیل',
          value: `${charts.length} نمودار با ${new Set(charts.map(c => c.type)).size} نوع مختلف ایجاد شده است.`,
        },
        {
          key: 'متغیرهای کلیدی',
          value: `متغیرهای اصلی شامل: ${[...new Set(charts.map(c => c.yColumn))].slice(0, 3).join('، ')} می‌باشند.`,
        },
        {
          key: 'پوشش داده',
          value: `تحلیل بر روی ${Math.round((chartElements.length / (columns?.length || 1)) * 100)}% از ستون‌های موجود انجام شده است.`,
        },
      ];

      await generateAdvancedReport({
        filename: `bluvis-report-${Date.now()}.pdf`,
        title: 'گزارش تحلیل داده',
        subtitle: fileName || 'تحلیل جامع داده‌های بارگذاری شده',
        companyName: 'BluVis Analytics',
        dataStats: {
          totalRows: data?.length || 0,
          totalColumns: columns?.length || 0,
          dateRange: new Date().toLocaleDateString('fa-IR'),
          dataSource: fileName,
        },
        insights,
        charts: chartElements,
        includeTimestamp: true,
      });

      showToast('success', 'گزارش پیشرفته با موفقیت تولید شد');
    } catch (error) {
      showToast('error', 'خطا در تولید گزارش');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAll = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'حذف تمام چارت‌ها',
      message: 'آیا مطمئن هستید که می‌خواهید تمام چارت‌ها را حذف کنید؟ این عمل قابل بازگشت نیست.',
      onConfirm: () => {
        clearCharts();
        showToast('success', 'تمام چارت‌ها حذف شدند');
      },
    });
  };

  const handleRemoveChart = (chartId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'حذف چارت',
      message: 'آیا مطمئن هستید که می‌خواهید این چارت را حذف کنید؟',
      onConfirm: () => {
        removeChart(chartId);
        showToast('success', 'چارت حذف شد');
      },
    });
  };

  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="text-center py-16">
            <CardContent>
              <LayoutDashboard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                داده‌ای بارگذاری نشده
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                لطفاً ابتدا یک فایل داده را بارگذاری کنید
              </p>
              <Button onClick={() => router.push('/preview')} variant="primary">
                بارگذاری فایل
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header با دکمه‌های بهبود یافته */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                داشبورد تحلیلی
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {charts.length} چارت از {data.length.toLocaleString('fa-IR')} ردیف
              </p>
            </div>
            
            {/* دکمه‌های عملیات - مربعی و هم‌اندازه (مثل preview) */}
            <div className="flex gap-3">
              {/* دکمه تغییر نمایش */}
              <button
                onClick={() => setLayoutMode(layoutMode === 'grid' ? 'list' : 'grid')}
                className="group relative flex items-center justify-center w-12 h-12 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
                aria-label={layoutMode === 'grid' ? 'نمایش لیستی' : 'نمایش شبکه‌ای'}
              >
                {layoutMode === 'grid' ? (
                  <LayoutList className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <LayoutGrid className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                )}
                
                {/* Tooltip */}
                <span className="absolute bottom-full mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {layoutMode === 'grid' ? 'نمایش لیستی' : 'نمایش شبکه‌ای'}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                </span>
              </button>

              {/* دکمه افزودن چارت */}
              <button
                onClick={() => setIsBuilderModalOpen(true)}
                className="group relative flex items-center justify-center w-12 h-12 border-2 border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
                aria-label="افزودن چارت"
              >
                <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                
                {/* Tooltip */}
                <span className="absolute bottom-full mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  افزودن چارت
                  <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                </span>
              </button>

              {charts.length > 0 && (
                <>
                  {/* دکمه گزارش PDF */}
                  <button
                    onClick={handleExportAdvancedReport}
                    disabled={isExporting}
                    className="group relative flex items-center justify-center w-12 h-12 border-2 border-green-300 dark:border-green-700 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="گزارش PDF"
                  >
                    {isExporting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent" />
                    ) : (
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    )}
                    
                    {/* Tooltip */}
                    {!isExporting && (
                      <span className="absolute bottom-full mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        دانلود گزارش PDF
                        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                      </span>
                    )}
                  </button>

                  {/* دکمه حذف همه */}
                  <button
                    onClick={handleClearAll}
                    className="group relative flex items-center justify-center w-12 h-12 border-2 border-red-300 dark:border-red-700 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    aria-label="حذف همه"
                  >
                    <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                    
                    {/* Tooltip */}
                    <span className="absolute bottom-full mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      حذف تمام چارت‌ها
                      <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-90">کل چارت‌ها</p>
                    <p className="text-2xl font-bold">{charts.length}</p>
                  </div>
                  <LayoutDashboard className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-90">ردیف‌ها</p>
                    <p className="text-2xl font-bold">{data.length.toLocaleString('fa-IR')}</p>
                  </div>
                  <Grid3x3 className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-90">ستون‌ها</p>
                    <p className="text-2xl font-bold">{columns.length}</p>
                  </div>
                  <RefreshCw className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-90">نوع چارت</p>
                    <p className="text-2xl font-bold">{new Set(charts.map(c => c.type)).size}</p>
                  </div>
                  <FileText className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts Grid */}
        {charts.length === 0 ? (
          <Card className="text-center py-16 border-2 border-gray-200 dark:border-gray-700">
            <CardContent>
              <LayoutDashboard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                داشبورد خالی است
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                برای شروع، چارت‌های خود را اضافه کنید
              </p>
              <Button onClick={() => setIsBuilderModalOpen(true)} variant="primary">
                <Plus className="h-4 w-4 ml-2" />
                ساخت اولین چارت
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div 
            ref={dashboardRef}
            className={
              layoutMode === 'grid'
                ? 'grid grid-cols-1 lg:grid-cols-2 gap-4'
                : 'space-y-4'
            }
          >
            {charts.map((chart) => (
              <div key={chart.id} id={`chart-${chart.id}`} className="relative group">
                <EChartCard
                  title={chart.title}
                  data={data}
                  xColumn={chart.xColumn}
                  yColumn={chart.yColumn}
                  type={chart.type}
                />
                
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveChart(chart.id)}
                  className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dashboard Builder Modal */}
      <DashboardBuilderModal
        isOpen={isBuilderModalOpen}
        onClose={() => setIsBuilderModalOpen(false)}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="تأیید"
        cancelText="انصراف"
        type="danger"
      />
    </div>
  );
}