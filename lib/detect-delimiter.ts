/**
 * تشخیص delimiter در فایل‌های CSV/TSV
 */
export function detectDelimiter(text: string): string {
  const delimiters = [',', '\t', ';', '|'];
  const lines = text.split('\n').slice(0, 5); // 5 خط اول

  let maxCount = 0;
  let bestDelimiter = ',';

  for (const delimiter of delimiters) {
    const counts = lines.map((line) => {
      const count = line.split(delimiter).length - 1;
      return count;
    });

    // بررسی یکنواختی
    const firstCount = counts[0];
    const isConsistent = counts.every((c) => c === firstCount && c > 0);

    if (isConsistent && firstCount > maxCount) {
      maxCount = firstCount;
      bestDelimiter = delimiter;
    }
  }

  return bestDelimiter;
}