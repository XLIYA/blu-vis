'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Upload, LayoutDashboard, Moon, Sun, BarChart3 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/format';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', label: 'خانه', icon: Home },
    { path: '/preview', label: 'بارگذاری', icon: Upload },
    { path: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
    { path: '/builder', label: 'ساخت داشبورد', icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo و عنوان */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                داشبورد هوشمند
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                تحلیل و بصری‌سازی داده
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2"
            aria-label="تغییر تم"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
}
