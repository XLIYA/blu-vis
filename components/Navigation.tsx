'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Upload, LayoutDashboard, Moon, Sun, BarChart3 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/format';

const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
        </div>
      )}
    </div>
  );
};

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', label: 'خانه', icon: Home },
    { path: '/preview', label: 'بارگذاری', icon: Upload },
    { path: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  ];

  return (
    <nav className="sticky top-8 z-50 mx-4 md:mx-8 mt-4">
      <div className="max-w-7xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo و عنوان */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-gray-900 dark:text-white">
                BluVis
              </h1>
            </div>
          </div>

          {/* Navigation Links - الآن در سمت چپ */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              
              return (
                <Tooltip key={item.path} content={item.label}>
                  <button
                    onClick={() => router.push(item.path)}
                    className={cn(
                      'flex items-center justify-center p-2 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                </Tooltip>
              );
            })}

            {/* Dark Mode Toggle */}
            <div className="ml-2 pl-2 border-r border-gray-200 dark:border-gray-700">
              <Tooltip content={theme === 'light' ? 'حالت تاریک' : 'حالت روشن'}>
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
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}