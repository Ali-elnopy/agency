# تقرير إنجازات الواجهة الأمامية — Sprint 3 Frontend Deliverable Report
**مشروع:** منصة أورفيا لإدارة الوكالات الإبداعية والمحتوى (ORVIA — Creative Operations & Content Lifecycle Platform)  
**الدور:** مهندس الواجهة الأمامية (Frontend Software Engineer)  
**التقنيات المستخدمة:** React 18, Vite, Context API, Role-Based Access Control (RBAC), CSS Custom Tokens, Responsive Design, RTL/LTR Bilingual Support (Arabic & English)

---

## 1. ملخص تنفيذي (Executive Summary)

خلال **Sprint 3**، تم بناء وتطوير وتنقيح منظومة الواجهة الأمامية (Frontend) لمنصة **ORVIA** بالكامل لتغطي دورة حياة المحتوى والعمليات الإبداعية من لحظة دخول العميل (Client Onboarding) وحتى تسليم المهام ونشر المحتوى. تم الالتزام الصارم بمعمارية الـ Backend، وقاعدة البيانات (Database Schema)، ومصفوفة الصلاحيات (Permission Matrix)، مع تطبيق كافة التعديلات والمراجعات الهندسية المطلوبة لضمان تجربة مستخدم (UI/UX) احترافية ومترابطة.

---

## 2. الموديولات والوظائف المنفذة بالتفصيل (Implemented Frontend Modules)

### أولاً: هيكلة التنقل المتمحورة حول البراند وتطوير القائمة الجانبية (Brand-Centric Navigation & Sidebar UX)
1. **إعادة هيكلة مسار التنقل (Brand-Centric Flow):**
   - تم تنظيف القائمة الجانبية الرئيسية (Main Sidebar) وإزالة الأقسام الفرعية (`Strategy`, `Content Management`, `Templates`) منها، بحيث يتم الوصول إليها من داخل البراند نفسه.
   - أصبح مسار التنقل المنطقي والمتسلسل كالتالي:
     $$\text{Brands} \longrightarrow \text{Selected Brand} \longrightarrow \text{Brand Workspace Hub} \longrightarrow (\text{Brief} \mid \text{Strategy} \mid \text{Content Management} \mid \text{Platforms} \mid \text{Assets})$$
   - عند اختيار أي براند، يفتح للمستخدم **Brand Workspace Hub** الذي يعرض إحصائيات حية وبطاقات وصول مباشر لكل قسم خاص بهذا البراند فقط.
2. **تطوير القائمة الجانبية في وضعي الفتح والطي (Expanded & Collapsed Sidebar):**
   - في وضع الطي (Collapsed Mode): تم استبدال النقاط الرمادية القديمة بأيقونات **SVG** حقيقية وواضحة لكل عنصر في القائمة مع عناوين توضيحية عند التمرير (Tooltips).
   - ضبط محاذاة شعار المنصة (Orvia Logo) وزر الطي في المنتصف.
   - إعادة تصميم بطاقة المستخدم السفلية (User Profile Card) في الوضع المطوي لتظهر بشكل رأسي منظم يضم الأفاتار، اسم المستخدم، الدور الوظيفي، وأزرار الإعدادات وتسجيل الخروج دون أي قص للنصوص (No Text Clipping).

---

### ثانياً: نظام الصلاحيات الصارم وتخصيص البيانات (Role-Based Access Control & Data Scoping)
تم ربط جميع الشاشات والأزرار والعمليات بدور المستخدم الفعلي المسجل دخوله، مع التمييز الدقيق بين 5 أدوار رئيسية:

