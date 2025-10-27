'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ChartType } from '@/lib/auto-chart-generator';

export interface DashboardChart {
  id: string;
  type: ChartType;
  xColumn: string;
  yColumn: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface DashboardContextType {
  charts: DashboardChart[];
  addChart: (chart: Omit<DashboardChart, 'id'>) => void;
  removeChart: (id: string) => void;
  updateChart: (id: string, updates: Partial<DashboardChart>) => void;
  clearCharts: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [charts, setCharts] = useState<DashboardChart[]>([]);

  const addChart = (chart: Omit<DashboardChart, 'id'>) => {
    const newChart: DashboardChart = {
      ...chart,
      id: `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setCharts((prev) => [...prev, newChart]);
  };

  const removeChart = (id: string) => {
    setCharts((prev) => prev.filter((chart) => chart.id !== id));
  };

  const updateChart = (id: string, updates: Partial<DashboardChart>) => {
    setCharts((prev) =>
      prev.map((chart) => (chart.id === id ? { ...chart, ...updates } : chart))
    );
  };

  const clearCharts = () => {
    setCharts([]);
  };

  return (
    <DashboardContext.Provider
      value={{ charts, addChart, removeChart, updateChart, clearCharts }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
