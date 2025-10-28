import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PDFExportOptions {
  filename?: string;
  title?: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  headerText?: string;
  footerText?: string;
  orientation?: 'portrait' | 'landscape';
}

interface AdvancedReportOptions {
  filename?: string;
  title: string;
  subtitle?: string;
  companyName?: string;
  dataStats?: {
    totalRows: number;
    totalColumns: number;
    dateRange?: string;
    dataSource?: string;
  };
  insights?: {
    key: string;
    value: string;
    icon?: string;
  }[];
  charts?: {
    element: HTMLElement;
    title: string;
    description?: string;
  }[];
  includeTimestamp?: boolean;
}

// تابع کمکی برای تبدیل متن فارسی به تصویر
async function persianTextToImage(text: string, options: {
  fontSize?: number;
  maxWidth?: number;
  fontWeight?: string;
  textAlign?: 'right' | 'center' | 'left';
}): Promise<string> {
  const {
    fontSize = 14,
    maxWidth = 500,
    fontWeight = 'normal',
    textAlign = 'right'
  } = options;

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    ctx.font = `${fontWeight} ${fontSize}px Vazirmatn, Arial`;
    
    // محاسبه اندازه
    const lines: string[] = [];
    const words = text.split(' ');
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    
    // تنظیم اندازه canvas
    canvas.width = maxWidth + 40;
    canvas.height = lines.length * (fontSize + 8) + 20;
    
    // رسم متن
    ctx.fillStyle = '#000000';
    ctx.font = `${fontWeight} ${fontSize}px Vazirmatn, Arial`;
    ctx.textAlign = textAlign;
    
    const x = textAlign === 'right' ? canvas.width - 20 : 
              textAlign === 'center' ? canvas.width / 2 : 20;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, x, (index + 1) * (fontSize + 8));
    });
    
    resolve(canvas.toDataURL('image/png'));
  });
}

