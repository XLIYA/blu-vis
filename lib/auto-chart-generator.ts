import { ColumnMeta, ColumnType } from './format';

export type ChartType = 
  | 'bar' 
  | 'line' 
  | 'pie' 
  | 'scatter' 
  | 'area' 
  | 'radar' 
  | 'gauge' 
  | 'heatmap'
  | 'funnel'
  | 'treemap';

export interface ChartSuggestion {
  type: ChartType;
  xColumn: string;
  yColumn: string;
  title: string;
  description: string;
  priority: number;
}

export interface ChartConfig {
  type: ChartType;
  xColumn: string;
  yColumn?: string;
  title: string;
  data: any[];
  options?: any;
}

/**
 * پیشنهاد چارت‌های مناسب بر اساس نوع داده‌ها
 */
export function suggestCharts(
  data: any[],
  columns: ColumnMeta[]
): ChartSuggestion[] {
  if (!data || data.length === 0 || !columns || columns.length === 0) {
    return [];
  }

  const suggestions: ChartSuggestion[] = [];
  const numericColumns = columns.filter((c) => c.type === 'number');
  const categoricalColumns = columns.filter((c) => c.type === 'string' || c.type === 'date');

  // 1. نمودار میله‌ای: دسته‌بندی × عددی
  categoricalColumns.forEach((catCol) => {
    numericColumns.forEach((numCol) => {
      suggestions.push({
        type: 'bar',
        xColumn: catCol.name,
        yColumn: numCol.name,
        title: `${numCol.name} بر اساس ${catCol.name}`,
        description: 'مقایسه مقادیر عددی در دسته‌های مختلف',
        priority: 9,
      });
    });
  });

  // 2. نمودار خطی: تاریخ/زمان × عددی (روند)
  const dateColumns = columns.filter((c) => c.type === 'date');
  dateColumns.forEach((dateCol) => {
    numericColumns.forEach((numCol) => {
      suggestions.push({
        type: 'line',
        xColumn: dateCol.name,
        yColumn: numCol.name,
        title: `روند ${numCol.name} در طول زمان`,
        description: 'نمایش تغییرات در طول زمان',
        priority: 10,
      });
    });
  });

  // 3. نمودار دایره‌ای (Pie): دسته‌بندی با تعداد محدود
  categoricalColumns.forEach((catCol) => {
    const uniqueValues = new Set(data.map((row) => row[catCol.name])).size;
    if (uniqueValues > 2 && uniqueValues <= 10) {
      numericColumns.forEach((numCol) => {
        suggestions.push({
          type: 'pie',
          xColumn: catCol.name,
          yColumn: numCol.name,
          title: `توزیع ${numCol.name} بر اساس ${catCol.name}`,
          description: 'نمایش سهم هر دسته از کل',
          priority: 8,
        });
      });
    }
  });

  // 4. نمودار پراکندگی: عددی × عددی (همبستگی)
  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      suggestions.push({
        type: 'scatter',
        xColumn: numericColumns[i].name,
        yColumn: numericColumns[j].name,
        title: `رابطه بین ${numericColumns[i].name} و ${numericColumns[j].name}`,
        description: 'بررسی همبستگی بین دو متغیر عددی',
        priority: 7,
      });
    }
  }

  // 5. نمودار ناحیه‌ای (Area): مشابه خطی اما با پر کردن زیر خط
  dateColumns.forEach((dateCol) => {
    numericColumns.forEach((numCol) => {
      suggestions.push({
        type: 'area',
        xColumn: dateCol.name,
        yColumn: numCol.name,
        title: `حجم ${numCol.name} در طول زمان`,
        description: 'نمایش حجم تجمعی در طول زمان',
        priority: 7,
      });
    });
  });

  // 6. نمودار راداری (Radar): چند متغیر عددی
  if (numericColumns.length >= 3 && categoricalColumns.length > 0) {
    suggestions.push({
      type: 'radar',
      xColumn: categoricalColumns[0].name,
      yColumn: numericColumns.slice(0, 5).map(c => c.name).join(','),
      title: `مقایسه چند بعدی ${categoricalColumns[0].name}`,
      description: 'مقایسه چند متغیر به صورت همزمان',
      priority: 6,
    });
  }

  // 7. نمودار سنج‌سرعت (Gauge): یک مقدار عددی
  numericColumns.forEach((numCol) => {
    const values = data.map(row => parseFloat(row[numCol.name])).filter(v => !isNaN(v));
    if (values.length > 0) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      suggestions.push({
        type: 'gauge',
        xColumn: numCol.name,
        yColumn: numCol.name,
        title: `میانگین ${numCol.name}`,
        description: `نمایش میانگین: ${avg.toFixed(2)}`,
        priority: 5,
      });
    }
  });

  // 8. نمودار قیفی (Funnel): مراحل فرآیند
  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    suggestions.push({
      type: 'funnel',
      xColumn: categoricalColumns[0].name,
      yColumn: numericColumns[0].name,
      title: `قیف ${numericColumns[0].name} در ${categoricalColumns[0].name}`,
      description: 'نمایش مراحل یک فرآیند',
      priority: 5,
    });
  }

  // 9. نمودار درختی (Treemap): سلسله‌مراتبی
  if (categoricalColumns.length >= 2 && numericColumns.length > 0) {
    suggestions.push({
      type: 'treemap',
      xColumn: categoricalColumns.slice(0, 2).map(c => c.name).join(','),
      yColumn: numericColumns[0].name,
      title: `توزیع سلسله‌مراتبی ${numericColumns[0].name}`,
      description: 'نمایش داده‌های سلسله‌مراتبی',
      priority: 6,
    });
  }

  // مرتب‌سازی بر اساس اولویت
  return suggestions.sort((a, b) => b.priority - a.priority).slice(0, 12);
}

