import{r as o,j as e}from"./ui-vendor-C96WIwkg.js";import{h as J,B as a,C as i,f as l,F as K,c as u,d as g,s as W,I as O,e as F,D as P,v as I,w as M,x as U,A as H,X as Y,b as S}from"./index-Bkz6h1fQ.js";import{T as Z,a as ee,b as z,c as L}from"./tabs-CacS76o1.js";import{B as n}from"./badge-DdDRUR73.js";import{T as se}from"./textarea-CDZ7LSXO.js";import{L as R}from"./label-CmhXhWbA.js";import{P as ae}from"./plus-0j2KamQO.js";import{S as c}from"./star-Dq__ZUzY.js";import{T as A}from"./trending-up-Bx2v0sIc.js";import{S as d}from"./square-pen-D-j8Go0T.js";import{M as te}from"./mail-hhykUda4.js";import{C as ne}from"./clipboard-list-DcaKwn5V.js";import{E as D}from"./eye-D29FSyEF.js";import{C as N}from"./copy-DQbqR9uy.js";import{D as v}from"./download-BYvKutrd.js";import{S as ie}from"./save-B9sIv-x9.js";import"./react-vendor-DDxydHEc.js";import"./query-vendor-Dpt6u7bR.js";import"./chart-vendor-8DIN3ZwM.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const le=J("FilePenLine",[["path",{d:"m18 5-2.414-2.414A2 2 0 0 0 14.172 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2",key:"142zxg"}],["path",{d:"M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z",key:"2t3380"}],["path",{d:"M8 18h1",key:"13wk12"}]]);function ke(){const[f,Q]=o.useState(""),[t,_]=o.useState(null),[y,m]=o.useState(!1),[q,E]=o.useState(""),[V,B]=o.useState(""),w=[{id:1,title:"عرض عمل",description:"رسالة عرض عمل رسمية للمرشح",category:"توظيف",usageCount:145,isFavorite:!0,content:`السيد/ة {{candidate_name}} المحترم/ة،

تحية طيبة وبعد،

يسرنا في {{company_name}} أن نقدم لكم عرض عمل لشغل وظيفة {{job_title}} في قسم {{department}}.

تفاصيل العرض:
- المسمى الوظيفي: {{job_title}}
- الراتب الشهري: {{salary}} ريال
- تاريخ المباشرة: {{start_date}}
- موقع العمل: {{location}}

المزايا:
- تأمين طبي شامل
- إجازة سنوية مدفوعة (21 يوم)
- بدل سكن وانتقال

نأمل قبول هذا العرض والرد علينا في أقرب وقت ممكن.

مع أطيب التحيات،
{{sender_name}}
{{sender_title}}
{{company_name}}`},{id:2,title:"رفض مرشح",description:"رسالة رفض مهذبة للمتقدم",category:"توظيف",usageCount:89,isFavorite:!1,content:`السيد/ة {{candidate_name}} المحترم/ة،

تحية طيبة وبعد،

نشكر لكم اهتمامكم بالانضمام إلى {{company_name}} والتقدم لوظيفة {{job_title}}.

بعد مراجعة دقيقة لطلبكم ومقارنته بمتطلبات الوظيفة، نأسف لإبلاغكم بأننا قررنا عدم المضي قدماً في طلبكم في الوقت الحالي.

نقدر الوقت والجهد الذي بذلتموه في عملية التقديم، ونتمنى لكم كل التوفيق في مسيرتكم المهنية.

مع أطيب التحيات،
{{sender_name}}
فريق الموارد البشرية
{{company_name}}`},{id:3,title:"قبول استقالة",description:"رسالة قبول استقالة موظف",category:"إنهاء خدمة",usageCount:67,isFavorite:!0,content:`السيد/ة {{employee_name}} المحترم/ة،

تحية طيبة وبعد،

نشير إلى طلب استقالتكم المقدم بتاريخ {{resignation_date}}، ونفيدكم بقبول الاستقالة اعتباراً من {{last_working_day}}.

نشكر لكم جهودكم وإسهاماتكم خلال فترة عملكم معنا، ونتمنى لكم التوفيق في مسيرتكم المهنية القادمة.

يرجى التنسيق مع قسم الموارد البشرية لإتمام إجراءات تسليم المهام والمستحقات.

