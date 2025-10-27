'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useDataStore } from '@/stores/dataStore';
import { useDashboard } from '@/contexts/DashboardContext';
import { useToast } from '@/components/ui/toast';
import { suggestCharts, ChartType, ChartSuggestion } from '@/lib/auto-chart-generator';
import { 
  Plus, 
  BarChart3, 
  LineChart, 
  PieChart, 
  ScatterChart,
  TrendingUp,
  Zap,
  Sparkles
} from 'lucide-react';
import EChartCard from '@/components/charts/EChartCard';

const chartIcons: Record<ChartType, React.ReactNode> = {
  bar: <BarChart3 className="h-5 w-5" />,
  line: <LineChart className="h-5 w-5" />,
  pie: <PieChart className="h-5 w-5" />,
  scatter: <ScatterChart className="h-5 w-5" />,
  area: <TrendingUp className="h-5 w-5" />,
  radar: <Zap className="h-5 w-5" />,
  gauge: <Sparkles className="h-5 w-5" />,
  funnel: <TrendingUp className="h-5 w-5" />,
  heatmap: <BarChart3 className="h-5 w-5" />,
  treemap: <PieChart className="h-5 w-5" />,
};

export default function BuilderPage() {
  const router = useRouter();
  const { data, columns } = useDataStore();
  const { addChart } = useDashboard();
  const { showToast } = useToast();
  
  const [suggestions, setSuggestions] = useState<ChartSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ChartSuggestion | null>(null);
  const [customChart, setCustomChart] = useState({
    type: 'bar' as ChartType,
    xColumn: '',
    yColumn: '',
    title: '',
  });

  useEffect(() => {
    if (data && data.length > 0 && columns && columns.length > 0) {
      const chartSuggestions = suggestCharts(data, columns);
      setSuggestions(chartSuggestions);
      
      if (chartSuggestions.length > 0) {
        setSelectedSuggestion(chartSuggestions[0]);
      }
    }
  }, [data, columns]);

  const handleAddChart = (suggestion: ChartSuggestion) => {
    addChart({
      type: suggestion.type,
      xColumn: suggestion.xColumn,
      yColumn: suggestion.yColumn,
      title: suggestion.title,
      position: { x: 0, y: 0 },
      size: { width: 400, height: 300 },
    });
    showToast('success', 'چارت به داشبورد اضافه شد');
  };

  const handleAddCustomChart = () => {
    if (!customChart.xColumn || !customChart.yColumn || !customChart.title) {
      showToast('error', 'لطفاً تمام فیلدها را پر کنید');
      return;
    }

    addChart({
      type: customChart.type,
      xColumn: customChart.xColumn,
      yColumn: customChart.yColumn,
      title: customChart.title,
      position: { x: 0, y: 0 },
      size: { width: 400, height: 300 },
    });
    
    showToast('success', 'چارت سفارشی اضافه شد');
    setCustomChart({ type: 'bar', xColumn: '', yColumn: '', title: '' });
  };

  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="text-center py-16">
            <CardContent>
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                داده‌ای بارگذاری نشده
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                برای ساخت چارت، ابتدا یک فایل داده بارگذاری کنید
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ساخت داشبورد هوشمند
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            چارت‌های پیشنهادی یا سفارشی خود را ایجاد کنید
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Suggested Charts */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  پیشنهادات هوشمند
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedSuggestion === suggestion
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedSuggestion(suggestion)}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-shrink-0 text-blue-600">
                          {chartIcons[suggestion.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                            {suggestion.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {suggestion.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                          {suggestion.type}
                        </span>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddChart(suggestion);
                          }}
                        >
                          <Plus className="h-3 w-3 ml-1" />
                          افزودن
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {selectedSuggestion && (
              <Card>
                <CardHeader>
                  <CardTitle>پیش‌نمایش</CardTitle>
                </CardHeader>
                <CardContent>
                  <EChartCard
                    title={selectedSuggestion.title}
                    data={data}
                    xColumn={selectedSuggestion.xColumn}
                    yColumn={selectedSuggestion.yColumn}
                    type={selectedSuggestion.type}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Custom Chart Builder */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>ساخت چارت سفارشی</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">نوع چارت</label>
                  <select
                    value={customChart.type}
                    onChange={(e) =>
                      setCustomChart({ ...customChart, type: e.target.value as ChartType })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="bar">میله‌ای</option>
                    <option value="line">خطی</option>
                    <option value="pie">دایره‌ای</option>
                    <option value="scatter">پراکندگی</option>
                    <option value="area">ناحیه‌ای</option>
                    <option value="radar">راداری</option>
                    <option value="gauge">سنج‌سرعت</option>
                    <option value="funnel">قیفی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">ستون X (محور افقی)</label>
                  <select
                    value={customChart.xColumn}
                    onChange={(e) =>
                      setCustomChart({ ...customChart, xColumn: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">انتخاب کنید</option>
                    {columns.map((col) => (
                      <option key={col.name} value={col.name}>
                        {col.name} ({col.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">ستون Y (محور عمودی)</label>
                  <select
                    value={customChart.yColumn}
                    onChange={(e) =>
                      setCustomChart({ ...customChart, yColumn: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">انتخاب کنید</option>
                    {columns.filter((c) => c.type === 'number').map((col) => (
                      <option key={col.name} value={col.name}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">عنوان چارت</label>
                  <input
                    type="text"
                    value={customChart.title}
                    onChange={(e) =>
                      setCustomChart({ ...customChart, title: e.target.value })
                    }
                    placeholder="عنوان چارت را وارد کنید"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleAddCustomChart}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  افزودن به داشبورد
                </Button>

                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => router.push('/dashboard')}
                >
                  مشاهده داشبورد
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}