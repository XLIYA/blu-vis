'use client';

import { useState } from 'react';
import { Download, Trash2, Sparkles } from 'lucide-react';
import UploadDropzone from '@/components/upload/UploadDropzone';
import VirtualizedTable from '@/components/table/VirtualizedTable';
import Topbar from '@/components/dashboard/Topbar';
import Button from '@/components/ui/Button';
import { useDataStore } from '@/stores/dataStore';
import { useToast } from '@/components/ui/toast';
import QuickInsights from '@/components/preview/Quickinsights';
import DataCleaningDialog from '@/components/preview/Datacleaningdialog';
import ExportDialog from '@/components/preview/Exportdialog';

export default function PreviewPage() {
  const { data, columns, setData, reset } = useDataStore();
  const { showToast } = useToast();
  const [showCleaningDialog, setShowCleaningDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const handleDataLoaded = (newData: any[], newColumns: any[], fileName: string) => {
    setData({
      data: newData,
      columns: newColumns,
      rows: newData.length,
      fileName,
    });
  };

  const handleReset = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید داده‌ها را پاک کنید؟')) {
      reset();
      showToast('info', 'داده‌ها پاک شدند');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Topbar
        title="پیش‌نمایش و بارگذاری"
        actions={
          data.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCleaningDialog(true)}
              >
                <Sparkles className="h-4 w-4 ml-2" />
                تمیزسازی
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportDialog(true)}
              >
                <Download className="h-4 w-4 ml-2" />
                خروجی
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReset}
              >
                <Trash2 className="h-4 w-4 ml-2" />
                پاک کردن
              </Button>
            </>
          )
        }
      />

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {data.length === 0 ? (
            <UploadDropzone onDataLoaded={handleDataLoaded} />
          ) : (
            <>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <VirtualizedTable data={data} columns={columns} />
                </div>
                <div>
                  <QuickInsights data={data} columns={columns} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <DataCleaningDialog
        isOpen={showCleaningDialog}
        onClose={() => setShowCleaningDialog(false)}
      />

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
    </div>
  );
}