# Frontend

واجهة React مبنية بـ Vite وتقرأ عنوان الـ backend من متغير البيئة `VITE_API_URL`.

## Local Development

1. انسخ `.env.example` إلى `.env`.
2. اضبط القيمة المحلية:

```env
VITE_API_URL=http://localhost:5000
```

3. شغّل المشروع:

```bash
npm install
npm run dev
```

الواجهة تعمل محلياً على `http://localhost:5173`، والطلبات تذهب إلى `http://localhost:5000` عبر `VITE_API_URL`.

## Vercel

أضف متغير البيئة التالي في Vercel:

```env
VITE_API_URL=https://YOUR-BACKEND.onrender.com
```

جميع طلبات الـ API تمر عبر [src/lib/apiClient.js](/c:/Users/qusai/grad_project/src/lib/apiClient.js:1)، لذلك لا حاجة لتعديل الصفحات أو النماذج عند تغيير رابط الخادم.
