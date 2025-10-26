import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ColumnType = 'number' | 'string' | 'date' | 'boolean';

export interface ColumnMeta {
  name: string;
  type: ColumnType;
}

/**
 * تشخیص نوع ستون بر اساس مقادیر
 */
export function inferColumnTypes(data: any[]): ColumnMeta[] {
  if (!data || data.length === 0) return [];

  const firstRow = data[0];
  const columns = Object.keys(firstRow);

  return columns.map((name) => {
    const type = detectType(data, name);
    return { name, type };
  });
}

function detectType(data: any[], columnName: string): ColumnType {
  // نمونه‌برداری از 100 ردیف اول
  const sample = data.slice(0, 100);
  const values = sample
    .map((row) => row[columnName])
    .filter((v) => v !== null && v !== undefined && v !== '');

  if (values.length === 0) return 'string';

  let numberCount = 0;
  let booleanCount = 0;
  let dateCount = 0;

  for (const value of values) {
    if (typeof value === 'boolean') {
      booleanCount++;
    } else if (typeof value === 'number' && !isNaN(value)) {
      numberCount++;
    } else if (typeof value === 'string') {
      // بررسی عدد
      const num = parseFloat(value.replace(/,/g, ''));
      if (!isNaN(num)) {
        numberCount++;
        continue;
      }

      // بررسی boolean
      const lower = value.toLowerCase().trim();
      if (['true', 'false', 'yes', 'no', 'بله', 'خیر'].includes(lower)) {
        booleanCount++;
        continue;
      }

      // بررسی تاریخ
      if (isDateString(value)) {
        dateCount++;
      }
    }
  }

  const total = values.length;
  if (numberCount / total > 0.7) return 'number';
  if (booleanCount / total > 0.7) return 'boolean';
  if (dateCount / total > 0.7) return 'date';

  return 'string';
}

function isDateString(str: string): boolean {
  // بررسی فرمت‌های رایج تاریخ
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/, // 2025-01-15
    /^\d{2}\/\d{2}\/\d{4}$/, // 15/01/2025
    /^\d{4}\/\d{2}\/\d{2}$/, // 2025/01/15
    /^\d{1,2}-\d{1,2}-\d{4}$/, // 15-1-2025
  ];

  return datePatterns.some((pattern) => pattern.test(str.trim()));
}

/**
 * فرمت عدد به فارسی با کاما
 */
export function formatNumber(num: number, decimals = 2): string {
  return num.toLocaleString('fa-IR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * تبدیل اعداد انگلیسی به فارسی
 */
export function toPersianDigits(str: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(str).replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
}

/**
 * خلاصه کردن متن طولانی
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}