export async function exportDashboardToPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = 'dashboard-report.pdf',
    title = 'گزارش داشبورد',
    includeHeader = true,
    includeFooter = true,
    headerText = 'گزارش تحلیل داده',
    footerText = 'تولید شده توسط BluVis Analytics',
    orientation = 'portrait',
  } = options;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgWidth = orientation === 'portrait' ? 210 : 297;
    const imgHeight = orientation === 'portrait' ? 297 : 210;
    const contentWidth = imgWidth - 20;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    let yPosition = 10;

    // Header با تصویر
    if (includeHeader) {
      const headerImage = await persianTextToImage(title, {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: contentWidth * 3.78,
      });
      
      pdf.addImage(headerImage, 'PNG', 10, yPosition, contentWidth, 15);
      yPosition += 20;

      const subHeaderImage = await persianTextToImage(headerText, {
        fontSize: 10,
        textAlign: 'center',
        maxWidth: contentWidth * 3.78,
      });
      
      pdf.addImage(subHeaderImage, 'PNG', 10, yPosition, contentWidth, 8);
      yPosition += 15;
    }

    // Content
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, yPosition, contentWidth, contentHeight);

    // Footer با تصویر
    if (includeFooter) {
      const footerY = imgHeight - 15;
      
      const footerImage = await persianTextToImage(footerText, {
        fontSize: 8,
        textAlign: 'center',
        maxWidth: contentWidth * 3.78,
      });
      
      pdf.addImage(footerImage, 'PNG', 10, footerY, contentWidth, 8);

      const dateText = `تاریخ: ${new Date().toLocaleDateString('fa-IR')}`;
      const dateImage = await persianTextToImage(dateText, {
        fontSize: 8,
        textAlign: 'left',
        maxWidth: contentWidth * 3.78,
      });
      
      pdf.addImage(dateImage, 'PNG', 10, footerY + 5, contentWidth, 6);
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

export async function exportMultipleChartsToPDF(
  charts: { element: HTMLElement; title: string }[],
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = 'charts-collection.pdf',
    title = 'مجموعه چارت‌ها',
    orientation = 'portrait',
  } = options;

  try {
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = orientation === 'portrait' ? 210 : 297;
    const imgHeight = orientation === 'portrait' ? 297 : 210;

    for (let i = 0; i < charts.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      const canvas = await html2canvas(charts[i].element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      let yPosition = 15;

      // Chart Title با تصویر
      const titleImage = await persianTextToImage(charts[i].title, {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: (imgWidth - 20) * 3.78,
      });
      
      pdf.addImage(titleImage, 'PNG', 10, yPosition, imgWidth - 20, 10);
      yPosition += 15;

      // Chart Image
      const contentWidth = imgWidth - 20;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, yPosition, contentWidth, contentHeight);

      // Page Number
      const pageNumText = `صفحه ${(i + 1).toLocaleString('fa-IR')} از ${charts.length.toLocaleString('fa-IR')}`;
      const pageNumImage = await persianTextToImage(pageNumText, {
        fontSize: 8,
        textAlign: 'center',
        maxWidth: (imgWidth - 20) * 3.78,
      });
      
      pdf.addImage(pageNumImage, 'PNG', 10, imgHeight - 15, imgWidth - 20, 8);
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * تابع پیشرفته برای تولید گزارش کامل و حرفه‌ای
 */
export async function generateAdvancedReport(
  options: AdvancedReportOptions
): Promise<void> {
  const {
    filename = 'advanced-report.pdf',
    title,
    subtitle,
    companyName = 'BluVis Analytics',
    dataStats,
    insights = [],
    charts = [],
    includeTimestamp = true,
  } = options;

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let yPosition = 20;
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    // ==================== صفحه اول: کاور ====================
    
    // Header آبی
    pdf.setFillColor(37, 99, 235);
    pdf.rect(0, 0, pageWidth, 60, 'F');
    
    // نام شرکت
    const companyImage = await persianTextToImage(companyName, {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      maxWidth: contentWidth * 3.78,
    });
    pdf.addImage(companyImage, 'PNG', margin, 25, contentWidth, 20);

    yPosition = 80;

    // عنوان اصلی
    const titleImage = await persianTextToImage(title, {
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      maxWidth: contentWidth * 3.78,
    });
    pdf.addImage(titleImage, 'PNG', margin, yPosition, contentWidth, 25);
    yPosition += 35;

    // زیرعنوان
    if (subtitle) {
      const subtitleImage = await persianTextToImage(subtitle, {
        fontSize: 14,
        textAlign: 'center',
        maxWidth: contentWidth * 3.78,
      });
      pdf.addImage(subtitleImage, 'PNG', margin, yPosition, contentWidth, 12);
      yPosition += 20;
    }

    // خط جداکننده
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 20;

    // آمار داده
    if (dataStats) {
      const statsHeaderImage = await persianTextToImage('خلاصه داده‌ها:', {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'right',
        maxWidth: contentWidth * 3.78,
      });
      pdf.addImage(statsHeaderImage, 'PNG', margin, yPosition, contentWidth, 10);
      yPosition += 12;

      const statsInfo = [
        `تعداد ردیف‌ها: ${dataStats.totalRows.toLocaleString('fa-IR')}`,
        `تعداد ستون‌ها: ${dataStats.totalColumns}`,
        dataStats.dateRange && `بازه زمانی: ${dataStats.dateRange}`,
        dataStats.dataSource && `منبع داده: ${dataStats.dataSource}`,
      ].filter(Boolean);

      for (const info of statsInfo) {
        if (info) {
          const infoImage = await persianTextToImage(`• ${info}`, {
            fontSize: 10,
            textAlign: 'right',
            maxWidth: (contentWidth - 10) * 3.78,
          });
          pdf.addImage(infoImage, 'PNG', margin + 5, yPosition, contentWidth - 10, 8);
          yPosition += 10;
        }
      }

      yPosition += 10;
    }

    // تاریخ تولید گزارش
    if (includeTimestamp) {
      yPosition = pageHeight - 30;
      const now = new Date();
      const persianDate = now.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const persianTime = now.toLocaleTimeString('fa-IR');
      const timestampText = `تاریخ تولید: ${persianDate} - ساعت ${persianTime}`;
      
      const timestampImage = await persianTextToImage(timestampText, {
        fontSize: 10,
        textAlign: 'center',
        maxWidth: contentWidth * 3.78,
      });
      pdf.addImage(timestampImage, 'PNG', margin, yPosition, contentWidth, 10);
    }

    // ==================== صفحه دوم: بینش‌ها ====================
    if (insights.length > 0) {
      pdf.addPage();
      yPosition = 20;

      const insightsHeaderImage = await persianTextToImage('بینش‌های کلیدی', {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'right',
        maxWidth: contentWidth * 3.78,
      });
      pdf.addImage(insightsHeaderImage, 'PNG', margin, yPosition, contentWidth, 15);
      yPosition += 20;

      pdf.setDrawColor(37, 99, 235);
      pdf.setLineWidth(1);
      pdf.line(margin, yPosition, margin + 40, yPosition);
      yPosition += 15;

      // نمایش بینش‌ها
      for (let i = 0; i < insights.length; i++) {
        const insight = insights[i];
        
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        // Background
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(margin, yPosition, contentWidth, 25, 2, 2, 'F');

        // Key
        const keyImage = await persianTextToImage(`${i + 1}. ${insight.key}`, {
          fontSize: 11,
          fontWeight: 'bold',
          textAlign: 'right',
          maxWidth: (contentWidth - 10) * 3.78,
        });
        pdf.addImage(keyImage, 'PNG', margin + 5, yPosition + 3, contentWidth - 10, 8);

        // Value
        const valueImage = await persianTextToImage(insight.value, {
          fontSize: 10,
          textAlign: 'right',
          maxWidth: (contentWidth - 10) * 3.78,
        });
        pdf.addImage(valueImage, 'PNG', margin + 5, yPosition + 12, contentWidth - 10, 10);

        yPosition += 30;
      }
    }

    // ==================== صفحات بعدی: چارت‌ها ====================
    for (let i = 0; i < charts.length; i++) {
      pdf.addPage();
      yPosition = 20;

      const chart = charts[i];

      // عنوان چارت
      const chartTitleImage = await persianTextToImage(chart.title, {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: contentWidth * 3.78,
      });
      pdf.addImage(chartTitleImage, 'PNG', margin, yPosition, contentWidth, 12);
      yPosition += 18;

      // توضیحات چارت
      if (chart.description) {
        const descImage = await persianTextToImage(chart.description, {
          fontSize: 10,
          textAlign: 'center',
          maxWidth: contentWidth * 3.78,
        });
        pdf.addImage(descImage, 'PNG', margin, yPosition, contentWidth, 12);
        yPosition += 18;
      }

      // تصویر چارت
      const canvas = await html2canvas(chart.element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const chartContentWidth = contentWidth;
      const chartContentHeight = (canvas.height * chartContentWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(
        imgData,
        'PNG',
        margin,
        yPosition,
        chartContentWidth,
        Math.min(chartContentHeight, pageHeight - yPosition - 30)
      );

      // شماره صفحه
      const pageNumText = `صفحه ${(i + 3).toLocaleString('fa-IR')} از ${(charts.length + 2).toLocaleString('fa-IR')}`;
      const pageNumImage = await persianTextToImage(pageNumText, {
        fontSize: 8,
        textAlign: 'center',
        maxWidth: contentWidth * 3.78,
      });
      pdf.addImage(pageNumImage, 'PNG', margin, pageHeight - 15, contentWidth, 8);
    }

    // ==================== صفحه آخر: نتیجه‌گیری ====================
    pdf.addPage();
    yPosition = 20;

    const conclusionHeaderImage = await persianTextToImage('نتیجه‌گیری', {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'right',
      maxWidth: contentWidth * 3.78,
    });
    pdf.addImage(conclusionHeaderImage, 'PNG', margin, yPosition, contentWidth, 15);
    yPosition += 20;

    pdf.setDrawColor(37, 99, 235);
    pdf.setLineWidth(1);
    pdf.line(margin, yPosition, margin + 40, yPosition);
    yPosition += 20;

    const conclusionText = [
      'این گزارش شامل تحلیل جامع داده‌های شما بر اساس معیارهای کلیدی است.',
      'نمودارها و بینش‌های ارائه شده می‌تواند به تصمیم‌گیری‌های استراتژیک کمک کند.',
      'برای اطلاعات بیشتر یا سفارشی‌سازی گزارش، با تیم تحلیل تماس بگیرید.',
    ];

    for (const line of conclusionText) {
      const lineImage = await persianTextToImage(`• ${line}`, {
        fontSize: 11,
        textAlign: 'right',
        maxWidth: (contentWidth - 10) * 3.78,
      });
      pdf.addImage(lineImage, 'PNG', margin + 5, yPosition, contentWidth - 10, 15);
      yPosition += 20;
    }

    // فوتر نهایی
    yPosition = pageHeight - 40;
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, yPosition, pageWidth, 40, 'F');

    const footerText1 = 'این گزارش به صورت خودکار توسط سیستم BluVis Analytics تولید شده است.';
    const footer1Image = await persianTextToImage(footerText1, {
      fontSize: 10,
      textAlign: 'center',
      maxWidth: contentWidth * 3.78,
    });
    pdf.addImage(footer1Image, 'PNG', margin, yPosition + 10, contentWidth, 10);

    const footerText2 = '© 2025 BluVis Analytics - All Rights Reserved';
    const footer2Image = await persianTextToImage(footerText2, {
      fontSize: 8,
      textAlign: 'center',
      maxWidth: contentWidth * 3.78,
    });
    pdf.addImage(footer2Image, 'PNG', margin, yPosition + 22, contentWidth, 8);

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating advanced PDF report:', error);
    throw error;
  }
}