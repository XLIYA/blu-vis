# 📊 داشبورد هوشمند - Smart Dashboard

یک پلتفرم تحلیل و بصری‌سازی داده مبتنی بر **Next.js 14** با پشتیبانی کامل از زبان فارسی و RTL.

## ✨ ویژگی‌ها

- 🚀 **عملکرد بالا**: پردازش روان +۱۵,۰۰۰ ردیف داده با Virtualized Table
- 📁 **پشتیبانی از فرمت‌های متنوع**: XLSX, XLS, CSV, TSV
- 📊 **نمودارهای پیشرفته**: میله‌ای، خطی، پراکنش با ECharts
- 🧹 **تمیزسازی داده**: حذف تکراری، پر کردن مقادیر مفقود
- 💾 **خروجی چندگانه**: JSON, CSV, PDF
- 🎨 **رابط کاربری مدرن**: Tailwind CSS با طراحی responsive
- 🔒 **امنیت**: تمام پردازش در سمت کلاینت (بدون بک‌اند)
- 🇮🇷 **فارسی و RTL**: پشتیبانی کامل از زبان فارسی

## 🛠️ تکنولوژی‌ها

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand + Persist
- **Charts**: ECharts + echarts-for-react
- **Tables**: react-virtuoso (Virtualized)
- **File Parsing**: xlsx
- **PDF Export**: html2canvas + jsPDF + jspdf-autotable
- **Icons**: lucide-react

## 📋 پیش‌نیازها

- **Node.js**: 20 LTS یا بالاتر
- **npm** یا **yarn**

## 🚀 نصب و راه‌اندازی

### 1. نصب Dependencies

```bash
npm install
```

### 2. اجرای Development Server

```bash
npm run dev
```

پروژه در آدرس [http://localhost:3000](http://localhost:3000) در دسترس خواهد بود.

### 3. Build برای Production

```bash
npm run build
npm start
```

## 📂 ساختار پروژه

```
smart-dashboard-nextjs/
├── app/
│   ├── (صفحه اصلی) page.tsx
│   ├── preview/page.tsx        # صفحه بارگذاری و پیش‌نمایش
│   ├── dashboard/page.tsx      # صفحه داشبورد و نمودارها
│   ├── layout.tsx              # Layout اصلی (RTL, فونت)
│   ├── providers.tsx           # Provider‌های Context
│   └── globals.css             # استایل‌های عمومی
├── components/
│   ├── ui/                     # کامپوننت‌های پایه UI
│   ├── upload/                 # آپلود فایل
│   ├── table/                  # جدول virtualized
│   ├── charts/                 # نمودارها
│   ├── preview/                # کامپوننت‌های صفحه Preview
│   └── dashboard/              # کامپوننت‌های صفحه Dashboard
├── lib/
│   ├── format.ts               # Utility functions
│   ├── data-mining.ts          # محاسبات آماری
│   ├── auto-chart-generator.ts # پیشنهاد نمودار خودکار
│   ├── detect-delimiter.ts     # تشخیص delimiter
│   ├── pdf-export.ts           # خروجی PDF
│   └── encoding.ts             # مدیریت encoding
├── stores/
│   └── dataStore.ts            # Zustand store
└── public/                     # فایل‌های استاتیک
```

## 💡 نحوه استفاده

### 1. بارگذاری داده

1. از صفحه اصلی روی **"شروع با بارگذاری داده"** کلیک کنید
2. فایل Excel یا CSV خود را drag & drop کنید یا انتخاب کنید
3. داده‌ها به‌صورت خودکار پارس و نمایش داده می‌شوند

### 2. تحلیل و تمیزسازی

- **بینش‌های سریع**: اطلاعات کلیدی درباره دیتاست
- **تمیزسازی داده**: حذف تکراری‌ها، پر کردن مقادیر مفقود
- **خروجی**: دانلود به‌صورت JSON, CSV یا PDF

### 3. بصری‌سازی

1. به صفحه **داشبورد** بروید
2. نمودارهای خودکار بر اساس داده‌های شما ایجاد می‌شوند
3. با Toolbar نوع نمودار و محورها را تغییر دهید

## 🎯 ویژگی‌های کلیدی کد

### Virtualized Table

برای نمایش روان جداول بزرگ:

```tsx
<VirtualizedTable data={data} columns={columns} maxHeight={520} />
```

### Dynamic Import برای ECharts

جلوگیری از SSR برای کتابخانه‌های سنگین:

```tsx
const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
});
```

### State Management با Zustand

```tsx
const { data, columns, setData } = useDataStore();
```

### Toast Notifications

```tsx
const { showToast } = useToast();
showToast('success', 'عملیات موفق بود');
```

## 🔧 تنظیمات و بهینه‌سازی

### Performance

- **Virtualization**: استفاده از react-virtuoso
- **Lazy Loading**: Dynamic import برای کتابخانه‌های سنگین
- **Sample Data**: محدود کردن نمودارها به 100 نقطه
- **Memoization**: استفاده از useMemo برای محاسبات سنگین

### RTL و فارسی

- فونت **Vazirmatn** از Google Fonts
- `dir="rtl"` در root layout
- تمام متون فارسی

## 📝 نکات مهم

1. **نسخه Node**: حتماً از Node.js 20 LTS استفاده کنید
2. **ESLint**: نسخه 8.57.0 برای سازگاری با Next.js 14
3. **TypeScript**: strict mode فعال است
4. **Browser Compatibility**: مرورگرهای مدرن (Chrome, Firefox, Safari, Edge)

## 🐛 عیب‌یابی

### خطای ERESOLVE

اگر با خطای dependency مواجه شدید:

```bash
rm -rf node_modules package-lock.json
npm install
```

### فونت فارسی نمایش داده نمی‌شود

مطمئن شوید که فایل `layout.tsx` به درستی تنظیم شده و Vazirmatn بارگذاری شده است.

### نمودارها نمایش داده نمی‌شوند

بررسی کنید که داده‌ها حداقل یک ستون عددی داشته باشند.

## 📄 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

## 🤝 مشارکت

برای گزارش مشکلات یا پیشنهادات، لطفاً issue ایجاد کنید.

---

**ساخته شده با ❤️ برای تحلیلگران داده**