| الدور (Role) | الصلاحيات والقيود المطبقة في الواجهة الأمامية (Frontend Permissions) |
| :--- | :--- |
| **1. System Admin** | • الدور الوحيد الذي يظهر له زر **`+ Add Brand`** لإنشاء براند جديد.<br>• الدور الوحيد الذي يظهر له جدول **`Workload Allocation Matrix`** في لوحة التحكم.<br>• صلاحية استعراض شاملة لجميع البراندات والفرق والمستخدمين (Read-Only في خطط المحتوى). |
| **2. Account Manager** | • الدور الوحيد المخول بتوليد وإعادة توليد البريف الذكي (**`Generate Brief with AI`**).<br>• مراجعة ملفات الاستراتيجية داخلياً (**Approve** أو **Request Changes** مع ملاحظات) قبل إرسالها للعميل.<br>• إدارة مهام الفريق (**Team Task Management**)، إنشاء **Direct Tasks**، وتحويل المحتوى إلى مهام. |
| **3. Creator (منشئ المحتوى)** | • **الدور الوحيد** المخول بعمليات الإضافة والتعديل والتحديث والحذف (**CRUD: Create, Edit, Update, Delete**) داخل إدارة المحتوى (الخطط الشهرية، الحملات، وعناصر المحتوى).<br>• رفع ملفات الاستراتيجية وإصداراتها الجديدة، وتنفيذ المهام المسندة إليه. |
| **4. Regular Employee (موظف)** | • صلاحيات استعراض فقط في إدارة المحتوى (**View, Search, Filter, Sort**) مع إخفاء تام لأزرار الإضافة أو التعديل أو الحذف.<br>• الوصول الكامل لمساحة العمل الشخصية (**My Work**) لتنفيذ المهام المسندة إليه وتحديث حالتها. |
| **5. Client (العميل)** | • معزول تماماً في بوابة العميل (**Client Portal**) ومقيد بالبراند الخاص بحسابه فقط (لا يمكنه رؤية أي براند آخر أو خطط براندات أخرى).<br>• استعراض إجاباته في **`My Answers`** مع **إخفاء تام** لزر `Generate Brief`.<br>• معاينة وتحميل واعتماد ملف الاستراتيجية أو طلب تعديلات عليه، واستعراض خطة المحتوى الخاصة ببراند حسابه. |

---

### ثالثاً: بوابة العميل ونظام الاستبيان الديناميكي (Client Portal & Dynamic Onboarding)
1. **اختيار التصنيف والنشاط (Main Category & Activity Type Selection):**
   - شاشة البداية للعميل بعد تسجيل الدخول لتحديد التصنيف الرئيسي (مثل: `Food`, `Medical`, `Commercial`) ونوع النشاط الفرعي (مثل: `Café`, `Clinic`).
2. **توليد الأسئلة الديناميكي (Dynamic Form Generation):**
   - تجميع الأسئلة تلقائياً من مجموعات الأسئلة المشتركة + أسئلة التصنيف + أسئلة النشاط في نموذج واحد مقسم إلى **Sections** دون عرض مكتبة القوالب الخام للعميل.
3. **تجربة المستخدم والتحقق (UX & Validation):**
   - شريط تقدم حي (Progress Indicator) يوضح نسبة الإنجاز.
   - حفظ الإجابات كمسودة (**`Save Draft`**) مع الاحتفاظ بها عند التنقل بين الأقسام.
   - التحقق من الحقول الإلزامية (Required Fields Validation) ومنع الإرسال النهائي عند وجود نقص.
   - شاشة تأكيد (**Confirmation Screen**) بعد الإرسال، وقفل التعديل المباشر إلا بطلب تعديل معتمد.

---