/**
 * تولید تنظیمات ECharts بر اساس نوع چارت
 */
export function generateChartOption(config: ChartConfig): any {
  const { type, xColumn, yColumn, title, data } = config;

  // محدود کردن داده برای عملکرد بهتر
  const sampleData = data.slice(0, 500);

  const baseOption = {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontFamily: 'Vazirmatn',
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ccc',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontFamily: 'Vazirmatn',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: { title: 'ذخیره تصویر' },
        dataZoom: { title: { zoom: 'زوم', back: 'بازگشت' } },
        restore: { title: 'بازنشانی' },
      },
    },
  };

  switch (type) {
    case 'bar':
      return generateBarChart(sampleData, xColumn, yColumn!, baseOption);
    case 'line':
      return generateLineChart(sampleData, xColumn, yColumn!, baseOption);
    case 'pie':
      return generatePieChart(sampleData, xColumn, yColumn!, baseOption);
    case 'scatter':
      return generateScatterChart(sampleData, xColumn, yColumn!, baseOption);
    case 'area':
      return generateAreaChart(sampleData, xColumn, yColumn!, baseOption);
    case 'radar':
      return generateRadarChart(sampleData, xColumn, yColumn!, baseOption);
    case 'gauge':
      return generateGaugeChart(sampleData, xColumn, yColumn!, baseOption);
    case 'funnel':
      return generateFunnelChart(sampleData, xColumn, yColumn!, baseOption);
    case 'heatmap':
      return generateHeatmapChart(sampleData, xColumn, yColumn!, baseOption);
    case 'treemap':
      return generateTreemapChart(sampleData, xColumn, yColumn!, baseOption);
    default:
      return baseOption;
  }
}

