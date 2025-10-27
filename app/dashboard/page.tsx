'use client';

import { useState, useRef } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { useDataStore } from '@/stores/dataStore';
import Navigation from '@/components/Navigation';
import EChartCard from '@/components/charts/EChartCard';
import Button from '@/components/ui/Button';
import Card, { CardContent} from '@/components/ui/Card';
import { useToast } from '@/components/ui/toast';
import { 
  Download, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Grid3x3,
  LayoutDashboard,
  FileDown 
} from 'lucide-react';
import { exportDashboardToPDF, exportMultipleChartsToPDF } from '@/lib/pdf-export-advanced';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { charts, removeChart, clearCharts } = useDashboard();
  const { data, columns } = useDataStore();
  const { showToast } = useToast();
  const router = useRouter();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  const handleExportDashboard = async () => {
    if (!dashboardRef.current) return;

    setIsExporting(true);
    try {
      await exportDashboardToPDF(dashboardRef.current, {
        filename: 'dashboard-report.pdf',
        title: 'گزارش داشبورد',
        includeHeader: true,
        includeFooter: true,
        headerText: 'داشبورد تحلیل داده',
        footerText: 'تولید شده توسط BluVis Analytics',
      });
      showToast('success', 'داشبورد با موفقیت به PDF تبدیل شد');
    } catch (error) {
      showToast('error', 'خطا در تولید PDF');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAllCharts = async () => {
    if (charts.length === 0) {
      showToast('warning', 'هیچ چارتی برای خروجی وجود ندارد');
      return;
    }

    setIsExporting(true);
    try {
      const chartElements = charts.map((chart, index) => ({
        element: document.getElementById(`chart-${chart.id}`) as HTMLElement,
        title: chart.title,
      })).filter(item => item.element !== null);

      if (chartElements.length === 0) {
        showToast('error', 'المان‌های چارت یافت نشد');
        return;
      }

      await exportMultipleChartsToPDF(chartElements, {
        filename: 'charts-collection.pdf',
        title: 'مجموعه چارت‌ها',
      });
      
      showToast('success', 'تمام چارت‌ها با موفقیت خروجی گرفته شد');
    } catch (error) {
      showToast('error', 'خطا در خروجی چارت‌ها');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAll = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید تمام چارت‌ها را حذف کنید؟')) {
      clearCharts();
      showToast('success', 'تمام چارت‌ها حذف شدند');
    }
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                داشبورد تحلیلی
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {charts.length} چارت از {data.length.toLocaleString('fa-IR')} ردیف داده
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLayoutMode(layoutMode === 'grid' ? 'list' : 'grid')}
              >
                <Grid3x3 className="h-4 w-4 ml-2" />
                {layoutMode === 'grid' ? 'لیست' : 'شبکه'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/builder')}
              >
                <Plus className="h-4 w-4 ml-2" />
                افزودن چارت
              </Button>

              {charts.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportAllCharts}
                    disabled={isExporting}
                  >
                    <FileDown className="h-4 w-4 ml-2" />
                    خروجی همه
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleExportDashboard}
                    disabled={isExporting}
                  >
                    <Download className="h-4 w-4 ml-2" />
                    {isExporting ? 'در حال تولید...' : 'دانلود PDF'}
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleClearAll}
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف همه
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">کل چارت‌ها</p>
                    <p className="text-3xl font-bold">{charts.length}</p>
                  </div>
                  <LayoutDashboard className="h-10 w-10 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">ردیف‌های داده</p>
                    <p className="text-3xl font-bold">{data.length.toLocaleString('fa-IR')}</p>
                  </div>
                  <Grid3x3 className="h-10 w-10 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">ستون‌ها</p>
                    <p className="text-3xl font-bold">{columns.length}</p>
                  </div>
                  <RefreshCw className="h-10 w-10 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">نوع چارت</p>
                    <p className="text-3xl font-bold">{new Set(charts.map(c => c.type)).size}</p>
                  </div>
                  <FileDown className="h-10 w-10 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts Grid */}
        {charts.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <LayoutDashboard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                داشبورد خالی است
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                برای شروع، چارت‌های خود را اضافه کنید
              </p>
              <Button onClick={() => router.push('/builder')} variant="primary">
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
                ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
                : 'space-y-6'
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
                  onClick={() => {
                    removeChart(chart.id);
                    showToast('success', 'چارت حذف شد');
                  }}
                  className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}