import type { ColumnMeta } from './format';

export type ChartType = 'bar' | 'line' | 'scatter' | 'pie';

export interface ChartSuggestion {
  type: ChartType;
  xColumn: string;
  yColumn: string;
  title: string;
}

/**
 * پیشنهاد خودکار نمودار بر اساس انواع ستون‌ها
 */
export function suggestCharts(
  columns: ColumnMeta[],
  maxSuggestions = 3
): ChartSuggestion[] {
  const suggestions: ChartSuggestion[] = [];

  const numericCols = columns.filter((c) => c.type === 'number');
  const categoricalCols = columns.filter(
    (c) => c.type === 'string' || c.type === 'boolean'
  );
  const dateCols = columns.filter((c) => c.type === 'date');

  // پیشنهاد 1: اگر ستون تاریخ و عددی داریم → Line Chart
  if (dateCols.length > 0 && numericCols.length > 0) {
    suggestions.push({
      type: 'line',
      xColumn: dateCols[0].name,
      yColumn: numericCols[0].name,
      title: `روند ${numericCols[0].name} در طول زمان`,
    });
  }

  // پیشنهاد 2: اگر ستون دسته‌ای و عددی داریم → Bar Chart
  if (categoricalCols.length > 0 && numericCols.length > 0) {
    suggestions.push({
      type: 'bar',
      xColumn: categoricalCols[0].name,
      yColumn: numericCols[0].name,
      title: `مقایسه ${numericCols[0].name} بر اساس ${categoricalCols[0].name}`,
    });
  }

  // پیشنهاد 3: اگر دو ستون عددی داریم → Scatter Plot
  if (numericCols.length >= 2) {
    suggestions.push({
      type: 'scatter',
      xColumn: numericCols[0].name,
      yColumn: numericCols[1].name,
      title: `ارتباط ${numericCols[0].name} و ${numericCols[1].name}`,
    });
  }

  // حداکثر تعداد پیشنهادها
  return suggestions.slice(0, maxSuggestions);
}