مع أطيب التحيات،
{{sender_name}}
{{sender_title}}
{{company_name}}`},{id:4,title:"ترحيب بموظف جديد",description:"رسالة ترحيب للموظف الجديد",category:"توظيف",usageCount:123,isFavorite:!0,content:`السيد/ة {{employee_name}} المحترم/ة،

أهلاً وسهلاً بك في {{company_name}}!

يسعدنا انضمامك إلى فريقنا كـ {{job_title}} في قسم {{department}}.

تفاصيل يوم المباشرة:
- التاريخ: {{start_date}}
- الوقت: {{start_time}}
- المكان: {{location}}
- المسؤول المباشر: {{manager_name}}

يرجى إحضار المستندات التالية:
- صورة من الهوية الوطنية
- الشهادات العلمية
- شهادات الخبرة

نتطلع للعمل معك!

مع أطيب التحيات،
فريق الموارد البشرية
{{company_name}}`},{id:5,title:"تهنئة بالترقية",description:"رسالة تهنئة للموظف بالترقية",category:"داخلي",usageCount:54,isFavorite:!1,content:`السيد/ة {{employee_name}} المحترم/ة،

تحية طيبة وبعد،

يسرنا أن نهنئك بترقيتك إلى منصب {{new_position}} اعتباراً من {{effective_date}}.

هذه الترقية تأتي تقديراً لجهودك المتميزة وإنجازاتك خلال فترة عملك معنا.

التفاصيل الجديدة:
- المسمى الوظيفي: {{new_position}}
- القسم: {{new_department}}
- الراتب الجديد: {{new_salary}} ريال
- المسؤول المباشر: {{new_manager}}

نتمنى لك المزيد من النجاح والتميز!

مع أطيب التحيات،
{{sender_name}}
{{sender_title}}
{{company_name}}`}],C=[{id:6,title:"عقد عمل دائم",description:"عقد عمل دائم وفق نظام العمل السعودي",category:"عقود",usageCount:234,isFavorite:!0,content:`عقد عمل

بين كل من:
الطرف الأول: {{company_name}} (صاحب العمل)
السجل التجاري: {{commercial_register}}
العنوان: {{company_address}}

الطرف الثاني: {{employee_name}} (الموظف)
رقم الهوية: {{national_id}}
الجنسية: {{nationality}}
العنوان: {{employee_address}}

تم الاتفاق على ما يلي:

المادة الأولى: طبيعة العمل
يعمل الطرف الثاني لدى الطرف الأول بوظيفة {{job_title}} في قسم {{department}}.

المادة الثانية: مدة العقد
هذا عقد عمل دائم يبدأ من تاريخ {{start_date}}.

المادة الثالثة: الراتب والمزايا
- الراتب الأساسي: {{basic_salary}} ريال شهرياً
- بدل السكن: {{housing_allowance}} ريال
- بدل المواصلات: {{transportation_allowance}} ريال
- الراتب الإجمالي: {{total_salary}} ريال

المادة الرابعة: ساعات العمل
يعمل الموظف {{working_hours}} ساعة أسبوعياً، موزعة على {{working_days}} أيام.

المادة الخامسة: الإجازات
- إجازة سنوية: {{annual_leave}} يوم مدفوع الأجر
- إجازة مرضية: وفقاً لنظام العمل السعودي

المادة السادسة: إنهاء العقد
يحق لأي من الطرفين إنهاء هذا العقد بإشعار كتابي مدته {{notice_period}} يوم.

حرر هذا العقد من نسختين، لكل طرف نسخة للعمل بموجبها.

التوقيع:
الطرف الأول: _____________  التاريخ: _____________
الطرف الثاني: _____________  التاريخ: _____________`},{id:7,title:"عقد تدريب",description:"عقد تدريب للخريجين والمتدربين",category:"عقود",usageCount:156,isFavorite:!1,content:`عقد تدريب

بين كل من:
الطرف الأول: {{company_name}} (الجهة المدربة)
الطرف الثاني: {{trainee_name}} (المتدرب)

تم الاتفاق على ما يلي:

المادة الأولى: مجال التدريب
يتدرب الطرف الثاني في مجال {{training_field}} لدى الطرف الأول.

