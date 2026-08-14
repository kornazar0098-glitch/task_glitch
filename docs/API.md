# Task Glitch API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
تمام درخواست‌های محافظت‌شده نیاز به JWT token دارند:
```
Authorization: Bearer <token>
```

## Endpoints

### Users (کاربران)

#### ثبت‌نام
```
POST /auth/register
Content-Type: application/json

{
  "name": "نام کاربر",
  "email": "user@example.com",
  "password": "password123",
  "phone": "09xxxxxxxxx",
  "role": "customer" // یا "worker"
}
```

#### ورود
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

### Tasks (کارها)

#### ایجاد کار جدید
```
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "خرید بقالی",
  "description": "برای فردا بقالی لازم دارم",
  "category": "shopping",
  "location": "تهران",
  "budget": 50000,
  "deadline": "2024-12-25"
}
```

#### دریافت لیست کارها
```
GET /tasks?category=shopping&status=open
Authorization: Bearer <token>
```

#### دریافت جزئیات کار
```
GET /tasks/:id
Authorization: Bearer <token>
```

### Bookings (رزروها)

#### درخواست برای انجام کار
```
POST /bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "task_id": 1,
  "proposed_price": 45000,
  "message": "می‌توانم این کار را انجام دهم"
}
```

#### پذیرش درخواست
```
PUT /bookings/:id/accept
Authorization: Bearer <token>
```

### Reviews (نظرات)

#### ثبت نظر
```
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_id": 1,
  "rating": 5,
  "comment": "کار عالی انجام شد"
}
```

## Error Responses

```json
{
  "error": "نام خطا",
  "message": "توضیح خطا",
  "code": 400
}
```

## Status Codes
- `200`: موفق
- `201`: ایجاد شد
- `400`: درخواست نامعتبر
- `401`: احراز هویت ناموفق
- `403`: دسترسی ممنوع
- `404`: یافت نشد
- `500`: خطای سرور
