'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DashboardProvider } from '@/contexts/DashboardContext';
import { ToastProvider } from '@/components/ui/toast';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <DashboardProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </DashboardProvider>
    </ThemeProvider>
  );
}