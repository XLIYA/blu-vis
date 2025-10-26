'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/toast';
import { useDataStore } from '@/stores/dataStore';
import { inferColumnTypes } from '@/lib/format';

interface DataCleaningDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataCleaningDialog({
  isOpen,
  onClose,
}: DataCleaningDialogProps) {
  const { data, columns, setData } = useDataStore();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const removeDuplicates = () => {
    setIsProcessing(true);
    const seen = new Set<string>();
    const uniqueData = data.filter((row) => {
      const key = JSON.stringify(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const removed = data.length - uniqueData.length;
    setData({ data: uniqueData, rows: uniqueData.length });
    showToast('success', `${removed} ردیف تکراری حذف شد`);
    setIsProcessing(false);
  };

  const fillMissingWithDefault = () => {
    setIsProcessing(true);
    const cleanedData = data.map((row) => {
      const newRow: any = {};
      columns.forEach((col) => {
        const value = row[col.name];
        if (value === null || value === undefined || value === '') {
          newRow[col.name] = col.type === 'number' ? 0 : '-';
        } else {
          newRow[col.name] = value;
        }
      });
      return newRow;
    });

    setData({ data: cleanedData });
    showToast('success', 'مقادیر مفقود با مقدار پیش‌فرض پر شدند');
    setIsProcessing(false);
  };

  const fillMissingWithMean = () => {
    setIsProcessing(true);
    const means: Record<string, number> = {};

    // محاسبه میانگین ستون‌های عددی
    columns
      .filter((c) => c.type === 'number')
      .forEach((col) => {
        const values = data
          .map((row) => parseFloat(row[col.name]))
          .filter((v) => !isNaN(v));
        means[col.name] =
          values.length > 0
            ? values.reduce((sum, v) => sum + v, 0) / values.length
            : 0;
      });

    const cleanedData = data.map((row) => {
      const newRow: any = {};
      columns.forEach((col) => {
        const value = row[col.name];
        if (value === null || value === undefined || value === '') {
          newRow[col.name] =
            col.type === 'number' && means[col.name] !== undefined
              ? means[col.name].toFixed(2)
              : '-';
        } else {
          newRow[col.name] = value;
        }
      });
      return newRow;
    });

    setData({ data: cleanedData });
    showToast('success', 'مقادیر مفقود با میانگین پر شدند');
    setIsProcessing(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تمیزسازی داده" size="md">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">حذف ردیف‌های تکراری</h3>
          <p className="text-sm text-gray-600 mb-3">
            تمام ردیف‌هایی که کاملاً مشابه هم هستند حذف می‌شوند
          </p>
          <Button
            onClick={removeDuplicates}
            disabled={isProcessing}
            variant="outline"
            className="w-full"
          >
            حذف تکراری‌ها
          </Button>
        </div>

        <div>
          <h3 className="font-medium mb-2">پرکردن مقادیر مفقود</h3>
          <p className="text-sm text-gray-600 mb-3">
            سلول‌های خالی را با مقدار پیش‌فرض یا میانگین پر کنید
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={fillMissingWithDefault}
              disabled={isProcessing}
              variant="outline"
            >
              مقدار پیش‌فرض
            </Button>
            <Button
              onClick={fillMissingWithMean}
              disabled={isProcessing}
              variant="outline"
            >
              میانگین (عددی)
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={onClose} variant="secondary" className="w-full">
            بستن
          </Button>
        </div>
      </div>
    </Modal>
  );
}