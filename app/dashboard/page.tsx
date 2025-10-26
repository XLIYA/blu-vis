'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/dashboard/Topbar';
import Toolbar from '@/components/dashboard/Toolbar';
import EChartCard from '@/components/charts/EChartCard';
import Button from '@/components/ui/Button';
import { useDataStore } from '@/stores/dataStore';
import { calculateStatistics } from '@/lib/data-mining';
import { suggestCharts, type ChartType } from '@/lib/auto-chart-generator';
import { Home } from 'lucide-react';
import EmptyState from '@/components/dashboard/Emptystate';
import StatsPanel from '@/components/dashboard/Statspanel';

export default function DashboardPage() {
  const router = useRouter();
  const { data, columns } = useDataStore();

  const stats = useMemo(() => {
    if (data.length === 0) return null;
    return calculateStatistics(data, columns);
  }, [data, columns]);

  const chartSuggestions = useMemo(() => {
    if (columns.length === 0) return [];
    return suggestCharts(columns, 1);
  }, [columns]);

  const [activeChart, setActiveChart] = useState<{
    type: ChartType;
    xColumn: string;
    yColumn: string;
    title: string;
  } | null>(chartSuggestions[0] || null);

  const handleChartChange = (type: ChartType, xColumn: string, yColumn: string) => {
    setActiveChart({
      type,
      xColumn,
      yColumn,
      title: `نمودار ${xColumn} و ${yColumn}`,
    });
  };

  if (data.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Topbar
          title="داشبورد"
          actions={
            <Button variant="outline" size="sm" onClick={() => router.push('/')}>
              <Home className="h-4 w-4 ml-2" />
              صفحه اصلی
            </Button>
          }
        />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Topbar
        title="داشبورد"
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push('/')}>
            <Home className="h-4 w-4 ml-2" />
            صفحه اصلی
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {stats && <StatsPanel stats={stats} />}

          {columns.length > 0 && (
            <Toolbar columns={columns} onChartChange={handleChartChange} />
          )}

          {activeChart && (
            <EChartCard
              title={activeChart.title}
              data={data}
              xColumn={activeChart.xColumn}
              yColumn={activeChart.yColumn}
              type={activeChart.type}
            />
          )}
        </div>
      </div>
    </div>
  );
}