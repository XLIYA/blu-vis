import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'داشبورد هوشمند',
  description: 'تحلیل و بصری‌سازی داده‌های Excel و CSV',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className={vazirmatn.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}