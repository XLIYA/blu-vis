/**
 * تنظیمات encoding برای xlsx
 * cpexcel برای پشتیبانی بهتر از انکودینگ‌های مختلف (اختیاری)
 */

let cpexcelLoaded = false;

/**
 * بارگذاری cpexcel در صورت نیاز
 */
export async function loadCpexcel() {
  if (cpexcelLoaded) return;

  try {
    // در صورت نیاز به cpexcel، می‌توان آن را نصب کرد
    // const cptable = await import('xlsx/dist/cpexcel.full.mjs');
    // const XLSX = await import('xlsx');
    // XLSX.set_cptable(cptable);
    cpexcelLoaded = true;
  } catch (error) {
    console.warn('cpexcel بارگذاری نشد:', error);
  }
}

/**
 * تشخیص و تبدیل encoding فارسی
 */
export function decodeText(buffer: ArrayBuffer): string {
  try {
    // تلاش با UTF-8
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(buffer);
    
    // بررسی کاراکترهای فارسی
    if (/[\u0600-\u06FF]/.test(text)) {
      return text;
    }

    // تلاش با Windows-1256 (فارسی)
    const decoder1256 = new TextDecoder('windows-1256');
    return decoder1256.decode(buffer);
  } catch (error) {
    console.error('خطا در decode:', error);
    return new TextDecoder('utf-8').decode(buffer);
  }
}