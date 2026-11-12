const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>ORVIA - Complete System Documentation & Implementation Guide</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

    @page {
      size: A4;
      margin: 16mm 14mm 16mm 14mm;
      @bottom-right {
        content: counter(page);
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Cairo', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #FFFFFF;
      color: #1A1A1A;
      line-height: 1.6;
      font-size: 13px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page-break {
      page-break-before: always;
    }

    /* Cover Page */
    .cover {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px 30px;
      background: linear-gradient(135deg, #F8F7F3 0%, #FFFFFF 50%, #EAE7FC 100%);
      border: 2px solid #E5E7EB;
      border-radius: 16px;
      page-break-after: always;
    }

    .cover-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .cover-logo {
      width: 54px;
      height: 54px;
      background: #111111;
      color: #FFFFFF;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      font-weight: 900;
      font-family: 'Inter', sans-serif;
    }

    .cover-brand {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #111111;
    }

    .cover-body {
      margin: auto 0;
    }

    .cover-badge {
      display: inline-block;
      background: #6C5CE7;
      color: #FFFFFF;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 16px;
      border-radius: 20px;
      margin-bottom: 20px;
      letter-spacing: 0.5px;
    }

    .cover-title {
      font-size: 34px;
      font-weight: 900;
      color: #111111;
      line-height: 1.25;
      margin-bottom: 16px;
    }

    .cover-subtitle {
      font-size: 17px;
      color: #4B5563;
      max-width: 650px;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .cover-tags {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .cover-tag {
      background: #FFFFFF;
      border: 1px solid #D1D5DB;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
      color: #374151;
    }

    .cover-footer {
      border-top: 1px solid #E5E7EB;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #6B7280;
    }

    /* Content Layout */
    .section {
      margin-bottom: 28px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 800;
      color: #111111;
      border-bottom: 2px solid #111111;
      padding-bottom: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-subtitle {
      font-size: 15px;
      font-weight: 700;
      color: #374151;
      margin: 16px 0 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-subtitle::before {
      content: "";
      width: 6px;
      height: 16px;
      background: #6C5CE7;
      border-radius: 3px;
      display: inline-block;
    }

    p {
      margin-bottom: 10px;
      color: #374151;
      text-align: justify;
    }

    /* Pastel Callout Cards */
    .card-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin: 14px 0;
    }

    .card-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 14px 0;
    }

    .card {
      border-radius: 12px;
      padding: 14px;
      border: 1px solid rgba(0,0,0,0.06);
    }

    .card-lilac {
      background: #EAE7FC;
      border-color: #D6D0F8;
    }

    .card-blue {
      background: #DBEBFC;
      border-color: #C2DCFA;
    }

    .card-peach {
      background: #FDE2D8;
      border-color: #F8CAB8;
    }

    .card-ivory {
      background: #F8F7F3;
      border-color: #E6E4DC;
    }

    .card h4 {
      font-size: 13px;
      font-weight: 800;
      color: #111111;
      margin-bottom: 6px;
    }

    .card p {
      font-size: 11.5px;
      color: #374151;
      margin-bottom: 0;
      line-height: 1.5;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 11.5px;
    }

    th, td {
      border: 1px solid #E5E7EB;
      padding: 8px 10px;
      text-align: right;
    }

    th {
      background: #F8F7F3;
      color: #111111;
      font-weight: 700;
    }

    tr:nth-child(even) td {
      background: #FAFAFA;
    }

    .badge-check {
      display: inline-block;
      background: #DEF7EC;
      color: #03543F;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 10.5px;
    }

    .badge-no {
      display: inline-block;
      background: #FDE8E8;
      color: #9B1C1C;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 10.5px;
    }

    .badge-pill {
      display: inline-block;
      background: #111111;
      color: #FFFFFF;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
    }

    /* Step flow */
    .flow-steps {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 14px 0;
    }

    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #F8F7F3;
      padding: 10px 14px;
      border-radius: 10px;
      border-right: 4px solid #111111;
    }

    .step-num {
      width: 24px;
      height: 24px;
      background: #111111;
      color: #FFFFFF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
      flex-shrink: 0;
    }

    .step-content h5 {
      font-size: 12.5px;
      font-weight: 700;
      color: #111111;
      margin-bottom: 2px;
    }

    .step-content p {
      font-size: 11.5px;
      color: #4B5563;
      margin-bottom: 0;
    }

    /* Screen Architecture List */
    .screen-card {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 10px;
      border-left: 4px solid #6C5CE7;
    }

    .screen-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .screen-title {
      font-size: 12.5px;
      font-weight: 700;
      color: #111111;
    }

    .screen-badge {
      background: #EAE7FC;
      color: #5B4BD5;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
    }

    /* Credentials Card */
    .cred-box {
      background: #111111;
      color: #FFFFFF;
      border-radius: 12px;
      padding: 16px;
      margin: 14px 0;
    }

    .cred-box table {
      margin: 8px 0 0 0;
    }

    .cred-box th {
      background: #222222;
      color: #FFFFFF;
      border-color: #333333;
    }

    .cred-box td {
      border-color: #333333;
      color: #E5E7EB;
      background: #161616;
    }

    .cred-box tr:nth-child(even) td {
      background: #1B1B1B;
    }

    code {
      font-family: 'Consolas', 'Courier New', monospace;
      background: rgba(0,0,0,0.06);
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 11px;
      color: #9333EA;
      direction: ltr;
      display: inline-block;
    }

    .cred-box code {
      background: #2A2A2A;
      color: #34D399;
    }

    .footer-note {
      font-size: 10.5px;
      color: #9CA3AF;
      text-align: center;
      margin-top: 20px;
      border-top: 1px solid #E5E7EB;
      padding-top: 8px;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover">
    <div class="cover-header">
      <div class="cover-logo">O</div>
      <div class="cover-brand">ORVIA</div>
    </div>
    <div class="cover-body">
      <div class="cover-badge">SPRINT 3 COMPLETE SPECIFICATION & DELIVERABLE</div>
      <h1 class="cover-title">توثيق النظام الشامل والواجهات الأمامية<br>Creative Operations & Content Lifecycle</h1>
      <p class="cover-subtitle">
        دليل توثيقي هندسي تفصيلي يغطي كافة جوانب منصة Orvia المنفذة في الواجهة الأمامية: نظام الصلاحيات والمصادقة الصارمة، بوابة العملاء والاستبيان الديناميكي الذكي، محرك بريف البراند بالذكاء الاصطناعي، دورة اعتماد استراتيجية المحتوى ثنائية البوابات، مركز الإشعارات الفوري، والهيكل السداسي لإدارة المحتوى والخطط والحملات، مع نظام التصميم والألوان المعتمد.
      </p>
      <div class="cover-tags">
        <span class="cover-tag">Frontend Architecture</span>
        <span class="cover-tag">Role-Based Access (5 Roles)</span>
        <span class="cover-tag">Client Portal & Onboarding</span>
        <span class="cover-tag">AI Brand Brief</span>
        <span class="cover-tag">Content Strategy Workflow</span>
        <span class="cover-tag">6-Screen Content Architecture</span>
        <span class="cover-tag">Pastel Design System</span>
      </div>
    </div>
    <div class="cover-footer">
      <span>مشروع وكالة أورفيا (Orvia Agency Platform)</span>
      <span>الإصدار: Sprint 3 (Final Frontend Delivery)</span>
      <span>نوفمبر 2026</span>
    </div>
  </div>

  <!-- TABLE OF CONTENTS & OVERVIEW -->
  <div class="section">
    <div class="section-title">
      <span>1. الفهرس ونظرة عامة على المشروع (Executive Overview)</span>
      <span class="badge-pill">Overview</span>
    </div>
    <p>
      منصة <strong>Orvia</strong> هي نظام سحابي متكامل لإدارة العمليات الإبداعية واستراتيجيات المحتوى بين وكالات التسويق وعملائها وفرق العمل المتخصصة. تم في هذه المرحلة (Sprint 3) إعادة صياغة وهيكلة الواجهة الأمامية بالكامل لتلتزم بدقة بمتطلبات التصميم والسلوك الواردة في وثائق الـ Sprint الرسمية.
    </p>

    <div class="card-grid">
      <div class="card card-lilac">
        <h4>🎯 أهداف المرحلة (Sprint 3 Scope)</h4>
        <p>
          • تفعيل نظام الصلاحيات والمصادقة الحقيقية عبر البريد الإلكتروني.<br>
          • استبدال مسمى Content Creator بـ Employee (موظف) في كافة الشاشات.<br>
          • بناء بوابة العميل والاستبيان الديناميكي (7 أقسام) مع الحفظ والإرسال.<br>
          • توليد ومراجعة موجز البراند بالذكاء الاصطناعي (AI Brand Brief).<br>
          • دورة مراجعة الاستراتيجية (اعتماد داخلي + اعتماد العميل).<br>
          • الهيكل السداسي لإدارة المحتوى (6-Screen Hierarchy).
        </p>
      </div>
      <div class="card card-blue">
        <h4>🎨 لغة التصميم والهوية البصرية</h4>
        <p>
          • خلفية عاجية دافئة (#F8F7F3) مستوحاة من التصميم العصري.<br>
          • كروت ملونة باستيل (أرجواني #EAE7FC، أزرق سماوي #DBEBFC، خوخي #FDE2D8).<br>
          • أزرار رئيسية سوداء مصمتة (#111111) وبادجات دائرية أنيقة.<br>
          • شريط جانبي فاتح ونظيف مع مؤشرات حالة أرجوانية (#6C5CE7).<br>
          • دعم كامل وثنائي للغتين العربية (RTL) والإنجليزية (LTR).
        </p>
      </div>
    </div>

    <div class="section-subtitle">جدول المحتويات التفصيلي</div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>القسم</th>
          <th>الموضوع الأساسي والوظائف المغطاة</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>2</strong></td>
          <td><strong>المستخدمون والصلاحيات</strong></td>
          <td>الأدوار الخمسة، مصفوفة الصلاحيات، إلغاء التبديل السريع، وبيانات تسجيل الدخول الاختبارية.</td>
        </tr>
        <tr>
          <td><strong>3</strong></td>
          <td><strong>بوابة العميل والاستبيان</strong></td>
          <td>اختيار التصنيف والنشاط، محرك الأسئلة الديناميكي، الأقسام السبعة، ومؤشر التقدم.</td>
        </tr>
        <tr>
          <td><strong>4</strong></td>
          <td><strong>بريف البراند بالذكاء الاصطناعي</strong></td>
          <td>هيكلية البريف الموحدة، الفصل بين بيانات العميل وتوليد الذكاء الاصطناعي، وسجل الإصدارات.</td>
        </tr>
        <tr>
          <td><strong>5</strong></td>
          <td><strong>استراتيجية المحتوى والاعتماد</strong></td>
          <td>دورة الاعتماد ثنائية البوابة (Account Manager ثم Client)، وقفل الخطط حتى الاعتماد.</td>
        </tr>
        <tr>
          <td><strong>6</strong></td>
          <td><strong>الهيكل السداسي لإدارة المحتوى</strong></td>
          <td>التنقل الهرمي عبر 6 شاشات: البراندات، الحسابات، الخطط، تفاصيل الخطة، الحملات، وصانع المحتوى.</td>
        </tr>
        <tr>
          <td><strong>7</strong></td>
          <td><strong>مركز الإشعارات والتنبيهات</strong></td>
          <td>جرس التنبيهات في الـ Topbar، العداد الحي، وتصنيفات المهام والاعتمادات.</td>
        </tr>
        <tr>
          <td><strong>8</strong></td>
          <td><strong>توثيق عناصر التصميم (Design Tokens)</strong></td>
          <td>لوحة الألوان الدقيقة، أوزان الخطوط، وتنسيق الأزرار والكروت.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="page-break"></div>

  <!-- ROLES & CREDENTIALS -->
  <div class="section">
    <div class="section-title">
      <span>2. إدارة الهوية، الأدوار ومصفوفة الصلاحيات (Roles & Access Matrix)</span>
      <span class="badge-pill">Security & Access</span>
    </div>
    <p>
      تم تطبيق نظام مصادقة وصلاحيات صارم في الواجهة الأمامية وفق متطلبات المشروع. <strong>تم إلغاء شريط التبديل السريع (Previewing As...) بالكامل</strong>، ولا يمكن لأي مستخدم التبديل بين الأدوار إلا من خلال تسجيل الدخول الرسمي عبر البريد الإلكتروني وكلمة المرور الخاصة بكل حساب.
    </p>

    <div class="section-subtitle">الأدوار المعتمدة في النظام (The 5 Roles)</div>
    <div class="card-grid">
      <div class="card card-ivory">
        <h4>1. مدير النظام (System Admin)</h4>
        <p>مسؤول الإشراف الشامل، عرض كافة البراندات، الفرق، التقارير ومتابعة سير العمل العام بدون تعديل مباشر على خطط المحتوى اليومية.</p>
      </div>
      <div class="card card-ivory">
        <h4>2. مدير الحسابات (Account Manager)</h4>
        <p>مسؤول إدارة العلاقة مع العملاء، استلام استراتيجية المحتوى من الفريق، مراجعتها داخلياً واعتمادها أو طلب تعديلها قبل إرسالها للعميل.</p>
      </div>
      <div class="card card-ivory">
        <h4>3. المنشئ (Creator)</h4>
        <p><strong>الدور الوحيد</strong> الذي يملك صلاحيات الإنشاء والتعديل والحذف الكاملة (CRUD) لخطط المحتوى، الحملات الإعلانية، وعناصر المحتوى.</p>
      </div>
      <div class="card card-ivory">
        <h4>4. الموظف (Employee - سابقاً Content Creator)</h4>
        <p>موظف الفريق الإبداعي، يملك صلاحية عرض الخطط والحملات والموجز الذكي، والبحث والفلترة، ومراجعة المهام المسندة إليه (صلاحيات قراءة فقط في إدارة المحتوى).</p>
      </div>
    </div>

    <div class="section-subtitle">بيانات تسجيل الدخول الاختبارية الرسمية (Test Credentials)</div>
    <div class="cred-box">
      <p style="color: #9CA3AF; margin-bottom: 6px;">يمكن استخدام الحسابات التالية لتسجيل الدخول واختبار سلوك النظام بحسب كل دور:</p>
      <table>
        <thead>
          <tr>
            <th>الدور (Role)</th>
            <th>الاسم التجريبي</th>
            <th>البريد الإلكتروني (Email)</th>
            <th>كلمة المرور (Password)</th>
            <th>الصلاحيات والشاشات الرئيسية</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>System Admin</strong></td>
            <td>Admin Sarah</td>
            <td><code>admin@orvia.com</code></td>
            <td><code>Password123!</code></td>
            <td>لوحة التحكم الكاملة، شاشة البراندات، التقارير (Read-only في الخطط)</td>
          </tr>
          <tr>
            <td><strong>Account Manager</strong></td>
            <td>Marcus Vance</td>
            <td><code>am@orvia.com</code></td>
            <td><code>Password123!</code></td>
            <td>مراجعة استراتيجيات المحتوى واعتمادها داخلياً، التنبيهات، البراندات</td>
          </tr>
          <tr>
            <td><strong>Creator</strong></td>
            <td>Zack Miller</td>
            <td><code>creator@orvia.com</code></td>
            <td><code>Password123!</code></td>
            <td><strong>صلاحيات كاملة CRUD</strong>: إنشاء وتعديل وحذف الخطط والحملات والبوستات</td>
          </tr>
          <tr>
            <td><strong>Employee (موظف)</strong></td>
            <td>Alex Rivera</td>
            <td><code>employee@orvia.com</code></td>
            <td><code>Password123!</code></td>
            <td>استعراض الخطط والمهام والبريف الذكي، مهامي (My Work) (Read-only)</td>
          </tr>
          <tr>
            <td><strong>Client</strong></td>
            <td>Nour El-Din</td>
            <td><code>client@orvia.com</code></td>
            <td><code>Password123!</code></td>
            <td>بوابة العميل الحصرية: الاستبيان، البريف، مراجعة واعتماد الاستراتيجية</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section-subtitle">مصفوفة الصلاحيات لإدارة المحتوى (Content Management Permission Matrix)</div>
    <table>
      <thead>
        <tr>
          <th>الإجراء المطلوب (Action)</th>
          <th>Creator</th>
          <th>Employee (موظف)</th>
          <th>Account Manager</th>
          <th>Admin</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>استعراض البراندات (View Brands)</td>
          <td><span class="badge-check">متاح ✅</span></td>
          <td><span class="badge-check">متاح ✅</span></td>
          <td><span class="badge-check">متاح ✅</span></td>
          <td><span class="badge-check">متاح ✅</span></td>
        </tr>
        <tr>
          <td>استعراض المنصات (View Platform Accounts)</td>
          <td><span class="badge-check">متاح ✅</span></td>
          <td><span class="badge-check">متاح ✅</span></td>
          <td><span class="badge-check">متاح ✅</span></td>
          <td><span class="badge-check">متاح ✅</span></td>
        </tr>
        <tr>
          <td>استعراض خطط المحتوى (View Content Plans)</td>
          <td><span class="badge-check">متاح ✅</span></td>
          <td><span class="badge-check">متاح ✅</span></td>
          <td><span class="badge-check">متاح ✅</span></td>
          <td><span class="badge-check">متاح ✅</span></td>
        </tr>
        <tr>
          <td>البحث والتصفية (Search / Filter)</td>
          <td><span class="badge-check">متاح ✅</span></td>
          <td><span class="badge-check">متاح ✅</span></td>
          <td><span class="badge-check">متاح ✅</span></td>
          <td><span class="badge-check">متاح ✅</span></td>
        </tr>
        <tr>
          <td>إنشاء خطة محتوى (Create Plan)</td>
          <td><span class="badge-check">متاح ✅</span></td>
          <td><span class="badge-no">محظور ❌</span></td>
          <td><span class="badge-no">محظور ❌</span></td>
          <td><span class="badge-no">محظور ❌</span></td>
        </tr>
        <tr>
          <td>تعديل أو حذف خطة (Edit/Delete Plan)</td>
          <td><span class="badge-check">متاح ✅</span></td>
          <td><span class="badge-no">محظور ❌</span></td>
          <td><span class="badge-no">محظور ❌</span></td>
          <td><span class="badge-no">محظور ❌</span></td>
        </tr>
        <tr>
          <td>إنشاء حملة أو عنصر محتوى (Create Campaign/Item)</td>
          <td><span class="badge-check">متاح ✅</span></td>
          <td><span class="badge-no">محظور ❌</span></td>
          <td><span class="badge-no">محظور ❌</span></td>
          <td><span class="badge-no">محظور ❌</span></td>
        </tr>
        <tr>
          <td>تعديل أو حذف عنصر محتوى (Edit/Delete Item)</td>
          <td><span class="badge-check">متاح ✅</span></td>
          <td><span class="badge-no">محظور ❌</span></td>
          <td><span class="badge-no">محظور ❌</span></td>
          <td><span class="badge-no">محظور ❌</span></td>
        </tr>
      </tbody>
    </table>

    <div class="section-subtitle">سياسة تخصيص المحفظة وصلاحية إضافة البراندات (Portfolio Scoping & Brand Controls)</div>
    <div class="card">
      <ul style="margin: 0; padding-right: 20px; line-height: 1.8;">
        <li><strong>حصر زر إضافة البراندات (+ Add Brand) بالمدير العام فقط:</strong> زرا إضافة البراند سواء من رأس الشاشة أو عند تصفير الفلاتر يظهر حصرياً للـ System Admin ومخفي تماماً عن باقي المستخدمين (Account Manager, Creator, Employee, Client).</li>
        <li><strong>الانضمام لأكثر من فريق (Multi-Team Membership):</strong> أصبح بإمكان مديري الحسابات وموظفي المحتوى الانضمام لعدة فِرق في آن واحد دون قفل الحساب أو إزالته من فريقه السابق.</li>
        <li><strong>حصر البيانات والمحتوى بالبراندات المسندة (Brand Portfolio Scoping):</strong> كل مستخدم تظهر له في شاشات البراندات، وخطط المحتوى، والاستراتيجية، والمهام، البراندات المرتبطة بفرقه فقط:
          <ul>
            <li><strong>المشرف العام (Admin):</strong> يشاهد كامل المنظومة بجميع البراندات الـ 8.</li>
            <li><strong>مدير الحسابات (Account Manager):</strong> يشاهد البراندات التي يديرها بفرقه (4 براندات).</li>
            <li><strong>المنشئ (Creator):</strong> يشاهد البراندات المسندة لفرق الإنتاج التابع لها (4 براندات).</li>
            <li><strong>الموظف (Employee):</strong> يشاهد براندات فرقه التشغيلية فقط (3 براندات).</li>
            <li><strong>العميل (Client):</strong> يشاهد برانده الحصري الخاص به فقط.</li>
          </ul>
        </li>
      </ul>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- CLIENT PORTAL & ONBOARDING -->
  <div class="section">
    <div class="section-title">
      <span>3. بوابة العميل والاستبيان الديناميكي (Client Portal & Onboarding)</span>
      <span class="badge-pill">Client Experience</span>
    </div>
    <p>
      تم تصميم بوابة العميل (Client Portal) لتقديم تجربة سلسة وعصرية تبدأ من تسجيل العميل وتنتهي باعتماده النهائي لاستراتيجية المحتوى. لا يرى العميل قوالب خام أو مصطلحات تقنية معقدة، بل استبياناً تفاعلياً ذكياً يتكيف آلياً مع طبيعة نشاطه.
    </p>

    <div class="flow-steps">
      <div class="step-item">
        <div class="step-num">1</div>
        <div class="step-content">
          <h5>الخطوة الأولى: تحديد التصنيف الرئيسي ونوع النشاط (Category & Activity Selection)</h5>
          <p>يختار العميل التصنيف الأساسي لعلامته التجارية (مثل: Food & Beverage, Fashion, Technology) ثم يحدد نوع النشاط الدقيق (مثل: Specialty Café, Cloud Kitchen, Casual Dining). يظهر هذا القسم داخل كارد أرجواني فاخر (#EAE7FC).</p>
        </div>
      </div>
      <div class="step-item">
        <div class="step-num">2</div>
        <div class="step-content">
          <h5>الخطوة الثانية: توليد الأسئلة الديناميكية (Dynamic Question Selection)</h5>
          <p>يقوم النظام آلياً في الخلفية بدمج الأسئلة العامة للبراند مع الأسئلة التخصصية لقطاع النشاط ونوع العمل المحدد، دون الحاجة لاختيار يدوي للقوالب من قبل العميل.</p>
        </div>
      </div>
      <div class="step-item">
        <div class="step-num">3</div>
        <div class="step-content">
          <h5>الخطوة الثالثة: تعبئة الاستبيان الموزع على 7 أقسام متخصصة (The 7 Form Sections)</h5>
          <p>يتم توزيع الأسئلة على 7 أقسام منطقية تضمن شمولية البيانات مع وجود مؤشر إنجاز حي (Progress Bar) ونظام حفظ تلقائي للمسودات (Save Draft).</p>
        </div>
      </div>
      <div class="step-item">
        <div class="step-num">4</div>
        <div class="step-content">
          <h5>الخطوة الرابعة: الإرسال وقفل التعديل المباشر (Submission & Modification Lock)</h5>
          <p>عند الضغط على Submit، يظهر تنبيه تأكيدي للعميل يفيد بأنه بمجرد الإرسال سيتم قفل النموذج وبدء تحليل الذكاء الاصطناعي، وأي تعديل مستقبلي يتطلب طلباً رسمياً (Request Modification).</p>
        </div>
      </div>
      <div class="step-item">
        <div class="step-num">5</div>
        <div class="step-content">
          <h5>الخطوة الخامسة: شاشة التأكيد والنجاح (Confirmation Screen)</h5>
          <p>تظهر شاشة النجاح داخل كارد سماوي (#DBEBFC) تشعر العميل بأن البيانات تم استلامها بنجاح وأن موجز البراند (Brief) قيد الإعداد.</p>
        </div>
      </div>
    </div>

    <div class="section-subtitle">الأقسام السبعة لاستبيان التهيئة (The 7 Onboarding Sections)</div>
    <div class="card-grid">
      <div class="card card-ivory">
        <h4>1. Brand Information (معلومات البراند)</h4>
        <p>الاسم التجاري، الرؤية والرسالة، القصة التأسيسية، والقيم الأساسية التي تميز العلامة.</p>
      </div>
      <div class="card card-ivory">
        <h4>2. Products & Services (المنتجات والخدمات)</h4>
        <p>المنتجات الرئيسية، الخدمات الإضافية، نقاط البيع الفريدة (USPs)، ومستويات الأسعار.</p>
      </div>
      <div class="card card-ivory">
        <h4>3. Target Audience (الجمهور المستهدف)</h4>
        <p>الشرائح الديموغرافية، الفئات العمرية، الاهتمامات، والمناطق الجغرافية المستهدفة.</p>
      </div>
      <div class="card card-ivory">
        <h4>4. Brand Goals (أهداف العلامة التجارية)</h4>
        <p>الأهداف قصيرة وطويلة الأجل، زيادة الوعي، زيادة المبيعات، أو بناء مجتمع وفيّ للعلامة.</p>
      </div>
      <div class="card card-ivory">
        <h4>5. Competitors (المنافسون المباشرون)</h4>
        <p>أبرز المنافسين في السوق المحلي والإقليمي، نقاط قوتهم ومجالات التميز عنهم.</p>
      </div>
      <div class="card card-ivory">
        <h4>6. Brand Personality (شخصية ونبرة البراند)</h4>
        <p>النبرة اللغوية المفضلة (رسمية، شبابية، مرحة، ملهمة)، والكلمات الممنوع استخدامها.</p>
      </div>
    </div>
    <div class="card card-ivory" style="margin-top: 10px;">
      <h4>7. Marketing Objectives & Delivery Channels (الأهداف التسويقية وقنوات النشر)</h4>
      <p>المنصات الرقمية المفضلة (Instagram, TikTok, LinkedIn, Facebook, X)، ونوعية المخرجات المطلوبة شهرياً.</p>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- AI BRAND BRIEF & STRATEGY LIFECYCLE -->
  <div class="section">
    <div class="section-title">
      <span>4. موجز البراند بالذكاء الاصطناعي (AI Brand Brief Generation)</span>
      <span class="badge-pill">AI Automation</span>
    </div>
    <p>
      بمجرد اعتماد وإرسال استبيان العميل، يقوم النظام بتوليد <strong>موجز البراند الذكي (AI Brand Brief)</strong>. يمتاز هذا الموجز بهيكلية ثابتة وموحدة مكونة من 7 أقسام رئيسية يقوم الذكاء الاصطناعي بصياغتها استناداً لإجابات العميل دون تغيير الهيكل الأساسي.
    </p>

    <div class="card-grid">
      <div class="card card-peach">
        <h4>🤖 الفصل البصري الصارم بين البيانات</h4>
        <p>
          تلتزم واجهة الـ Brief بالفصل الواضح بين:<br>
          <strong>• Original Client Answers:</strong> الإجابات الأصلية كما أدخلها العميل دون تحريف.<br>
          <strong>• AI Generated Content:</strong> التحليل والاستخلاص الذكي مع تمييزه ببادج الذكاء الاصطناعي.
        </p>
      </div>
      <div class="card card-lilac">
        <h4>📑 إدارة الإصدارات والحالة (Versioning)</h4>
        <p>
          يتم ربط كل بريف برقم إصدار محدد (مثل Version 1.0)، مع بيان تاريخ الإنشاء، وحالة المستند (Generating, Completed, Failed)، مع إمكانية إعادة التوليد أو التعديل الداخلي.
        </p>
      </div>
    </div>

    <div class="section-subtitle">الأقسام السبعة الثابتة لموجز البراند الذكي</div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>اسم القسم (Section)</th>
          <th>المحتوى المستخلص بالذكاء الاصطناعي</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td><strong>Brand Summary</strong></td>
          <td>ملخص شامل ومكثف لهوية البراند وموقعه التنافسي في السوق.</td>
        </tr>
        <tr>
          <td>2</td>
          <td><strong>Market Position</strong></td>
          <td>مكانة البراند في القطاع وحصته ونقاط القوة والفرص السوقية المتاحة.</td>
        </tr>
        <tr>
          <td>3</td>
          <td><strong>Target Personas</strong></td>
          <td>بناء شخصيات دقيقة للمستهلك المستهدف (Buyer Personas) واحتياجاتهم ونقاط ألمهم.</td>
        </tr>
        <tr>
          <td>4</td>
          <td><strong>Core Messaging</strong></td>
          <td>الرسائل الاتصالية الرئيسية والوعد الأساسي الذي تقدمه العلامة التجارية لجمهورها.</td>
        </tr>
        <tr>
          <td>5</td>
          <td><strong>Tone & Voice</strong></td>
          <td>دليل نبرة الصوت والكتابة الإبداعية الواجب اتباعها في كافة المنشورات والتصاميم.</td>
        </tr>
        <tr>
          <td>6</td>
          <td><strong>Content Pillars</strong></td>
          <td>ركائز المحتوى الأساسية (تعليمي، ترفيهي، ترويجي، تفاعلي) ونسب توزيعها المقترحة.</td>
        </tr>
        <tr>
          <td>7</td>
          <td><strong>Action Plan</strong></td>
          <td>خارطة الطريق التنفيذية الأولية لإعداد استراتيجية المحتوى الشهرية.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section" style="margin-top: 24px;">
    <div class="section-title">
      <span>5. دورة حياة استراتيجية المحتوى والاعتماد المزدوج (Strategy Lifecycle)</span>
      <span class="badge-pill">Governance</span>
    </div>
    <p>
      يستخدم فريق العمل الإبداعي (Employee / Creator) موجز البراند الذكي كمرجع أساسي لإعداد وثيقة <strong>استراتيجية المحتوى (Content Strategy Deck)</strong> خارج المنصة. وبعد إتمامها، يتم رفع الملف إلى النظام لتمر عبر دورة اعتماد مزدوجة وصارمة قبل إتاحة بناء الخطط التشغيلية.
    </p>

    <div class="flow-steps">
      <div class="step-item">
        <div class="step-num">A</div>
        <div class="step-content">
          <h5>رفع ملف الاستراتيجية (Upload Strategy File)</h5>
          <p>يقوم الموظف برفع ملف الاستراتيجية (PDF أو Deck) وربطه بالبراند، مع تحديد رقم الإصدار، فتتحول حالة الاستراتيجية إلى <strong>Draft / Uploaded</strong>.</p>
        </div>
      </div>
      <div class="step-item">
        <div class="step-num">B</div>
        <div class="step-content">
          <h5>البوابة الأولى: المراجعة الداخلية (Internal Review - Account Manager)</h5>
          <p>تصل الاستراتيجية لمدير الحسابات، ولديه خياران: <strong>Approve</strong> لتمريرها للعميل، أو <strong>Request Changes</strong> مع إلزامية كتابة ملاحظات التعديل المطلوبة لفريق العمل الداخلي.</p>
        </div>
      </div>
      <div class="step-item">
        <div class="step-num">C</div>
        <div class="step-content">
          <h5>البوابة الثانية: مراجعة العميل (Client Portal Review)</h5>
          <p>لا تظهر الاستراتيجية للعميل نهائياً إلا بعد موافقة مدير الحسابات. يستطيع العميل معاينتها وتنزيلها ثم الضغط على <strong>Approve</strong> أو <strong>Request Changes</strong> مع تدوين أسباب التعديل المطلوبة.</p>
        </div>
      </div>
      <div class="step-item">
        <div class="step-num">D</div>
        <div class="step-content">
          <h5>الاعتماد النهائي وفتح الخطط (Final Approval & Plan Unlock)</h5>
          <p>عند موافقة العميل واعتمادها النهائي، تتحول حالة الاستراتيجية إلى <strong>Approved</strong>. هذه الحالة هي الشرط الوحيد لفك الحظر (Unlock) عن خطط المحتوى والسماح للـ Creator بالبدء بإنشاء الخطط والحملات.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- 6-SCREEN CONTENT MANAGEMENT ARCHITECTURE -->
  <div class="section">
    <div class="section-title">
      <span>6. الهيكل السداسي لإدارة المحتوى (6-Screen Content Architecture)</span>
      <span class="badge-pill">Core Engine</span>
    </div>
    <p>
      تم تنفيذ معمارية إدارة المحتوى وفق هندسة هرمية دقيقة مؤلفة من 6 شاشات متسلسلة مدعومة بشريط تنقل تفاعلي (Interactive Breadcrumb Bar: <code>Brands &gt; Brand &gt; Platform &gt; Plan &gt; Campaign &gt; Item</code>):
    </p>

    <div class="screen-card">
      <div class="screen-header">
        <span class="screen-title">الشاشة 1: قائمة البراندات (Brands Portfolio Overview)</span>
        <span class="screen-badge">Screen 1</span>
      </div>
      <p>
        تعرض جميع العلامات التجارية المفعلة في الوكالة مع ملخص لحالة الاستراتيجية، وعدد منصات التواصل المتصلة، ومدير الحساب المسؤول. تتيح البحث الفوري والتصفية حسب الحالة.
      </p>
    </div>

    <div class="screen-card">
      <div class="screen-header">
        <span class="screen-title">الشاشة 2: حسابات المنصات التابعة للبراند (Brand Platform Accounts)</span>
        <span class="screen-badge">Screen 2</span>
      </div>
      <p>
        تعرض قنوات النشر المفعلة للبراند المختار (Instagram, Facebook, LinkedIn, X, TikTok, YouTube) مع إحصائيات الخطط النشطة وحالة التوصيل لكل منصة.
      </p>
    </div>

    <div class="screen-card">
      <div class="screen-header">
        <span class="screen-title">الشاشة 3: خطط المحتوى الشهرية (Content Plans Grid)</span>
        <span class="screen-badge">Screen 3</span>
      </div>
      <p>
        <strong>القفل التلقائي (Strategy Dependency):</strong> إذا لم تكن استراتيجية البراند معتمدة (Approved)، تظهر الشاشة في وضع القفل مع بانر تحذيري صريح يوضح أن إنشاء وتعديل الخطط معطل حتى استكمال اعتماد الاستراتيجية.<br>
        <strong>صلاحية Creator فقط:</strong> أزرار إنشاء خطة جديدة وتعديلها وحذفها تظهر حصرياً للـ Creator، مع نافذة تأكيد تحذيرية لحذف أي خطة لحماية البيانات من الفقد غير المقصود.
      </p>
    </div>

    <div class="screen-card">
      <div class="screen-header">
        <span class="screen-title">الشاشة 4: تفاصيل الخطة الشهرية (Monthly Plan Details)</span>
        <span class="screen-badge">Screen 4</span>
      </div>
      <p>
        تنقسم هذه الشاشة إلى قسمين رئيسيين:<br>
        1. <strong>الحملات الإعلانية (Campaigns):</strong> استعراض الحملات التسويقية المدرجة ضمن الشهر.<br>
        2. <strong>المحتوى غير المرتبط بحملات (Unassigned Content Items Pool):</strong> مساحة مخصصة للمنشورات اليومية المنفردة أو المحتوى التفاعلي الحر.
      </p>
    </div>

    <div class="screen-card">
      <div class="screen-header">
        <span class="screen-title">الشاشة 5: تفاصيل الحملة الإعلانية (Campaign Details)</span>
        <span class="screen-badge">Screen 5</span>
      </div>
      <p>
        تستعرض أهداف الحملة المحددة، التواريخ المقررة للبدء والانتهاء، توزيع المنشورات على المنصات المختلفة، وقائمة بعناصر المحتوى التابعة لها مباشرة مع إمكانية إضافة منشور جديد للحملة بواسطة الـ Creator.
      </p>
    </div>

    <div class="screen-card">
      <div class="screen-header">
        <span class="screen-title">الشاشة 6: محرر وتفاصيل عنصر المحتوى (Content Item Editor & Details)</span>
        <span class="screen-badge">Screen 6</span>
      </div>
      <p>
        الشاشة التفصيلية لإنتاج المنشور، وتحتوي على الحقول المتخصصة التالية: عنوان المنشور (Title)، نوع المنشور (Post, Reel, Story, Carousel)، موعد النشر المجدول، نبرة الصوت المعتمدة (Tone of Voice)، النص الترويجي المكتوب (Caption/Copywriting)، الملاحظات الإبداعية لفريق التصميم (Creative Notes)، وربط المنشور بحملة معينة أو تركه حراً.
      </p>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- NOTIFICATIONS & DESIGN TOKENS -->
  <div class="section">
    <div class="section-title">
      <span>7. مركز الإشعارات الفوري (Real-Time Notification Engine)</span>
      <span class="badge-pill">Notifications</span>
    </div>
    <p>
      تم تزويد المنصة بمركز إشعارات تفاعلي مدمج في الشريط العلوي (Topbar) مزود بعداد حي للإشعارات غير المقروءة، وقائمة منسدلة تعرض التنبيهات المحدثة لحظياً بحسب تصنيفاتها:
    </p>

    <div class="card-grid-3">
      <div class="card card-lilac">
        <h4>📋 إسناد المهام (Task Assignments)</h4>
        <p>إشعار الموظف فور إسناد مهمة إنتاج محتوى أو تصميم له مع رابط مباشر لتفاصيل المنشور.</p>
      </div>
      <div class="card card-blue">
        <h4>📑 مراجعة الاستراتيجية (Strategy Reviews)</h4>
        <p>تنبيه مدير الحسابات عند رفع استراتيجية جديدة، وتنبيه العميل عند اكتمال المراجعة الداخلية.</p>
      </div>
      <div class="card card-peach">
        <h4>✅ الاعتمادات والتعديلات (Approvals & Feedback)</h4>
        <p>إشعارات فورية بالاعتماد أو طلبات التعديل مع الملاحظات المدونة من العميل أو الإدارة.</p>
      </div>
    </div>
  </div>

  <div class="section" style="margin-top: 24px;">
    <div class="section-title">
      <span>8. نظام التصميم وتناسق الواجهات (Design System & Color Tokens)</span>
      <span class="badge-pill">UI System</span>
    </div>
    <p>
      تم تطبيق نظام ألوان وأشكال هندسية موحد ومأخوذ حرفياً من تصاميم الـ PDF المرجعية المرفقة من المستخدم:
    </p>

    <table>
      <thead>
        <tr>
          <th>عنصر التصميم (Element)</th>
          <th>كود اللون (Hex Token)</th>
          <th>الاستخدام الوظيفي في الواجهة</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Warm Ivory Background</strong></td>
          <td><code>#F8F7F3</code></td>
          <td>الخلفية العامة للمنصة وكروت القوائم الجانبية الهادئة.</td>
        </tr>
        <tr>
          <td><strong>Solid Primary Black</strong></td>
          <td><code>#111111</code></td>
          <td>الأزرار الرئيسية المصمتة (Primary Buttons)، اللوجو، وعناوين الصفحات.</td>
        </tr>
        <tr>
          <td><strong>Lilac Signature Pastel</strong></td>
          <td><code>#EAE7FC</code></td>
          <td>كارد اختيار التصنيف الرئيسي، الكروت الإحصائية المميزة، وبادجات البريف.</td>
        </tr>
        <tr>
          <td><strong>Baby Blue Signature Pastel</strong></td>
          <td><code>#DBEBFC</code></td>
          <td>كارد الترحيب المزدوج، شاشة نجاح إرسال الاستبيان، وبادجات المنصات.</td>
        </tr>
        <tr>
          <td><strong>Peach Warm Pastel</strong></td>
          <td><code>#FDE2D8</code></td>
          <td>تنبيهات المراجعة، مهام الاهتمام العاجلة، وكروت الملاحظات الإبداعية.</td>
        </tr>
        <tr>
          <td><strong>Sidebar Light Canvas</strong></td>
          <td><code>#FFFFFF / #F8F7F3</code></td>
          <td>الشريط الجانبي الفاتح العصري المستبدل عن التدرج الداكن القديم.</td>
        </tr>
        <tr>
          <td><strong>Active Dot Accent</strong></td>
          <td><code>#6C5CE7</code></td>
          <td>نقطة الحالة الأرجوانية الحية الدالة على الصفحة النشطة الحالية.</td>
        </tr>
        <tr>
          <td><strong>Muted Inactive Dot</strong></td>
          <td><code>#D1D5DB</code></td>
          <td>نقاط الرمادي الهادئة للصفحات غير النشطة في القائمة الجانبية.</td>
        </tr>
      </tbody>
    </table>

    <div class="section-subtitle">شريط المستخدم وأزرار التحكم السفلى (Sidebar User Card)</div>
    <p>
      تم معالجة وضبط كارد المستخدم السفلي في الشريط الجانبي؛ حيث تم إبراز وتنسيق أزرار <strong>الإعدادات (Settings Gear)</strong> و<strong>تسجيل الخروج (Sign Out)</strong> بمقاسات واضحة وتأثيرات تفاعلية ناعمة مع إبراز البريد الإلكتروني والمسمى الوظيفي المعتمد <strong>Employee</strong> بدلاً من المسمى الملغي.
    </p>
  </div>

  <div class="page-break"></div>

  <!-- TECHNICAL SUMMARY & VERIFICATION -->
  <div class="section">
    <div class="section-title">
      <span>9. البنية التقنية وضمانات التسليم (Technical Architecture & Verification)</span>
      <span class="badge-pill">Quality Assurance</span>
    </div>
    <p>
      تم تنفيذ الواجهة الأمامية وفق أحدث معايير هندسة البرمجيات وأطر العمل التفاعلية الخفيفة:
    </p>

    <div class="card-grid">
      <div class="card card-ivory">
        <h4>⚡ بنية التطبيق (Architecture)</h4>
        <p>
          • مبني بالكامل على React 18 وVite لدعم الأداء اللحظي والأحجام الخفيفة.<br>
          • إدارة الحالة المركزية عبر الـ Context API (<code>AuthContext</code>, <code>BrandsContext</code>, <code>Sprint3Context</code>).<br>
          • عزل البيانات والطبقات لضمان عمل الواجهة بسلاسة سواء بوجود الـ API أو في وضع الـ Mock المستقل.
        </p>
      </div>
      <div class="card card-ivory">
        <h4>🛡️ الالتزام بالقيود المحددة (Constraints)</h4>
        <p>
          • <strong>Frontend-Only:</strong> تم حصر كافة التعديلات بدقة داخل مجلد <code>frontend/</code> دون المساس بالـ Backend.<br>
          • <strong>Git Safety:</strong> التزام تام بعدم رفع أي كود على مستودع GitHub حتى صدور توجيه صريح.<br>
          • <strong>Visual Verification:</strong> تم التحقق من كافة الشاشات والمتصفحات بواسطة وكيل الفحص التلقائي والتأكد من وضوح كافة العناصر وتناسقها.
        </p>
      </div>
    </div>

    <div class="section-subtitle">ملخص المسارات والملفات المنجزة</div>
    <table>
      <thead>
        <tr>
          <th>الملف المعدل / المنشأ</th>
          <th>طبيعة التعديل والمحتوى المضاف</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>frontend/src/styles/tokens.css</code></td>
          <td>تحديث لوحة الألوان الأساسية، إضافة ألوان الباستيل المرجعية (#EAE7FC, #DBEBFC, #FDE2D8).</td>
        </tr>
        <tr>
          <td><code>frontend/src/styles/dashboard.css</code></td>
          <td>تحديث الـ Sidebar للنمط الفاتح، تنسيق كارد المستخدم، والأزرار السوداء المصمتة.</td>
        </tr>
        <tr>
          <td><code>frontend/src/styles/sprint3.css</code></td>
          <td>تنسيق الهيكل السداسي، معالجة إظهار أيقونات الإعدادات وتسجيل الخروج في الشريط الجانبي.</td>
        </tr>
        <tr>
          <td><code>frontend/src/components/layout/Sidebar.jsx</code></td>
          <td>إلغاء لوجو الموجة واعتماد لوجو Orvia المربع الأسود [O]، ومؤشرات الـ .nav-dot.</td>
        </tr>
        <tr>
          <td><code>frontend/src/components/layout/Topbar.jsx</code></td>
          <td>إلغاء شريط التبديل السريع بالكامل، وإضافة جرس الإشعارات مع العداد الحي والـ Popover.</td>
        </tr>
        <tr>
          <td><code>frontend/src/pages/ClientPortalPage.jsx</code></td>
          <td>بناء تدفق بوابة العميل بالكامل: التصنيف، الاستبيان (7 أقسام)، الحفظ، والإرسال.</td>
        </tr>
        <tr>
          <td><code>frontend/src/pages/ContentItemsPage.jsx</code></td>
          <td>بناء الهيكل السداسي المتكامل مع شريط الـ Breadcrumbs وقيود صلاحيات الـ Creator.</td>
        </tr>
        <tr>
          <td><code>frontend/src/context/Sprint3Context.jsx</code></td>
          <td>توحيد ومزامنة الأدوار الخمسة مع المصادقة، وإدارة الإشعارات ودورات الاعتماد.</td>
        </tr>
        <tr>
          <td><code>frontend/src/data/sprint3.js</code></td>
          <td>دعم كامل للقواميس والترجمات باللغتين العربية والإنجليزية لجميع الشاشات والتنبيهات.</td>
        </tr>
      </tbody>
    </table>

    <div class="footer-note">
      تم إعداد هذا المستند التوثيقي آلياً بناءً على مواصفات الكود الفعلي المنجز لمنصة ORVIA - Sprint 3 Frontend Architecture.
    </div>
  </div>

</body>
</html>
`;

const htmlFilePath = path.join(__dirname, 'ORVIA_System_Documentation.html');
const pdfOutputPath = path.join(__dirname, 'ORVIA_Sprint3_Full_System_Documentation.pdf');
const desktopPdfPath = path.join('C:\\Users\\hp\\Desktop', 'ORVIA_Sprint3_Full_System_Documentation.pdf');

fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
console.log('HTML documentation written to:', htmlFilePath);

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const fileUrl = 'file:///' + htmlFilePath.replace(/\\\\/g, '/');

const args = [
  '--headless',
  '--disable-gpu',
  '--no-pdf-header-footer',
  '--run-all-compositor-stages-before-draw',
  '--print-to-pdf=' + pdfOutputPath,
  fileUrl
];

console.log('Generating PDF via Edge Headless...');
execFile(edgePath, args, (err, stdout, stderr) => {
  if (err) {
    console.error('Error generating PDF:', err);
    process.exit(1);
  }
  console.log('PDF generated successfully at:', pdfOutputPath);
  
  // Copy to Desktop for direct user convenience
  try {
    fs.copyFileSync(pdfOutputPath, desktopPdfPath);
    console.log('PDF also copied to Desktop:', desktopPdfPath);
  } catch (copyErr) {
    console.warn('Could not copy to Desktop, but main file exists:', copyErr);
  }

  const stats = fs.statSync(pdfOutputPath);
  console.log('Generated PDF file size:', stats.size, 'bytes');
  process.exit(0);
});
