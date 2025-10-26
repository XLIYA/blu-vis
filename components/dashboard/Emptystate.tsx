'use client';

import { FileQuestion } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function EmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <FileQuestion className="h-20 w-20 text-gray-300 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        داده‌ای بارگذاری نشده
      </h2>
      <p className="text-gray-500 text-center mb-6 max-w-md">
        برای مشاهده نمودارها و تحلیل داده، ابتدا یک فایل را در صفحه پیش‌نمایش
        بارگذاری کنید
      </p>
      <Button onClick={() => router.push('/preview')}>
        رفتن به صفحه بارگذاری
      </Button>
    </div>
  );
}