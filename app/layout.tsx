import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import Providers from './providers';



const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-vazirmatn',
});

export const metadata: Metadata = {
  title: 'BluVis - داشبورد هوشمند تحلیل داده',
  description: 'پلتفرم قدرتمند برای تحلیل، بصری‌سازی و تمیزسازی داده‌ها',
  keywords: 'داشبورد, تحلیل داده, بصری‌سازی, چارت, دیتا',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazirmatn.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}