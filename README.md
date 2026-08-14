# Task Glitch - Daily Task Marketplace

یک برنامه شبیه Uber برای استخدام افراد جهت انجام کارهای روزمره بدون حضور شخصی.

## ویژگی‌های اساسی

- 👤 سیستم ثبت‌نام و ورود
- 🔍 جستجو و انتخاب کارگر
- 📍 ردیابی موقعیت‌مکان
- 💳 سیستم پرداخت
- ⭐ امتیاز‌دهی و نظرات
- 💬 چت و پیام‌رسانی
- 📱 رابط کاربری موبایل و وب

## تکنولوژی‌های استفاده شده

### Backend
- **Node.js + Express** برای API
- **PostgreSQL** برای پایگاه داده
- **JWT** برای احراز هویت
- **Socket.io** برای چت و ردیابی实时

### Frontend
- **React** برای وب
- **React Native** یا **Flutter** برای موبایل
- **Redux** برای مدیریت state
- **Axios** برای HTTP requests

### Services
- **Google Maps API** برای نقشه و ردیابی
- **Stripe** برای پرداخت
- **Firebase** برای notifications

## ساختار پروژه

```
task_glitch/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── config/
│   ├── tests/
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   └── App.js
│   ├── public/
│   └── package.json
├── mobile/
│   └── (React Native یا Flutter)
└── docs/
    └── API.md
```

## نصب و راه‌اندازی

### پیش‌نیازها
- Node.js 14+
- PostgreSQL 12+
- npm یا yarn

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## مراحل توسعه

### Phase 1: Foundations
- [ ] تنظیم پایگاه داده
- [ ] ساخت API پایه
- [ ] سیستم احراز هویت

### Phase 2: Core Features
- [ ] نمایه‌های کاربری
- [ ] سیستم جستجو کارها
- [ ] نقشه و ردیابی

### Phase 3: Advanced Features
- [ ] سیستم پرداخت
- [ ] چت و پیام‌رسانی
- [ ] امتیاز‌دهی و نظرات

### Phase 4: Deployment
- [ ] استقرار Backend
- [ ] استقرار Frontend
- [ ] تست و بهینه‌سازی

## مشارکت

از pull requests استقبال می‌کنیم!

## لایسنس

MIT
