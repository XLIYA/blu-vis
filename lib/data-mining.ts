import type { ColumnMeta } from './format';

export interface DataStatistics {
  totalRows: number;
  totalColumns: number;
  numericColumns: number;
  stringColumns: number;
  dateColumns: number;
  booleanColumns: number;
  missingValues: number;
  duplicateRows: number;
}

/**
 * محاسبه آمار کلی دیتاست
 */
export function calculateStatistics(
  data: any[],
  columns: ColumnMeta[]
): DataStatistics {
  const totalRows = data.length;
  const totalColumns = columns.length;

  const numericColumns = columns.filter((c) => c.type === 'number').length;
  const stringColumns = columns.filter((c) => c.type === 'string').length;
  const dateColumns = columns.filter((c) => c.type === 'date').length;
  const booleanColumns = columns.filter((c) => c.type === 'boolean').length;

  let missingValues = 0;
  data.forEach((row) => {
    Object.values(row).forEach((val) => {
      if (val === null || val === undefined || val === '') {
        missingValues++;
      }
    });
  });

  // شمارش ردیف‌های تکراری
  const duplicateRows = countDuplicates(data);

  return {
    totalRows,
    totalColumns,
    numericColumns,
    stringColumns,
    dateColumns,
    booleanColumns,
    missingValues,
    duplicateRows,
  };
}

function countDuplicates(data: any[]): number {
  const seen = new Set<string>();
  let duplicates = 0;

  data.forEach((row) => {
    const key = JSON.stringify(row);
    if (seen.has(key)) {
      duplicates++;
    } else {
      seen.add(key);
    }
  });

  return duplicates;
}

/**
 * محاسبه میانگین یک ستون عددی
 */
export function calculateMean(data: any[], columnName: string): number {
  const values = data
    .map((row) => parseFloat(row[columnName]))
    .filter((v) => !isNaN(v));

  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * محاسبه میانه یک ستون عددی
 */
export function calculateMedian(data: any[], columnName: string): number {
  const values = data
    .map((row) => parseFloat(row[columnName]))
    .filter((v) => !isNaN(v))
    .sort((a, b) => a - b);

  if (values.length === 0) return 0;

  const mid = Math.floor(values.length / 2);
  return values.length % 2 === 0
    ? (values[mid - 1] + values[mid]) / 2
    : values[mid];
}

/**
 * پیدا کردن outlierها با روش IQR (نمونه)
 */
export function findOutliers(
  data: any[],
  columnName: string,
  sampleSize = 2000
): { lower: number; upper: number; count: number } {
  const sample = data.slice(0, Math.min(sampleSize, data.length));
  const values = sample
    .map((row) => parseFloat(row[columnName]))
    .filter((v) => !isNaN(v))
    .sort((a, b) => a - b);

  if (values.length < 4) return { lower: 0, upper: 0, count: 0 };

  const q1Index = Math.floor(values.length * 0.25);
  const q3Index = Math.floor(values.length * 0.75);

  const q1 = values[q1Index];
  const q3 = values[q3Index];
  const iqr = q3 - q1;

  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;

  const count = values.filter((v) => v < lower || v > upper).length;

  return { lower, upper, count };
}

/**
 * محاسبه همبستگی ساده بین دو ستون عددی (Pearson)
 */
export function calculateCorrelation(
  data: any[],
  col1: string,
  col2: string,
  sampleSize = 2000
): number {
  const sample = data.slice(0, Math.min(sampleSize, data.length));
  const pairs: Array<[number, number]> = [];

  sample.forEach((row) => {
    const x = parseFloat(row[col1]);
    const y = parseFloat(row[col2]);
    if (!isNaN(x) && !isNaN(y)) {
      pairs.push([x, y]);
    }
  });

  if (pairs.length < 2) return 0;

  const n = pairs.length;
  const sumX = pairs.reduce((sum, [x]) => sum + x, 0);
  const sumY = pairs.reduce((sum, [, y]) => sum + y, 0);
  const sumXY = pairs.reduce((sum, [x, y]) => sum + x * y, 0);
  const sumX2 = pairs.reduce((sum, [x]) => sum + x * x, 0);
  const sumY2 = pairs.reduce((sum, [, y]) => sum + y * y, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * توزیع فراوانی یک ستون (برای categorical یا binned numeric)
 */
export function getFrequencyDistribution(
  data: any[],
  columnName: string,
  topK = 10
): Array<{ value: string; count: number }> {
  const frequency = new Map<string, number>();

  data.forEach((row) => {
    const value = String(row[columnName] ?? '');
    frequency.set(value, (frequency.get(value) || 0) + 1);
  });

  return Array.from(frequency.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topK);
}