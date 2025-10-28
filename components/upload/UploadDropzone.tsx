'use client';

import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/format';
import { useToast } from '@/components/ui/toast';
import { inferColumnTypes } from '@/lib/format';
import { detectDelimiter } from '@/lib/detect-delimiter';

interface UploadDropzoneProps {
  onDataLoaded: (data: any[], columns: any[], fileName: string) => void;
}

export default function UploadDropzone({ onDataLoaded }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const processFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);

      try {
        const ext = file.name.split('.').pop()?.toLowerCase();

        if (ext === 'csv' || ext === 'tsv') {
          // پردازش CSV/TSV با رمزگذاری صحیح
          const arrayBuffer = await file.arrayBuffer();
          
          // تشخیص encoding
          let text: string;
          try {
            // ابتدا UTF-8 را امتحان کنید
            const decoder = new TextDecoder('utf-8', { fatal: true });
            text = decoder.decode(arrayBuffer);
          } catch {
            try {
              // اگر UTF-8 کار نکرد، Windows-1256 (فارسی/عربی) را امتحان کنید
              const decoder = new TextDecoder('windows-1256');
              text = decoder.decode(arrayBuffer);
            } catch {
              // آخرین تلاش با ISO-8859-1
              const decoder = new TextDecoder('iso-8859-1');
              text = decoder.decode(arrayBuffer);
            }
          }

          const delimiter = ext === 'tsv' ? '\t' : detectDelimiter(text);
          const lines = text.split('\n').filter((line) => line.trim());

          if (lines.length < 2) {
            showToast('error', 'فایل خالی است یا فرمت نامعتبر دارد');
            return;
          }

          const headers = lines[0].split(delimiter).map((h) => h.trim());
          const rows: any[] = [];

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(delimiter);
            const row: any = {};
            headers.forEach((header, idx) => {
              row[header] = values[idx]?.trim() || '';
            });
            rows.push(row);
          }

          const columns = inferColumnTypes(rows);
          onDataLoaded(rows, columns, file.name);
          showToast('success', `${rows.length.toLocaleString('fa-IR')} ردیف بارگذاری شد`);
        } else if (ext === 'xlsx' || ext === 'xls') {
          // پردازش Excel با رمزگذاری صحیح
          const XLSX = await import('xlsx');
          const arrayBuffer = await file.arrayBuffer();
          
          // خواندن workbook با تنظیمات صحیح برای encoding
          const workbook = XLSX.read(arrayBuffer, { 
            type: 'array',
            cellText: true,
            cellDates: true,
            codepage: 65001 // UTF-8
          });

          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // تبدیل به JSON با حفظ encoding
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            defval: '',
            raw: false,
            dateNF: 'yyyy-mm-dd',
          });

          if (jsonData.length === 0) {
            showToast('error', 'فایل خالی است');
            return;
          }

          const columns = inferColumnTypes(jsonData);
          onDataLoaded(jsonData, columns, file.name);
          showToast(
            'success',
            `${jsonData.length.toLocaleString('fa-IR')} ردیف بارگذاری شد`
          );
        } else {
          showToast('error', 'فرمت فایل پشتیبانی نمی‌شود');
        }
      } catch (error) {
        console.error('خطا در پردازش فایل:', error);
        showToast('error', 'خطا در بارگذاری فایل. لطفاً فرمت فایل را بررسی کنید.');
      } finally {
        setIsProcessing(false);
      }
    },
    [onDataLoaded, showToast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'relative border-2 border-dashed rounded-xl p-8 transition-all',
        isDragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
      )}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".xlsx,.xls,.csv,.tsv"
        onChange={handleFileInput}
        disabled={isProcessing}
      />

      <label
        htmlFor="file-upload"
        className="flex flex-col items-center cursor-pointer"
      >
        <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-3" />
        <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
          {isProcessing ? 'در حال پردازش...' : 'فایل خود را اینجا رها کنید'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          یا کلیک کنید تا فایل را انتخاب کنید
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          XLSX, XLS, CSV, TSV
        </p>
      </label>

      {isProcessing && (
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 flex items-center justify-center rounded-xl backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400">در حال بارگذاری...</p>
          </div>
        </div>
      )}
    </div>
  );
}