### رابعاً: موجز البراند بالذكاء الاصطناعي (AI Brand Brief Generation & 3-Array Structure)
1. **الهيكل الثابت المكون من 7 أقسام أساسية (The 7 Core Sections):**
   - تم ضبط هيكل البريف ليلتزم حصرياً بالأقسام السبعة المعتمدة وإزالة أي حقول إضافية غير مطلوبة (مثل أسئلة التوضيح الجانبية أو شارات نوع السؤال `LONG TEXT` / `MULTIPLE CHOICE`):
     1. **`01 Brand Overview`** (نظرة عامة على البراند والنشاط والمنتجات والخدمات)
     2. **`02 Target Audience`** (الجمهور المستهدف والمناطق الجغرافية)
     3. **`03 Brand Goals`** (أهداف البراند التسويقية والتجارية)
     4. **`04 Competitive Advantage`** (نقاط التميز والمنافسة)
     5. **`05 Brand Communication`** (شخصية البراند وطريقة التواصل ونبرة الصوت)
     6. **`06 Marketing Strategy`** (الاتجاهات والاستراتيجيات التسويقية المقترحة)
     7. **`07 Content Direction`** (اتجاه المحتوى وأفكار التصوير وأنواعه)
2. **تقسيمة المصفوفات الثلاث لكل قسم (3-Array Architecture per Section):**
   - كل قسم من الأقسام السبعة يتكون من 3 مستويات واضحة ومفصولة بصرياً:
     - `clientInformation`: المعلومات التي قالها العميل بالفعل في الـ Onboarding.
     - `aiAnalysis`: تحليل الـ AI للمعلومات المتاحة.
     - `recommendations`: اقتراحات الـ AI للخطوات التسويقية والمحتوى.
3. **ضبط الصلاحيات والأزرار:**
   - إزالة زر إعادة التوليد الفائض من كارت إجابات العميل، وحصر توليد البريف بالـ **Account Manager** فقط، بينما يرى العميل إجاباته تحت تبويب **`My Answers`**.

---

### خامساً: إدارة ملفات الاستراتيجية ودورة الاعتماد المزدوجة (Content Strategy File Management)
1. **الاعتماد الكلي على إدارة الملفات (File Management Operations):**
   - تم إلغاء محرر النصوص القديم والحقول النصية الإضافية، واستبدالها بنظام إدارة ملفات متكامل يطابق المواصفات:
     - **`Upload File` / `Add`**: رفع ملف الاستراتيجية وربطه بالبراند والبريف المعتمد.
     - **`Preview / View`**: معاينة ملف الاستراتيجية مباشرة داخل المتصفح مع التحكم في التكبير والتصفح.
     - **`Update` / `Upload Another File` (New Version)**: رفع إصدار أحدث من الملف مع حفظ سجل الإصدارات (`Version History`).
     - **`Download`**: تحميل ملف الاستراتيجية.
     - **`Delete`**: حذف الملف مع نافذة تأكيد.
2. **عرض تفاصيل الاستراتيجية (Strategy Details):**
   - عرض اسم البراند (`Brand Name`)، البريف المرتبط (`Associated Brief`)، اسم وحجم الملف (`Strategy File`)، تاريخ الرفع (`Upload Date`)، رقم الإصدار (`Version`)، والحالة الحالية (`Current Status`).
3. **دورة الاعتماد المزدوجة (6-Status Workflow):**
   - `Draft` $\rightarrow$ `Uploaded / Pending Internal Review` $\rightarrow$ `Changes Requested (Account Manager)` $\rightarrow$ `Pending Client Approval` $\rightarrow$ `Changes Requested (Client)` $\rightarrow$ `Approved`.
   - **قاعدة العمل (Business Rule):** لا يُسمح بإنشاء خطة المحتوى الشهرية (`Content Plan`) إلا بعد وصول الاستراتيجية لحالة **`Approved`**.

---

