'use client';

import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import { 
  Upload, 
  BarChart3, 
  Sparkles, 
  Zap,
  TrendingUp,
  Download
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: <Upload className="h-6 w-6 text-blue-500" />,
      title: 'بارگذاری آسان',
      description: 'CSV, Excel, TSV',
    },
    {
      icon: <Sparkles className="h-6 w-6 text-purple-500" />,
      title: 'تمیزسازی هوشمند',
      description: 'الگوریتم‌های پیشرفته',
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-green-500" />,
      title: 'چارت‌های متنوع',
      description: '10+ نوع چارت حرفه‌ای',
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: 'پیشنهاد هوشمند',
      description: 'سیستم AI پیشرفته',
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-indigo-500" />,
      title: 'داشبورد تعاملی',
      description: 'کاملاً قابل سفارشی‌سازی',
    },
    {
      icon: <Download className="h-6 w-6 text-red-500" />,
      title: 'گزارش PDF',
      description: 'خروجی حرفه‌ای',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      {/* Hero Section - Compact */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-white/10 dark:from-transparent dark:to-transparent" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-xs font-medium mb-6">
              <Zap className="h-3 w-3" />
              پلتفرم تحلیل داده نسل جدید
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              داشبورد هوشمند
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2">
                تحلیل و بصری‌سازی داده
              </span>
            </h1>

            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              داده‌های خود را بارگذاری کنید، تمیز کنید و با چارت‌های زیبا به آن‌ها جان ببخشید
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <Button
                size="lg"
                variant="primary"
                onClick={() => router.push('/preview')}
                className="px-6 py-3"
              >
                <Upload className="h-4 w-4 ml-2" />
                شروع کنید
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3"
              >
                <TrendingUp className="h-4 w-4 ml-2" />
                مشاهده نمونه
              </Button>
            </div>

            {/* Stats - Compact */}
            <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
              {[
                { label: 'نوع چارت', value: '10+' },
                { label: 'فرمت', value: '4+' },
                { label: 'ابزار', value: '8+' },
                { label: 'PDF', value: '✓' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features - Compact Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2"
              >
                <CardContent className="p-4 text-center">
                  <div className="mb-2 flex justify-center">{feature.icon}</div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}