function generateBarChart(data: any[], xCol: string, yCol: string, base: any): any {
  const xData = data.map((row) => row[xCol] ?? '');
  const yData = data.map((row) => {
    const val = parseFloat(row[yCol]);
    return isNaN(val) ? 0 : val;
  });

  return {
    ...base,
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: { rotate: 45, fontFamily: 'Vazirmatn' },
    },
    yAxis: {
      type: 'value',
      name: yCol,
      nameTextStyle: { fontFamily: 'Vazirmatn' },
    },
    series: [
      {
        type: 'bar',
        data: yData,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#1d4ed8' },
            ],
          },
        },
        emphasis: {
          itemStyle: {
            color: '#2563eb',
          },
        },
      },
    ],
  };
}

function generateLineChart(data: any[], xCol: string, yCol: string, base: any): any {
  const xData = data.map((row) => row[xCol] ?? '');
  const yData = data.map((row) => {
    const val = parseFloat(row[yCol]);
    return isNaN(val) ? 0 : val;
  });

  return {
    ...base,
    xAxis: {
      type: 'category',
      data: xData,
      boundaryGap: false,
      axisLabel: { fontFamily: 'Vazirmatn' },
    },
    yAxis: {
      type: 'value',
      name: yCol,
      nameTextStyle: { fontFamily: 'Vazirmatn' },
    },
    series: [
      {
        type: 'line',
        data: yData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: '#10b981',
        },
        itemStyle: {
          color: '#10b981',
          borderWidth: 2,
          borderColor: '#fff',
        },
        areaStyle: {
          opacity: 0,
        },
      },
    ],
  };
}

function generatePieChart(data: any[], xCol: string, yCol: string, base: any): any {
  const aggregated = data.reduce((acc: any, row) => {
    const key = row[xCol] ?? 'نامشخص';
    const value = parseFloat(row[yCol]);
    if (!isNaN(value)) {
      acc[key] = (acc[key] || 0) + value;
    }
    return acc;
  }, {});

  const pieData = Object.entries(aggregated).map(([name, value]) => ({
    name,
    value,
  }));

  return {
    ...base,
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: { fontFamily: 'Vazirmatn' },
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {d}%',
          fontFamily: 'Vazirmatn',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        data: pieData,
      },
    ],
  };
}

function generateScatterChart(data: any[], xCol: string, yCol: string, base: any): any {
  const scatterData = data.map((row) => {
    const x = parseFloat(row[xCol]);
    const y = parseFloat(row[yCol]);
    return [isNaN(x) ? 0 : x, isNaN(y) ? 0 : y];
  });

  return {
    ...base,
    xAxis: {
      type: 'value',
      name: xCol,
      nameTextStyle: { fontFamily: 'Vazirmatn' },
    },
    yAxis: {
      type: 'value',
      name: yCol,
      nameTextStyle: { fontFamily: 'Vazirmatn' },
    },
    series: [
      {
        type: 'scatter',
        data: scatterData,
        symbolSize: 10,
        itemStyle: {
          color: '#8b5cf6',
          opacity: 0.7,
        },
        emphasis: {
          itemStyle: {
            color: '#7c3aed',
            opacity: 1,
          },
        },
      },
    ],
  };
}

function generateAreaChart(data: any[], xCol: string, yCol: string, base: any): any {
  const lineOption = generateLineChart(data, xCol, yCol, base);
  lineOption.series[0].areaStyle = {
    color: {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: 'rgba(16, 185, 129, 0.5)' },
        { offset: 1, color: 'rgba(16, 185, 129, 0.1)' },
      ],
    },
  };
  return lineOption;
}

function generateRadarChart(data: any[], xCol: string, yCols: string, base: any): any {
  const yColumns = yCols.split(',').map(c => c.trim());
  const indicators = yColumns.map(col => ({ name: col, max: 100 }));

  const radarData = data.slice(0, 5).map(row => ({
    value: yColumns.map(col => {
      const val = parseFloat(row[col]);
      return isNaN(val) ? 0 : val;
    }),
    name: row[xCol] ?? 'نامشخص',
  }));

  return {
    ...base,
    radar: {
      indicator: indicators,
      shape: 'circle',
      splitNumber: 5,
    },
    series: [
      {
        type: 'radar',
        data: radarData,
        areaStyle: {
          opacity: 0.3,
        },
      },
    ],
  };
}