### سادساً: الهيكل السداسي لإدارة المحتوى ومطابقة الحقول (6-Screen Content Management & Schema Alignment)
1. **التسلسل الهرمي عبر 6 شاشات مع شريط التنقل (Breadcrumbs):**
   - **Screen 1 — Brands:** اختيار البراند كنقطة بداية.
   - **Screen 2 — Brand Content Hub & Platform Accounts:** استعراض معلومات البراند وحسابات المنصات المرتبطة به (`Instagram`, `Facebook`, `LinkedIn`, `TikTok`, `X`).
   - **Screen 3 — Content Plans:** عرض الخطط الشهرية الخاصة بالبراند والمنصة (`Title`, `Month`, `Year`, `Status`, `Monthly Goals`) مع فلاتر (`Brand`, `Status`, `Month`, `Year`).
   - **Screen 4 — Monthly Content Plan Details:** تعرض هيدر الخطة، قسم الحملات (**Campaigns Section**)، وقسم المحتوى الحر غير المربوط بحملة (**Unassigned Content Items**).
   - **Screen 5 — Campaign Details:** تفاصيل الحملة (`Campaign Name`, `Objective`, `Start Date`, `End Date`) وقائمة عناصر المحتوى التابعة لها.
   - **Screen 6 — Content Item Details / Editor:** شاشة عرض وتعديل تفاصيل قطعة المحتوى.
2. **ضبط الحقول والأعمدة لتطابق الـ Database Schema 100%:**
   - في جدول الـ **Content Items** (سواء داخل الخطة أو داخل الحملة):
     - **تم حذف عمود `Pillar` نهائياً** لأنه غير موجود في الـ Schema الرسمية.
     - **تم قصر شارات الـ `Status` على الـ Content Plan فقط** (`DRAFT`, `IN_REVIEW`, `NEEDS_CHANGES`, `APPROVED`) طبقاً للمواصفات.
     - تم اعتماد الأعمدة الفعلية لعنصر المحتوى:
       $$\text{Content (Title \& Caption)} \mid \text{Type (POST / REEL / STORY)} \mid \text{Platform} \mid \text{Scheduled Date} \mid \text{Tone of Voice} \mid \text{Actions}$$
   - في شاشة تفاصيل ومحرر المحتوى (**Screen 6**)، الحقول هي: `Title`, `Type`, `Scheduled Date`, `Reference`, `Tone of Voice`, `Caption`, `Notes`, `Campaign (Optional)`.
3. **نوافذ التحذير عند الحذف (Delete Confirmation & Related Data Warnings):**
   - عند حذف `Content Plan` مرتبطة بحملات أو عناصر محتوى، تظهر رسالة التحذير المعتمدة:
     *"This Content Plan has related Campaigns and Content Items. Deleting it may affect related data. Do you want to continue?"*
   - تحذير مماثل عند حذف `Campaign` تحتوي على عناصر محتوى، وتأكيد قبل حذف أي `Content Item`.

---

### سابعاً: إدارة المهام ومساحة العمل الشخصية (Tasks & My Work Module)
1. **صفحة مهامي (`My Work` — Personal Workspace للموظف والـ Creator):**
   - **Header & Summary:** ملخص سريع لعدد المهام، المتأخرة (`Overdue`)، مهام اليوم (`Today's Tasks`)، القادمة (`Upcoming`)، ذات الأولوية العالية (`High Priority`)، والمرتجعة للتعديل (`Returned with Revisions`).
   - **بطاقة المهمة (Task Card):** تعرض كافة التفاصيل بوضوح دون الحاجة لفتح نافذة خارجية:
     - اسم التاسك ونوعه (`Content Creation / Review / Publish / Direct`).
     - الحالة (`Status`) والأولوية (`Priority`).
     - الموعد النهائي الفعلي (`Effective Deadline`) مع تمييز بصري باللون الأحمر للمهام المتأخرة.
     - عنصر المحتوى المرتبط (`Associated Content Item`) والبراند التابع له.
     - صندوق ملاحظات المدير (`Manager Feedback`) في حال طُلب تعديل على التاسك.
     - أزرار الإجراء المباشر حسب الحالة (`Start Task`, `Submit for Review`).
2. **صفحة إدارة المهام (`Tasks` — Team Task Management للـ Account Manager):**
   - إنشاء **Direct Task** (مهمة مباشرة غير مربوطة بعنصر محتوى) بالحقول المعتمدة: `Title` (إلزامي)، `Description` (اختياري)، `Assigned To` (إلزامي)، مع تحديد البراند والأولوية والموعد النهائي.
   - تحويل عناصر المحتوى المعتمدة إلى مهام تنفيذية للموظفين والمراجعين، مع إمكانية العرض بنظام **Kanban Board** أو **Table View** والفلترة حسب البراند والأولوية.

