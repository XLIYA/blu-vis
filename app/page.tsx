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
  Layers,
  Download
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: <Upload className="h-8 w-8 text-blue-500" />,
      title: 'بارگذاری آسان',
      description: 'پشتیبانی از فرمت‌های CSV, Excel, TSV با drag & drop',
    },
    {
      icon: <Sparkles className="h-8 w-8 text-purple-500" />,
      title: 'تمیزسازی هوشمند',
      description: 'حذف تکراری‌ها، پر کردن مقادیر مفقود با الگوریتم‌های پیشرفته',
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-green-500" />,
      title: 'چارت‌های متنوع',
      description: '10+ نوع چارت حرفه‌ای: میله‌ای، خطی، دایره‌ای، راداری و...',
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: 'پیشنهادات هوشمند',
      description: 'سیستم AI برای پیشنهاد بهترین نوع چارت بر اساس داده‌ها',
    },
    {
      icon: <Layers className="h-8 w-8 text-indigo-500" />,
      title: 'داشبورد تعاملی',
      description: 'ساخت داشبورد شخصی با امکان drag & drop و سفارشی‌سازی',
    },
    {
      icon: <Download className="h-8 w-8 text-red-500" />,
      title: 'خروجی PDF',
      description: 'تبدیل داشبورد به PDF با کیفیت بالا و قابل چاپ',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'بارگذاری داده',
      description: 'فایل CSV یا Excel خود را آپلود کنید',
      icon: <Upload className="h-6 w-6" />,
    },
    {
      number: '2',
      title: 'تمیزسازی',
      description: 'داده‌ها را با ابزارهای هوشمند پاکسازی کنید',
      icon: <Sparkles className="h-6 w-6" />,
    },
    {
      number: '3',
      title: 'ساخت داشبورد',
      description: 'چارت‌های دلخواه را انتخاب یا بسازید',
      icon: <BarChart3 className="h-6 w-6" />,
    },
    {
      number: '4',
      title: 'خروجی گرفتن',
      description: 'داشبورد را به PDF یا تصویر تبدیل کنید',
      icon: <Download className="h-6 w-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-600/5 dark:to-indigo-600/5" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-in fade-in">
              <Zap className="h-4 w-4" />
              پلتفرم تحلیل داده نسل جدید
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-in slide-in-from-left">
              داشبورد هوشمند
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                تحلیل و بصری‌سازی داده
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto animate-in slide-in-from-right">
              داده‌های خود را بارگذاری کنید، تمیز کنید و با چارت‌های زیبا و حرفه‌ای به آن‌ها جان ببخشید
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in scale-in">
              <Button
                size="lg"
                variant="primary"
                onClick={() => router.push('/preview')}
                className="text-lg px-8 py-4"
              >
                <Upload className="h-5 w-5 ml-2" />
                شروع کنید - رایگان
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="text-lg px-8 py-4"
              >
                <TrendingUp className="h-5 w-5 ml-2" />
                مشاهده نمونه
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { label: 'نوع چارت', value: '10+' },
              { label: 'فرمت پشتیبانی', value: '4+' },
              { label: 'ابزار تمیزسازی', value: '8+' },
              { label: 'خروجی PDF', value: '✓' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              قابلیت‌های قدرتمند
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              تمام ابزارهایی که برای تحلیل و بصری‌سازی داده‌های خود نیاز دارید
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              چگونه کار می‌کند؟
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              فقط 4 قدم تا داشبورد حرفه‌ای شما
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                      {step.number}
                    </div>
                    <div className="text-blue-600 dark:text-blue-400 mb-3 flex justify-center">
                      {step.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -left-4 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            آماده‌اید تا داده‌های خود را زنده کنید؟
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            هم‌اکنون شروع کنید و اولین داشبورد خود را بسازید
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push('/preview')}
            className="text-lg px-10 py-4 bg-white text-blue-600 hover:bg-gray-100"
          >
            <Upload className="h-5 w-5 ml-2" />
            بارگذاری فایل
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">BluVis Analytics</span>
            </div>
            
            <div className="text-center md:text-right">
              <p>© 2025 BluVis Analytics. تمامی حقوق محفوظ است.</p>
              <p className="text-sm mt-1">ساخته شده با ❤️ برای تحلیلگران داده</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}