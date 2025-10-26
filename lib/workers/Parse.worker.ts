/**
 * Web Worker برای پارس فایل‌های بزرگ Excel/CSV
 * استفاده اختیاری - برای جلوگیری از فریز UI
 */

// این فایل به‌صورت اختیاری است و می‌توان آن را در UploadDropzone استفاده کرد

self.addEventListener('message', async (e: MessageEvent) => {
  const { type, data } = e.data;

  try {
    if (type === 'parse-xlsx') {
      // در اینجا می‌توان xlsx را import کرد و پارس انجام داد
      // به دلیل محدودیت‌های worker، نیاز به تنظیمات اضافی در next.config.js دارد
      
      const result = {
        rows: [],
        columns: [],
      };

      self.postMessage({ type: 'success', data: result });
    } else if (type === 'parse-csv') {
      const { text, delimiter } = data;
      const lines = text.split('\n').filter((line: string) => line.trim());
      
      if (lines.length < 2) {
        throw new Error('فایل خالی است');
      }

      const headers = lines[0].split(delimiter).map((h: string) => h.trim());
      const rows: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter);
        const row: any = {};
        headers.forEach((header: string, idx: number) => {
          row[header] = values[idx]?.trim() || '';
        });
        rows.push(row);
      }

      self.postMessage({ 
        type: 'success', 
        data: { rows, headers } 
      });
    }
  } catch (error: any) {
    self.postMessage({ 
      type: 'error', 
      error: error.message 
    });
  }
});

export {};