'use client';

import { useState, useEffect } from 'react';
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
  Sparkles,
  X,
  ChevronDown
} from 'lucide-react';
import EChartCard from '@/components/charts/EChartCard';

const chartIcons: Record<ChartType, React.ReactNode> = {
  bar: <BarChart3 className="h-4 w-4" />,
  line: <LineChart className="h-4 w-4" />,
  pie: <PieChart className="h-4 w-4" />,
  scatter: <ScatterChart className="h-4 w-4" />,
  area: <TrendingUp className="h-4 w-4" />,
  radar: <Zap className="h-4 w-4" />,
  gauge: <Sparkles className="h-4 w-4" />,
  funnel: <TrendingUp className="h-4 w-4" />,
  heatmap: <BarChart3 className="h-4 w-4" />,
  treemap: <PieChart className="h-4 w-4" />,
};

const chartTypeLabels: Record<ChartType, string> = {
  bar: 'میله‌ای',
  line: 'خطی',
  pie: 'دایره‌ای',
  scatter: 'پراکندگی',
  area: 'ناحیه‌ای',
  radar: 'راداری',
  gauge: 'سنج‌سرعت',
  funnel: 'قیفی',
  heatmap: 'نقشه حرارتی',
  treemap: 'نقشه درختی',
};

interface DashboardBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Custom Select Component
const Select = ({ 
  value, 
  onChange, 
  options, 
  placeholder,
  icon 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  options: { value: string; label: string; icon?: React.ReactNode }[];
  placeholder: string;
  icon?: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-sm"
      >
        <span className="flex items-center gap-2">
          {icon && <span className="text-gray-500 dark:text-gray-400">{icon}</span>}
          {selectedOption ? (
            <>
              {selectedOption.icon && <span>{selectedOption.icon}</span>}
              <span>{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  value === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                }`}
              >
                {option.icon && <span>{option.icon}</span>}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function DashboardBuilderModal({ isOpen, onClose }: DashboardBuilderModalProps) {
  const { data, columns } = useDataStore();
  const { addChart } = useDashboard();
  const { showToast } = useToast();
  
  const [suggestions, setSuggestions] = useState<ChartSuggestion[]>([]);
  const [viewMode, setViewMode] = useState<'suggestions' | 'custom'>('suggestions');
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
    onClose();
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
    onClose();
  };

  if (!isOpen) return null;

  const chartTypeOptions = Object.entries(chartTypeLabels).map(([value, label]) => ({
    value,
    label,
    icon: chartIcons[value as ChartType],
  }));

  const columnOptions = columns?.map((col) => ({
    value: col.name,
    label: `${col.name} (${col.type})`,
  })) || [];

  const numericColumnOptions = columns?.filter((c) => c.type === 'number').map((col) => ({
    value: col.name,
    label: col.name,
  })) || [];

  // محاسبه آیا چارت سفارشی قابل پیش‌نمایش است
  const canPreviewCustom = customChart.xColumn && customChart.yColumn && customChart.title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Improved */}
        <div className="flex items-center justify-between p-5 border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              ساخت چارت جدید
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              انتخاب از پیشنهادات هوشمند یا ساخت چارت سفارشی
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={() => setViewMode('suggestions')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              viewMode === 'suggestions'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Sparkles className="h-4 w-4 inline ml-2" />
            پیشنهادات هوشمند
          </button>
          <button
            onClick={() => setViewMode('custom')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              viewMode === 'custom'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Zap className="h-4 w-4 inline ml-2" />
            چارت سفارشی
          </button>
        </div>

        {/* Content - Optimized Layout */}
        <div className="flex-1 overflow-y-auto p-5">
          {viewMode === 'suggestions' ? (
            // پیشنهادات هوشمند - بدون پیش‌نمایش
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  پیشنهادات بر اساس داده‌های شما
                </h3>
              </div>
              
              {/* Suggestions Grid - Full Width */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 border-2 rounded-xl transition-all border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                        {chartIcons[suggestion.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                          {suggestion.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-gray-700">
                      <span className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium">
                        {chartTypeLabels[suggestion.type]}
                      </span>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAddChart(suggestion)}
                        className="text-xs py-1.5 px-3"
                      >
                        <Plus className="h-3 w-3 ml-1" />
                        افزودن
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {suggestions.length === 0 && (
                <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">هیچ پیشنهادی برای نمایش وجود ندارد</p>
                </div>
              )}
            </div>
          ) : (
            // چارت سفارشی - با پیش‌نمایش
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Custom Chart Form - Left 1 column */}
              <div>
                <Card className="border-2 border-purple-200 dark:border-purple-800 sticky top-0">
                  <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-600" />
                      تنظیمات چارت سفارشی
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
                        نوع چارت
                      </label>
                      <Select
                        value={customChart.type}
                        onChange={(value) =>
                          setCustomChart({ ...customChart, type: value as ChartType })
                        }
                        options={chartTypeOptions}
                        placeholder="انتخاب کنید"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
                        محور X (افقی)
                      </label>
                      <Select
                        value={customChart.xColumn}
                        onChange={(value) =>
                          setCustomChart({ ...customChart, xColumn: value })
                        }
                        options={columnOptions}
                        placeholder="انتخاب ستون"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
                        محور Y (عمودی)
                      </label>
                      <Select
                        value={customChart.yColumn}
                        onChange={(value) =>
                          setCustomChart({ ...customChart, yColumn: value })
                        }
                        options={numericColumnOptions}
                        placeholder="انتخاب ستون عددی"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
                        عنوان چارت
                      </label>
                      <input
                        type="text"
                        value={customChart.title}
                        onChange={(e) =>
                          setCustomChart({ ...customChart, title: e.target.value })
                        }
                        placeholder="عنوان چارت را وارد کنید"
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <Button
                      variant="primary"
                      className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                      onClick={handleAddCustomChart}
                      disabled={!canPreviewCustom}
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      افزودن به داشبورد
                    </Button>

                    {!canPreviewCustom && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                        لطفاً همه فیلدها را پر کنید
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Preview - Right 2 columns */}
              <div className="lg:col-span-2">
                <Card className="border-2 border-purple-200 dark:border-purple-800 h-full">
                  <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      پیش‌نمایش زنده
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 h-full">
                    {canPreviewCustom ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">نوع:</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              {chartIcons[customChart.type]}
                              {chartTypeLabels[customChart.type]}
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">عنوان:</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {customChart.title}
                            </p>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4" style={{ height: 'calc(100% - 100px)' }}>
                          <EChartCard
                            title={customChart.title}
                            data={data || []}
                            xColumn={customChart.xColumn}
                            yColumn={customChart.yColumn}
                            type={customChart.type}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="h-96 flex items-center justify-center text-gray-400 dark:text-gray-600">
                        <div className="text-center">
                          <Zap className="h-16 w-16 mx-auto mb-3 opacity-50" />
                          <p className="text-base font-medium mb-1">آماده برای ساخت</p>
                          <p className="text-sm">فرم را پر کنید تا پیش‌نمایش نمایش داده شود</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}