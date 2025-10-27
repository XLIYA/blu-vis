# 📊 داشبورد هوشمند - نسخه 2.0

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

**پلتفرم حرفه‌ای تحلیل و بصری‌سازی داده با پشتیبانی کامل فارسی**

[ویژگی‌ها](#-ویژگی‌ها) • [نصب](#-نصب) • [استفاده](#-راهنمای-استفاده) • [اسکرین‌شات‌ها](#-اسکرین‌شات‌ها)

</div>

---

## 🎯 درباره پروژه

داشبورد هوشمند یک ابزار وب‌محور برای تحلیل، تمیزسازی و بصری‌سازی داده‌های Excel و CSV است که با Next.js 14 و TypeScript ساخته شده و ویژگی‌های پیشرفته‌ای برای کار با داده ارائه می‌دهد.

### 🆕 تازه‌ها در نسخه 2.0

- ✨ **Navigation Bar ثابت** - دسترسی سریع به تمام صفحات
- 🌙 **Dark Mode** - تم تیره با ذخیره‌سازی خودکار
- 🎨 **Dashboard Builder** - ساخت داشبورد شخصی با نمودارهای دلخواه
- 🧹 **Data Cleaning پیشرفته** - 6 روش حرفه‌ای تمیزسازی داده
- 💬 **Modal System** - جایگزینی کامل alert با modal‌های زیبا
- 🎯 **UI/UX بهبود یافته** - طراحی مدرن و حرفه‌ای‌تر
- 📊 **Preview پیشرفته** - نمایش آمار و اطلاعات کامل داده

## ✨ ویژگی‌های کلیدی

### 📁 مدیریت داده
- ✅ پشتیبانی از فرمت‌های **XLSX, XLS, CSV, TSV**
- ✅ بارگذاری سریع **+15,000 ردیف** با Virtualized Table
- ✅ تشخیص خودکار **encoding** و **delimiter**
- ✅ **پیش‌نمایش زنده** با آمار کامل

### 🧹 تمیزسازی داده
- ✅ **حذف تکراری‌ها** - شناسایی و حذف ردیف‌های مشابه
- ✅ **پر کردن خالی‌ها** - با پیش‌فرض، میانگین یا میانه
- ✅ **حذف Outlier** - با روش IQR (Interquartile Range)
- ✅ **حذف ردیف‌های ناقص** - با threshold قابل تنظیم
- ✅ **لاگ عملیات** - ثبت کامل تغییرات با زمان

### 📊 بصری‌سازی و تحلیل
- ✅ **نمودارهای متنوع** - Bar, Line, Scatter
- ✅ **Dashboard Builder** - ساخت داشبورد شخصی
- ✅ **نمودارهای نامحدود** - افزودن چندین نمودار
- ✅ **Quick Insights** - بینش‌های هوشمند خودکار
- ✅ **خروجی PDF** - با کیفیت بالا

### 💾 خروجی و Export
- ✅ **JSON** - داده خام
- ✅ **CSV** - سازگار با Excel
- ✅ **PDF** - جدول و نمودار
- ✅ **Dashboard PDF** - کل داشبورد

### 🎨 رابط کاربری
- ✅ **Dark Mode** - با ذخیره‌سازی
- ✅ **Responsive** - موبایل و دسکتاپ
- ✅ **RTL** - پشتیبانی کامل فارسی
- ✅ **انیمیشن‌های smooth**
- ✅ **Modal System** - بدون alert/confirm

## 🛠️ تکنولوژی‌ها

| دسته | تکنولوژی |
|------|----------|
| **Framework** | Next.js 14 (App Router) |
| **زبان** | TypeScript 5 |
| **استایل** | Tailwind CSS 3 |
| **State** | Zustand + Persist |
| **Charts** | ECharts 5 |
| **Tables** | React Virtuoso |
| **File Processing** | XLSX |
| **PDF** | jsPDF + html2canvas |
| **Icons** | Lucide React |

## 📦 نصب

### پیش‌نیازها
```bash
Node.js 18+ (توصیه: 20 LTS)
npm یا yarn
```

### مراحل نصب

```bash
# 1. استخراج پروژه
unzip improved-blu-vis.zip
cd improved-blu-vis

# 2. نصب dependencies
npm install

# 3. اجرای development server
npm run dev

# 4. باز کردن در مرورگر
# http://localhost:3000
```

### Build برای Production
```bash
npm run build
npm start
```

## 🎓 راهنمای استفاده

### 1️⃣ بارگذاری داده

1. به صفحه **"بارگذاری"** بروید
2. فایل Excel یا CSV را **Drag & Drop** کنید
3. منتظر پردازش بمانید
4. آمار و اطلاعات داده نمایش داده می‌شود

### 2️⃣ تمیزسازی داده

1. دکمه **"تمیزسازی"** را کلیک کنید
2. روش مورد نظر را انتخاب کنید:
   - **حذف تکراری‌ها**: برای ردیف‌های مشابه
   - **میانگین**: برای داده‌های عددی نرمال
   - **میانه**: برای داده با outlier
   - **حذف Outlier**: با روش IQR
3. عملیات در **لاگ** ثبت می‌شود

### 3️⃣ ساخت داشبورد

1. به صفحه **"ساخت داشبورد"** بروید
2. دکمه **"افزودن نمودار"** را کلیک کنید
3. نمودار دلخواه را انتخاب کنید
4. برای **خروجی PDF** از دکمه مربوطه استفاده کنید

### 4️⃣ تغییر تم

- دکمه **ماه/خورشید** در Navigation
- تم به صورت خودکار ذخیره می‌شود

## 📸 اسکرین‌شات‌ها

### صفحه اصلی
- Landing page با معرفی ویژگی‌ها
- دکمه‌های دسترسی سریع

### پیش‌نمایش داده
- جدول virtualized برای سرعت بالا
- 4 کارت آماری با آیکون
- اطلاعات تکمیلی فایل
- Quick Insights

### Dashboard Builder
- Grid نمودارها
- افزودن/حذف نمودار
- خروجی PDF

### Data Cleaning
- 6 روش تمیزسازی
- لاگ عملیات با زمان
- توضیح هر روش

## 📂 ساختار پروژه

```
improved-blu-vis/
├── app/
│   ├── layout.tsx          # Layout اصلی + Navigation
│   ├── page.tsx            # صفحه اصلی
│   ├── preview/            # بارگذاری و پیش‌نمایش
│   ├── dashboard/          # داشبورد ساده
│   ├── builder/            # ساخت داشبورد
│   └── providers.tsx       # Context Providers
│
├── components/
│   ├── Navigation.tsx      # Navigation Bar
│   ├── ui/                 # کامپوننت‌های پایه
│   ├── charts/             # نمودارها
│   ├── dashboard/          # اجزای داشبورد
│   ├── preview/            # اجزای پیش‌نمایش
│   ├── table/              # جدول
│   └── upload/             # بارگذاری
│
├── contexts/
│   ├── ThemeContext.tsx    # مدیریت تم
│   └── DashboardContext.tsx # مدیریت داشبورد
│
├── lib/
│   ├── auto-chart-generator.ts
│   ├── data-mining.ts
│   ├── pdf-export-advanced.ts
│   └── ...
│
└── stores/
    └── dataStore.ts        # State Management
```

## 🔧 تنظیمات

### تغییر Threshold حذف ردیف‌های ناقص
```typescript
// DatacleaningdialogImproved.tsx - خط 130
const threshold = columns.length * 0.5; // 50% → تغییر دهید
```

### تغییر IQR Multiplier
```typescript
// DatacleaningdialogImproved.tsx - خط 155
const lowerBound = q1 - 1.5 * iqr; // 1.5 → تغییر دهید
```

### کیفیت PDF
```typescript
// pdf-export-advanced.ts - خط 9
scale: 2, // 1-3 (بیشتر = کیفیت بهتر)
```

## 🐛 عیب‌یابی

### داده بارگذاری نمی‌شود
- فرمت فایل را چک کنید (.xlsx, .csv)
- حجم فایل: حداکثر 10MB توصیه می‌شود

### Dark Mode کار نمی‌کند
```javascript
localStorage.clear()
location.reload()
```

### PDF تولید نمی‌شود
- Popup blocker را غیرفعال کنید
- برای فایل‌های بزرگ صبر کنید

## 📚 مستندات

- 📖 [README_CHANGES.md](./README_CHANGES.md) - تغییرات کامل
- 📖 [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) - راهنمای نصب
- 📖 [SUMMARY.md](./SUMMARY.md) - خلاصه تغییرات

## 🤝 مشارکت

این پروژه open-source است و از مشارکت شما استقبال می‌کنیم!

## 📄 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

## 💬 پشتیبانی

در صورت بروز مشکل:
1. Console مرورگر را بررسی کنید (F12)
2. مستندات را مطالعه کنید
3. Issue باز کنید

---

<div align="center">

**ساخته شده با ❤️ در ایران**

⭐ اگر این پروژه برایتان مفید بود، Star بدهید!

[شروع کنید](#-نصب) • [مستندات](#-مستندات) • [پشتیبانی](#-پشتیبانی)

</div>
