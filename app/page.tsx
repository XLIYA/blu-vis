'use client';

import { BarChart3, Upload, Zap, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            داشبورد هوشمند تحلیل داده
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            فایل‌های Excel و CSV خود را بارگذاری کنید و با ابزارهای پیشرفته، داده‌های خود را تحلیل و بصری‌سازی کنید
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/preview')}
              className="text-lg px-8 py-4"
            >
              <Upload className="ml-2 h-5 w-5" />
              شروع با بارگذاری داده
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="text-lg px-8 py-4"
            >
              <BarChart3 className="ml-2 h-5 w-5" />
              رفتن به داشبورد
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            قابلیت‌های کلیدی
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">سرعت بالا</h3>
              <p className="text-gray-600">
                پردازش و نمایش روان داده‌های بزرگ با بیش از ۱۵ هزار ردیف
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">نمودارهای متنوع</h3>
              <p className="text-gray-600">
                تولید خودکار نمودارهای میله‌ای، خطی و پراکنش از داده‌های شما
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">امنیت کامل</h3>
              <p className="text-gray-600">
                تمام پردازش در مرورگر شما انجام می‌شود، بدون ارسال به سرور
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}