---

### ثامناً: مركز الإشعارات ودعم اللغتين (Notifications & Bilingual Support)
1. **مركز الإشعارات (Notifications Engine):**
   - أيقونة الجرس في الـ Topbar مع عداد للإشعارات غير المقروءة (`Unread Count`).
   - قائمة منسدلة تعرض الإشعارات المرتبطة بدورة العمل (إرسال استبيان عميل، توليد بريف، رفع استراتيجية للمراجعة، قرار العميل على الاستراتيجية، وإسناد المهام).
   - إمكانية تحديد إشعار كمقروء (`Mark as Read`) أو تحديد الكل كمقروء (`Mark All as Read`).
2. **دعم اللغتين العربية والإنجليزية (RTL / LTR):**
   - قاموس ترجمة متكامل يدعم التحويل اللحظي بين العربية (RTL) والإنجليزية (LTR) مع ضبط اتجاه الجداول، القوائم الجانبية، والبطاقات.

---

## 3. قائمة الملفات الرئيسية المعدلة والمنجزة في الـ Frontend

| مسار الملف (File Path) | الدور الوظيفي والتعديلات المنفذة |
| :--- | :--- |
| `frontend/src/components/layout/Sidebar.jsx` | إزالة (`Strategy`, `Content Management`, `Templates`) من القائمة الرئيسية، إضافة أيقونات SVG في وضع الطي، وتنظيم كارت المستخدم السفلي. |
| `frontend/src/components/brands/BrandWorkspaceHub.jsx` | بوابة البراند الداخلية للوصول إلى البريف، الاستراتيجية، إدارة المحتوى، المنصات، والملفات الخاصة بالبراند المختار. |
| `frontend/src/pages/BrandDetailPage.jsx` | ربط تبويبات البراند مباشرة بموديولات `StrategyWorkspacePage` و `ContentItemsPage` المفلترة حسب الـ `brand.id`. |
| `frontend/src/pages/ContentItemsPage.jsx` | تطبيق الهيكل السداسي لإدارة المحتوى، صلاحيات الـ Creator مقابل الـ Regular Employee، وتعديل أعمدة جدول الـ Content Items وحذف عمود `Pillar`. |
| `frontend/src/pages/StrategyWorkspacePage.jsx` | نظام إدارة ملفات الاستراتيجية (`Upload`, `Preview`, `New Version`, `Download`, `Delete`) ودورة الاعتماد المزدوجة (Account Manager + Client). |
| `frontend/src/pages/AiBriefPage.jsx` | هيكلة البريف في 7 أقسام أساسية و3 مصفوفات لكل قسم (`clientInformation`, `aiAnalysis`, `recommendations`) وحصر التوليد بالـ Account Manager. |
| `frontend/src/pages/ClientPortalPage.jsx` | بوابة العميل المعزولة، الاستبيان الديناميكي، عرض `My Answers` بدون زر توليد البريف، ومراجعة الاستراتيجية والخطة. |
| `frontend/src/pages/TasksPage.jsx` & `MyWorkPage.jsx` | إدارة مهام الفريق (`Direct Tasks` ومتابعة الفريق) ومساحة العمل الشخصية للموظف (`My Work`). |
| `frontend/src/pages/DashboardPage.jsx` & `OverviewSection.jsx` | حصر مصفوفة توزيع أعباء العمل (`Workload Allocation Matrix`) وزر إضافة البراند بالـ `System Admin` فقط، وتوجيه الأدوار للشاشات المناسبة. |
| `frontend/src/styles/dashboard.css` & `sprint3.css` | تحسينات التصميم، ألوان الـ Pastel، وتنسيقات القائمة الجانبية المطوية والجداول المتجاوبة. |