المادة الثانية: مدة التدريب
تبدأ فترة التدريب من {{start_date}} وتنتهي في {{end_date}}.

المادة الثالثة: المكافأة
يحصل المتدرب على مكافأة شهرية قدرها {{stipend}} ريال.

المادة الرابعة: ساعات التدريب
{{training_hours}} ساعة أسبوعياً.

المادة الخامسة: الالتزامات
يلتزم المتدرب بالحضور المنتظم والالتزام بسياسات الشركة.

التوقيع:
الطرف الأول: _____________  التاريخ: _____________
الطرف الثاني: _____________  التاريخ: _____________`},{id:8,title:"عقد عمل مؤقت",description:"عقد عمل لفترة محددة",category:"عقود",usageCount:178,isFavorite:!0,content:`عقد عمل مؤقت

بين كل من:
الطرف الأول: {{company_name}} (صاحب العمل)
الطرف الثاني: {{employee_name}} (الموظف)

تم الاتفاق على ما يلي:

المادة الأولى: طبيعة العمل
يعمل الطرف الثاني بوظيفة {{job_title}} لمدة محددة.

المادة الثانية: مدة العقد
يبدأ العقد من {{start_date}} وينتهي في {{end_date}}.

المادة الثالثة: الراتب
الراتب الشهري: {{salary}} ريال.

المادة الرابعة: إنهاء العقد
ينتهي العقد تلقائياً بانتهاء المدة المحددة.

التوقيع:
الطرف الأول: _____________  التاريخ: _____________
الطرف الثاني: _____________  التاريخ: _____________`}],b=[{id:9,title:"طلب إجازة",description:"نموذج طلب إجازة للموظفين",category:"نماذج",usageCount:456,isFavorite:!0,content:`نموذج طلب إجازة

بيانات الموظف:
الاسم: {{employee_name}}
الرقم الوظيفي: {{employee_id}}
القسم: {{department}}
المسمى الوظيفي: {{job_title}}

تفاصيل الإجازة:
نوع الإجازة: {{leave_type}}
من تاريخ: {{start_date}}
إلى تاريخ: {{end_date}}
عدد الأيام: {{days_count}}

السبب:
{{reason}}

عنوان الاتصال أثناء الإجازة:
{{contact_address}}
رقم الجوال: {{phone_number}}

توقيع الموظف: _____________  التاريخ: _____________

الموافقات:
المدير المباشر: _____________  التاريخ: _____________
الموارد البشرية: _____________  التاريخ: _____________`},{id:10,title:"تقييم أداء",description:"نموذج تقييم أداء الموظف",category:"نماذج",usageCount:234,isFavorite:!0,content:`نموذج تقييم الأداء

بيانات الموظف:
الاسم: {{employee_name}}
الرقم الوظيفي: {{employee_id}}
القسم: {{department}}
المسمى الوظيفي: {{job_title}}
فترة التقييم: من {{period_start}} إلى {{period_end}}

معايير التقييم:
(1 = ضعيف، 2 = مقبول، 3 = جيد، 4 = جيد جداً، 5 = ممتاز)

1. جودة العمل: [ ]
2. الإنتاجية: [ ]
3. الالتزام بالمواعيد: [ ]
4. التعاون مع الفريق: [ ]
5. المبادرة والإبداع: [ ]
6. مهارات التواصل: [ ]
7. حل المشكلات: [ ]
8. الالتزام بالسياسات: [ ]

نقاط القوة:
{{strengths}}

نقاط التحسين:
{{improvement_areas}}

التوصيات:
{{recommendations}}

توقيع المقيّم: _____________  التاريخ: _____________
توقيع الموظف: _____________  التاريخ: _____________`},{id:11,title:"طلب شهادة",description:"نموذج طلب شهادة راتب أو خبرة",category:"نماذج",usageCount:345,isFavorite:!1,content:`نموذج طلب شهادة

بيانات الموظف:
الاسم: {{employee_name}}
الرقم الوظيفي: {{employee_id}}
القسم: {{department}}
المسمى الوظيفي: {{job_title}}

نوع الشهادة المطلوبة:
[ ] شهادة راتب
[ ] شهادة خبرة
[ ] شهادة تعريف بالراتب
[ ] شهادة للسفارة