function generateGaugeChart(data: any[], xCol: string, yCol: string, base: any): any {
  const values = data.map(row => parseFloat(row[yCol])).filter(v => !isNaN(v));
  const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const max = values.length > 0 ? Math.max(...values) : 100;

  return {
    ...base,
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: max,
        splitNumber: 8,
        axisLine: {
          lineStyle: {
            width: 6,
            color: [
              [0.3, '#ef4444'],
              [0.7, '#f59e0b'],
              [1, '#10b981'],
            ],
          },
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '12%',
          width: 20,
          offsetCenter: [0, '-60%'],
          itemStyle: {
            color: 'auto',
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: 'auto',
            width: 2,
          },
        },
        splitLine: {
          length: 20,
          lineStyle: {
            color: 'auto',
            width: 5,
          },
        },
        axisLabel: {
          color: '#464646',
          fontSize: 12,
          distance: -60,
        },
        title: {
          offsetCenter: [0, '-20%'],
          fontSize: 16,
        },
        detail: {
          fontSize: 30,
          offsetCenter: [0, '0%'],
          valueAnimation: true,
          formatter: function (value: number) {
            return Math.round(value);
          },
          color: 'auto',
        },
        data: [
          {
            value: avg,
            name: yCol,
          },
        ],
      },
    ],
  };
}

function generateFunnelChart(data: any[], xCol: string, yCol: string, base: any): any {
  const aggregated = data.reduce((acc: any, row) => {
    const key = row[xCol] ?? 'نامشخص';
    const value = parseFloat(row[yCol]);
    if (!isNaN(value)) {
      acc[key] = (acc[key] || 0) + value;
    }
    return acc;
  }, {});

  const funnelData = Object.entries(aggregated)
    .map(([name, value]) => ({ name, value }))
    .sort((a: any, b: any) => b.value - a.value);

  return {
    ...base,
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}',
    },
    series: [
      {
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          fontFamily: 'Vazirmatn',
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid',
          },
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
        },
        emphasis: {
          label: {
            fontSize: 20,
          },
        },
        data: funnelData,
      },
    ],
  };
}

function generateHeatmapChart(data: any[], xCol: string, yCol: string, base: any): any {
  // ساده‌سازی: گرید 10×10
  const heatmapData: any[] = [];
  const xValues = [...new Set(data.map(row => row[xCol]))].slice(0, 10);
  const yValues = [...new Set(data.map(row => row[yCol]))].slice(0, 10);

  xValues.forEach((x, i) => {
    yValues.forEach((y, j) => {
      const value = Math.random() * 100; // مقدار تصادفی برای نمایش
      heatmapData.push([i, j, value]);
    });
  });

  return {
    ...base,
    tooltip: {
      position: 'top',
    },
    grid: {
      height: '50%',
      top: '15%',
    },
    xAxis: {
      type: 'category',
      data: xValues,
      splitArea: {
        show: true,
      },
    },
    yAxis: {
      type: 'category',
      data: yValues,
      splitArea: {
        show: true,
      },
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
    },
    series: [
      {
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: true,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };
}

function generateTreemapChart(data: any[], xCols: string, yCol: string, base: any): any {
  const categories = xCols.split(',').map(c => c.trim());
  
  const aggregated = data.reduce((acc: any, row) => {
    const key = categories.map(col => row[col] ?? 'نامشخص').join(' > ');
    const value = parseFloat(row[yCol]);
    if (!isNaN(value)) {
      acc[key] = (acc[key] || 0) + value;
    }
    return acc;
  }, {});

  const treemapData = Object.entries(aggregated).map(([name, value]) => ({
    name,
    value,
  }));

  return {
    ...base,
    series: [
      {
        type: 'treemap',
        data: treemapData,
        label: {
          show: true,
          formatter: '{b}',
          fontFamily: 'Vazirmatn',
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
    ],
  };
}