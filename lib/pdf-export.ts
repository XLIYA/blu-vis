import type { ColumnMeta } from './format';

/**
 * خروجی PDF از داده‌ها و نمودارها
 * این فایل فقط در client اجرا می‌شود
 */
export async function exportToPDF(
  data: any[],
  columns: ColumnMeta[],
  elementId?: string
): Promise<void> {
  // Dynamic import برای جلوگیری از SSR
  const html2canvas = (await import('html2canvas')).default;
  const jsPDF = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();

  // عنوان فارسی
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setR2L(true);
  pdf.text('گزارش تحلیل داده', pageWidth / 2, 15, { align: 'center' });

  let yPosition = 25;

  // اگر element برای capture وجود دارد
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // اگر تصویر خیلی بزرگ باشد، صفحه جدید
        if (yPosition + imgHeight > pdf.internal.pageSize.getHeight() - 20) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (error) {
        console.error('خطا در capture تصویر:', error);
      }
    }
  }

  // جدول خلاصه آمار
  if (yPosition > pdf.internal.pageSize.getHeight() - 60) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(12);
  pdf.text('خلاصه آماری', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  const statsData = [
    ['تعداد ردیف‌ها', data.length.toLocaleString('fa-IR')],
    ['تعداد ستون‌ها', columns.length.toLocaleString('fa-IR')],
    [
      'ستون‌های عددی',
      columns.filter((c) => c.type === 'number').length.toLocaleString('fa-IR'),
    ],
    [
      'ستون‌های متنی',
      columns.filter((c) => c.type === 'string').length.toLocaleString('fa-IR'),
    ],
  ];

  (pdf as any).autoTable({
    startY: yPosition,
    head: [['مشخصه', 'مقدار']],
    body: statsData,
    styles: {
      font: 'helvetica',
      halign: 'right',
      fontSize: 10,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: [255, 255, 255],
    },
    margin: { right: 10, left: 10 },
  });

  // نمونه از داده‌ها (20 ردیف اول)
  if (data.length > 0) {
    pdf.addPage();
    pdf.setFontSize(12);
    pdf.text('نمونه داده‌ها (۲۰ ردیف اول)', pageWidth / 2, 20, {
      align: 'center',
    });

    const headers = columns.map((c) => c.name);
    const sampleData = data.slice(0, 20).map((row) =>
      columns.map((c) => {
        const val = row[c.name];
        if (val === null || val === undefined) return '-';
        return String(val).substring(0, 30); // محدود کردن طول
      })
    );

    (pdf as any).autoTable({
      startY: 30,
      head: [headers],
      body: sampleData,
      styles: {
        font: 'helvetica',
        halign: 'right',
        fontSize: 8,
      },
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: [255, 255, 255],
      },
      margin: { right: 10, left: 10 },
      columnStyles: {},
    });
  }

  // ذخیره فایل
  pdf.save(`گزارش-${new Date().getTime()}.pdf`);
}