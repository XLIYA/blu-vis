'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/toast';
import { useDataStore } from '@/stores/dataStore';
import { exportToPDF } from '@/lib/pdf-export';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const { data, columns } = useDataStore();
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportJSON = () => {
    try {
      const json = JSON.stringify({ columns, data }, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('success', 'فایل JSON دانلود شد');
    } catch (error) {
      showToast('error', 'خطا در خروجی JSON');
    }
  };

  const exportCSV = () => {
    try {
      const headers = columns.map((c) => c.name).join(',');
      const rows = data
        .map((row) =>
          columns
            .map((c) => {
              const val = row[c.name];
              const str = String(val ?? '');
              return str.includes(',') ? `"${str}"` : str;
            })
            .join(',')
        )
        .join('\n');

      const csv = headers + '\n' + rows;
      const blob = new Blob(['\ufeff' + csv], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data-export-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('success', 'فایل CSV دانلود شد');
    } catch (error) {
      showToast('error', 'خطا در خروجی CSV');
    }
  };

  const exportPDFHandler = async () => {
    setIsExporting(true);
    try {
      await exportToPDF(data, columns);
      showToast('success', 'فایل PDF دانلود شد');
    } catch (error) {
      showToast('error', 'خطا در خروجی PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="خروجی داده" size="sm">
      <div className="space-y-3">
        <Button
          onClick={exportJSON}
          variant="outline"
          className="w-full justify-start"
          disabled={isExporting}
        >
          <Download className="h-4 w-4 ml-2" />
          خروجی JSON
        </Button>

        <Button
          onClick={exportCSV}
          variant="outline"
          className="w-full justify-start"
          disabled={isExporting}
        >
          <Download className="h-4 w-4 ml-2" />
          خروجی CSV
        </Button>

        <Button
          onClick={exportPDFHandler}
          variant="outline"
          className="w-full justify-start"
          disabled={isExporting}
        >
          <Download className="h-4 w-4 ml-2" />
          {isExporting ? 'در حال تولید PDF...' : 'خروجی PDF'}
        </Button>

        <div className="pt-4 border-t">
          <Button onClick={onClose} variant="secondary" className="w-full">
            بستن
          </Button>
        </div>
      </div>
    </Modal>
  );
}