الغرض من الشهادة:
{{purpose}}

الجهة المطلوب تقديم الشهادة لها:
{{recipient}}

ملاحظات إضافية:
{{notes}}

توقيع الموظف: _____________  التاريخ: _____________

الموافقة:
الموارد البشرية: _____________  التاريخ: _____________`}],x=[...w,...C,...b],k=s=>s.filter(r=>r.title.toLowerCase().includes(f.toLowerCase())||r.description.toLowerCase().includes(f.toLowerCase())),h=s=>{navigator.clipboard.writeText(s),S.success("تم النسخ إلى الحافظة")},j=s=>{const r=new Blob([s.content],{type:"text/plain"}),G=URL.createObjectURL(r),T=document.createElement("a");T.href=G,T.download=`${s.title}.txt`,T.click(),S.success("تم تحميل القالب")},p=s=>{_(s),B(s.title),E(s.content),m(!0)},X=()=>{S.success("تم حفظ القالب المخصص"),m(!1)},$=[...x].sort((s,r)=>r.usageCount-s.usageCount).slice(0,3);return e.jsxs("div",{className:"p-6 space-y-6",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold",children:"مكتبة القوالب"}),e.jsx("p",{className:"text-muted-foreground",children:"قوالب جاهزة للرسائل والعقود والنماذج"})]}),e.jsxs(a,{className:"bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90",children:[e.jsx(ae,{className:"h-4 w-4 ml-2"}),"قالب جديد"]})]}),e.jsxs("div",{className:"grid md:grid-cols-4 gap-4",children:[e.jsx(i,{children:e.jsx(l,{className:"pt-6",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"إجمالي القوالب"}),e.jsx("p",{className:"text-2xl font-bold",children:x.length})]}),e.jsx(K,{className:"h-8 w-8 text-purple-600"})]})})}),e.jsx(i,{children:e.jsx(l,{className:"pt-6",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"القوالب المفضلة"}),e.jsx("p",{className:"text-2xl font-bold",children:x.filter(s=>s.isFavorite).length})]}),e.jsx(c,{className:"h-8 w-8 text-yellow-600"})]})})}),e.jsx(i,{children:e.jsx(l,{className:"pt-6",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"الاستخدامات"}),e.jsx("p",{className:"text-2xl font-bold",children:x.reduce((s,r)=>s+r.usageCount,0)})]}),e.jsx(A,{className:"h-8 w-8 text-green-600"})]})})}),e.jsx(i,{children:e.jsx(l,{className:"pt-6",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"قوالب مخصصة"}),e.jsx("p",{className:"text-2xl font-bold",children:"3"})]}),e.jsx(d,{className:"h-8 w-8 text-blue-600"})]})})})]}),e.jsxs(i,{children:[e.jsx(u,{children:e.jsxs(g,{className:"flex items-center gap-2",children:[e.jsx(A,{className:"h-5 w-5 text-green-600"}),"القوالب الأكثر استخداماً"]})}),e.jsx(l,{children:e.jsx("div",{className:"grid md:grid-cols-3 gap-4",children:$.map(s=>e.jsx(i,{className:"hover:shadow-lg transition-shadow",children:e.jsxs(l,{className:"pt-6",children:[e.jsxs("div",{className:"flex items-start justify-between mb-3",children:[e.jsxs("div",{className:"flex-1",children:[e.jsx("h3",{className:"font-semibold mb-1",children:s.title}),e.jsx("p",{className:"text-sm text-muted-foreground",children:s.description})]}),s.isFavorite&&e.jsx(c,{className:"h-4 w-4 text-yellow-500 fill-yellow-500"})]}),e.jsxs("div",{className:"flex items-center gap-2 text-sm text-muted-foreground",children:[e.jsx(n,{variant:"secondary",children:s.category}),e.jsx("span",{children:"•"}),e.jsxs("span",{children:[s.usageCount," استخدام"]})]})]})},s.id))})})]}),e.jsxs("div",{className:"relative",children:[e.jsx(W,{className:"absolute right-3 top-3 h-4 w-4 text-muted-foreground"}),e.jsx(O,{placeholder:"ابحث في القوالب...",value:f,onChange:s=>Q(s.target.value),className:"pr-10"})]}),e.jsxs(Z,{defaultValue:"emails",className:"space-y-4",children:[e.jsxs(ee,{className:"grid w-full grid-cols-3",children:[e.jsxs(z,{value:"emails",className:"flex items-center gap-2",children:[e.jsx(te,{className:"h-4 w-4"}),"الرسائل (",w.length,")"]}),e.jsxs(z,{value:"contracts",className:"flex items-center gap-2",children:[e.jsx(le,{className:"h-4 w-4"}),"العقود (",C.length,")"]}),e.jsxs(z,{value:"forms",className:"flex items-center gap-2",children:[e.jsx(ne,{className:"h-4 w-4"}),"النماذج (",b.length,")"]})]}),e.jsx(L,{value:"emails",className:"space-y-4",children:e.jsx("div",{className:"grid md:grid-cols-2 gap-4",children:k(w).map(s=>e.jsxs(i,{className:"hover:shadow-lg transition-shadow",children:[e.jsx(u,{children:e.jsx("div",{className:"flex items-start justify-between",children:e.jsxs("div",{className:"flex-1",children:[e.jsxs(g,{className:"flex items-center gap-2",children:[s.title,s.isFavorite&&e.jsx(c,{className:"h-4 w-4 text-yellow-500 fill-yellow-500"})]}),e.jsx(F,{children:s.description})]})})}),e.jsxs(l,{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{variant:"secondary",children:s.category}),e.jsxs("span",{className:"text-sm text-muted-foreground",children:[s.usageCount," استخدام"]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(a,{variant:"outline",size:"sm",onClick:()=>{_(s)},children:[e.jsx(D,{className:"h-4 w-4 ml-2"}),"معاينة"]}),e.jsxs(a,{variant:"outline",size:"sm",onClick:()=>h(s.content),children:[e.jsx(N,{className:"h-4 w-4 ml-2"}),"نسخ"]}),e.jsxs(a,{variant:"outline",size:"sm",onClick:()=>p(s),children:[e.jsx(d,{className:"h-4 w-4 ml-2"}),"تعديل"]}),e.jsxs(a,{variant:"outline",size:"sm",onClick:()=>j(s),children:[e.jsx(v,{className:"h-4 w-4 ml-2"}),"تحميل"]})]})]})]},s.id))})}),e.jsx(L,{value:"contracts",className:"space-y-4",children:e.jsx("div",{className:"grid md:grid-cols-2 gap-4",children:k(C).map(s=>e.jsxs(i,{className:"hover:shadow-lg transition-shadow",children:[e.jsx(u,{children:e.jsx("div",{className:"flex items-start justify-between",children:e.jsxs("div",{className:"flex-1",children:[e.jsxs(g,{className:"flex items-center gap-2",children:[s.title,s.isFavorite&&e.jsx(c,{className:"h-4 w-4 text-yellow-500 fill-yellow-500"})]}),e.jsx(F,{children:s.description})]})})}),e.jsxs(l,{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{variant:"secondary",children:s.category}),e.jsxs("span",{className:"text-sm text-muted-foreground",children:[s.usageCount," استخدام"]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(a,{variant:"outline",size:"sm",onClick:()=>{_(s)},children:[e.jsx(D,{className:"h-4 w-4 ml-2"}),"معاينة"]}),e.jsxs(a,{variant:"outline",size:"sm",onClick:()=>h(s.content),children:[e.jsx(N,{className:"h-4 w-4 ml-2"}),"نسخ"]}),e.jsxs(a,{variant:"outline",size:"sm",onClick:()=>p(s),children:[e.jsx(d,{className:"h-4 w-4 ml-2"}),"تعديل"]}),e.jsxs(a,{variant:"outline",size:"sm",onClick:()=>j(s),children:[e.jsx(v,{className:"h-4 w-4 ml-2"}),"تحميل"]})]})]})]},s.id))})}),e.jsx(L,{value:"forms",className:"space-y-4",children:e.jsx("div",{className:"grid md:grid-cols-2 gap-4",children:k(b).map(s=>e.jsxs(i,{className:"hover:shadow-lg transition-shadow",children:[e.jsx(u,{children:e.jsx("div",{className:"flex items-start justify-between",children:e.jsxs("div",{className:"flex-1",children:[e.jsxs(g,{className:"flex items-center gap-2",children:[s.title,s.isFavorite&&e.jsx(c,{className:"h-4 w-4 text-yellow-500 fill-yellow-500"})]}),e.jsx(F,{children:s.description})]})})}),e.jsxs(l,{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{variant:"secondary",children:s.category}),e.jsxs("span",{className:"text-sm text-muted-foreground",children:[s.usageCount," استخدام"]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(a,{variant:"outline",size:"sm",onClick:()=>{_(s)},children:[e.jsx(D,{className:"h-4 w-4 ml-2"}),"معاينة"]}),e.jsxs(a,{variant:"outline",size:"sm",onClick:()=>h(s.content),children:[e.jsx(N,{className:"h-4 w-4 ml-2"}),"نسخ"]}),e.jsxs(a,{variant:"outline",size:"sm",onClick:()=>p(s),children:[e.jsx(d,{className:"h-4 w-4 ml-2"}),"تعديل"]}),e.jsxs(a,{variant:"outline",size:"sm",onClick:()=>j(s),children:[e.jsx(v,{className:"h-4 w-4 ml-2"}),"تحميل"]})]})]})]},s.id))})})]}),t&&!y&&e.jsx(P,{open:!!t,onOpenChange:()=>_(null),children:e.jsxs(I,{className:"max-w-3xl max-h-[80vh] overflow-y-auto",children:[e.jsxs(M,{children:[e.jsxs(U,{className:"flex items-center gap-2",children:[t.title,t.isFavorite&&e.jsx(c,{className:"h-5 w-5 text-yellow-500 fill-yellow-500"})]}),e.jsx(H,{children:t.description})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{children:t.category}),e.jsxs("span",{className:"text-sm text-muted-foreground",children:[t.usageCount," استخدام"]})]}),e.jsx("div",{className:"p-4 bg-muted rounded-lg",children:e.jsx("pre",{className:"whitespace-pre-wrap font-sans text-sm",children:t.content})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(a,{onClick:()=>h(t.content),children:[e.jsx(N,{className:"h-4 w-4 ml-2"}),"نسخ"]}),e.jsxs(a,{variant:"outline",onClick:()=>p(t),children:[e.jsx(d,{className:"h-4 w-4 ml-2"}),"تعديل"]}),e.jsxs(a,{variant:"outline",onClick:()=>j(t),children:[e.jsx(v,{className:"h-4 w-4 ml-2"}),"تحميل"]})]})]})]})}),y&&e.jsx(P,{open:y,onOpenChange:m,children:e.jsxs(I,{className:"max-w-4xl max-h-[90vh] overflow-y-auto",children:[e.jsxs(M,{children:[e.jsx(U,{children:"تعديل القالب"}),e.jsx(H,{children:"قم بتعديل القالب وحفظه كقالب مخصص"})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx(R,{children:"عنوان القالب"}),e.jsx(O,{value:V,onChange:s=>B(s.target.value),placeholder:"عنوان القالب"})]}),e.jsxs("div",{children:[e.jsx(R,{children:"محتوى القالب"}),e.jsx(se,{value:q,onChange:s=>E(s.target.value),placeholder:"محتوى القالب",className:"min-h-[400px] font-mono text-sm"})]}),e.jsxs("div",{className:"p-4 bg-blue-50 dark:bg-blue-950 rounded-lg",children:[e.jsx("p",{className:"text-sm text-blue-700 dark:text-blue-300 mb-2",children:"💡 استخدم المتغيرات الديناميكية:"}),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsx(n,{variant:"secondary",children:"{{name}}"}),e.jsx(n,{variant:"secondary",children:"{{date}}"}),e.jsx(n,{variant:"secondary",children:"{{company_name}}"}),e.jsx(n,{variant:"secondary",children:"{{employee_name}}"}),e.jsx(n,{variant:"secondary",children:"{{salary}}"})]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(a,{onClick:X,className:"flex-1",children:[e.jsx(ie,{className:"h-4 w-4 ml-2"}),"حفظ كقالب مخصص"]}),e.jsxs(a,{variant:"outline",onClick:()=>m(!1),children:[e.jsx(Y,{className:"h-4 w-4 ml-2"}),"إلغاء"]})]})]})]})})]})}export{ke as default};
