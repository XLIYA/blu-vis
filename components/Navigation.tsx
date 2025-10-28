'use client';

import { useState, useId, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Upload, LayoutDashboard, Moon, Sun, BarChart3 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/format';

const Tooltip = ({
  children,
  content,
  className,
}: {
  children: ReactNode;
  content: string;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const id = useId();

  const handleTouchStart = () => {
    setIsVisible(true);
    window.setTimeout(() => setIsVisible(false), 1200);
  };

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      onTouchStart={handleTouchStart}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          id={id}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg"
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
        </div>
      )}
    </div>
  );
};

export default function Navigation() {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', label: 'خانه', icon: Home },
    { path: '/preview', label: 'بارگذاری', icon: Upload },
    { path: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  ] as const;

  const isRouteActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  return (
    <nav className="sticky top-8 z-50 mx-4 md:mx-8 mt-4" aria-label="ناوبری اصلی">
      <div className="max-w-7xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo و عنوان */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center"
              aria-hidden="true"
            >
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-gray-900 dark:text-white">
                BluVis
              </h1>
            </div>
          </div>

          {/* Links + Theme toggle با فاصله یکنواخت و بدون خط جداکننده */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isRouteActive(item.path);
              return (
                <Tooltip key={item.path} content={item.label}>
                  <Button
                    variant={active ? 'secondary' : 'ghost'}
                    size="icon"               // ← اگر راه‌حل B را می‌زنی: size="sm" و className="h-9 w-9 p-0"
                    onClick={() => router.push(item.path)}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      active
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </Tooltip>
              );
            })}

            {/* Dark Mode Toggle - بدون divider */}
            <Tooltip content={theme === 'light' ? 'حالت تاریک' : 'حالت روشن'}>
              <Button
                variant="ghost"
                size="icon"            // ← اگر راه‌حل B را می‌زنی: size="sm" و className="h-9 w-9 p-0"
                onClick={toggleTheme}
                aria-label="تغییر تم"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Sun className="h-5 w-5" aria-hidden="true" />
                )}
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </nav>
  );
}
