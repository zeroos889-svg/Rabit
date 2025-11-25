# إعداد قاعدة البيانات - Database Setup

## 🗄️ PostgreSQL Setup

### 1. تثبيت PostgreSQL

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
قم بتنزيل وتثبيت من [الموقع الرسمي](https://www.postgresql.org/download/windows/)

### 2. إنشاء قاعدة البيانات

```bash
# الدخول إلى PostgreSQL
psql postgres

# إنشاء المستخدم
CREATE USER rabit_user WITH PASSWORD 'your_secure_password';

# إنشاء قاعدة البيانات
CREATE DATABASE rabit_db OWNER rabit_user;

# منح الصلاحيات
GRANT ALL PRIVILEGES ON DATABASE rabit_db TO rabit_user;

# الخروج
\q
```

### 3. تحديث ملف البيئة

قم بتحديث `.env`:
```bash
DATABASE_URL=postgresql://rabit_user:your_secure_password@localhost:5432/rabit_db
```

### 4. تطبيق Migrations

```bash
# توليد migrations من schema
npm run db:generate

# تطبيق التغييرات على قاعدة البيانات
npm run db:push
```

### 5. التحقق من الاتصال

```bash
# فتح Drizzle Studio لإدارة البيانات
npm run db:studio
```

سيفتح في المتصفح على: https://local.drizzle.studio

---

## 📊 إدارة قاعدة البيانات

### Commands المتاحة:

```bash
# توليد migration files جديدة
npm run db:generate

# تطبيق التغييرات مباشرة (development)
npm run db:push

# فتح Database Studio
npm run db:studio
```

### Database Studio:
- عرض وتعديل البيانات
- تنفيذ SQL queries
- إدارة الجداول والعلاقات

---

## 🔒 Production Setup

### Docker Compose (موصى به):

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: rabit_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: rabit_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U rabit_user"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Managed Services (Alternative):

#### Vercel Postgres:
```bash
# ربط المشروع
vercel link

# إضافة Postgres
vercel postgres create
```

#### Supabase:
- أنشئ مشروع على [supabase.com](https://supabase.com)
- انسخ Connection String
- حدث `DATABASE_URL` في `.env`

#### Railway:
- أنشئ PostgreSQL database على [railway.app](https://railway.app)
- انسخ DATABASE_URL
- حدث البيئة

---

## 🛠️ Troubleshooting

### خطأ الاتصال:
```bash
# تحقق من تشغيل PostgreSQL
brew services list  # macOS
sudo systemctl status postgresql  # Linux

# تحقق من المنفذ
lsof -i :5432
```

### إعادة تعيين قاعدة البيانات:
```bash
# احذف وأعد إنشاء
psql postgres -c "DROP DATABASE rabit_db;"
psql postgres -c "CREATE DATABASE rabit_db OWNER rabit_user;"
npm run db:push
```

### مشاكل الصلاحيات:
```sql
-- أعط جميع الصلاحيات
GRANT ALL PRIVILEGES ON DATABASE rabit_db TO rabit_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rabit_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rabit_user;
```

---

## 📝 Schema Overview

الملف الرئيسي: `drizzle/schema.ts`

### الجداول الرئيسية:
- **users** - المستخدمون
- **employees** - الموظفون
- **templates** - قوالب المستندات
- **generated_documents** - المستندات المولدة
- **eosb_calculations** - حسابات نهاية الخدمة
- **letters** - الخطابات

راجع `drizzle/schema.ts` للتفاصيل الكاملة.
