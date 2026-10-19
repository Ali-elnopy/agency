# ORVIA — React (Vite)

واجهة ORVIA (Login + Dashboard) بنسخة React مبنية بـ **Vite**.

## التشغيل (Development)

```bash
npm install
npm run dev
```

بعدها افتح الرابط اللي يظهر في التيرمنال، عادة: **http://localhost:5173**

## البناء (Production)

```bash
npm run build      # يطلّع فولدر dist
npm run preview    # تجربة نسخة الإنتاج محليًا
```

البناء بيطلع **ملف واحد**: `dist/index.html` (كل الـ JS والـ CSS جوّاه عن طريق `vite-plugin-singlefile`)،
فممكن **تفتحه بالدبل كليك** مباشرة من غير أي سيرفر، أو ترفعه زي ما هو.

## مهم

- ❌ **متحاولش تفتح `index.html` اللي في الجذر بالدبل كليك** — ده ملف مصدر لـ Vite، مش صفحة جاهزة.
  لازم `npm run dev` (أو نسخة `dist` بعد البناء).
- ✅ للتشغيل: `npm run dev` — للعرض/التسليم: `npm run build` ثم افتح `dist/index.html`.
- لو هترفع على GitHub Pages أو أي sub-folder: `base: "./"` مضبوط بالفعل في `vite.config.js`.

## الهيكل

```
index.html            ← قالب Vite (نقطة الدخول)
vite.config.js        ← React + base نسبي + single-file build
src/
  main.jsx            ← تركيب React + استيراد الستايل
  App.jsx             ← Login / Dashboard
  useHashView.js      ← التبديل بين الصفحات بالـ hash
  style.css           ← كل التصميم
  components/         ← Login, Dashboard, Sidebar, Topbar, Stats, Roles, Activity, Icons, Showcase, Brand, ThemeToggle
```
