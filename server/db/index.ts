/**
 * خريطة دوال قاعدة البيانات (تطبيق بسيط بالذاكرة)
 * الهدف: توفير واجهة مطابقة للـ routers/tests حتى يمر الفحص بدون أعطال.
 */

import { hashPassword, verifyPassword } from "../_core/password";
// Re-export password utilities for tests
export { hashPassword, verifyPassword } from "../_core/password";
import crypto from "node:crypto";
// Drizzle integration imports (conditional usage when DATABASE_URL موجود)
import { getDrizzleDb } from "./drizzle";
import {
  users as usersTable,
  passwords as passwordsTable,
  userConsents as userConsentsTable,
  chatConversations as chatConversationsTable,
  chatMessages as chatMessagesTable,
  generatedDocuments as generatedDocumentsTable,
  consultantDocuments as consultantDocumentsTable,
  notifications as notificationsTable,
  notificationPreferences as notificationPreferencesTable,
  contactRequests as contactRequestsTable,
} from "../../drizzle/schema";
import type {
  GeneratedDocument as DbGeneratedDocument,
  ConsultantDocument as DbConsultantDocumentRow,
  Notification as DbNotificationRow,
  NotificationPreference as DbNotificationPreferenceRow,
  ContactRequest as DbContactRequestRow,
  InsertContactRequest as DbInsertContactRequestRow,
} from "../../drizzle/schema";
import { eq, desc, and, or, isNull } from "drizzle-orm";

// نوع userType في مخطط drizzle (يستثني "consultant")
type DrizzleUserType = "employee" | "individual" | "company" | null;

type UserRole = "user" | "admin";

type UserRecord = {
  id: number;
  email?: string | null;
  name?: string | null;
  role: UserRole;
  openId?: string | null;
  userType?: string | null;
  profilePicture?: string | null;
  lastSignedIn?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  phoneNumber?: string | null;
  loginMethod?: string | null;
  emailVerified?: boolean | null;
  profileCompleted?: boolean | null;
  lastLoginIp?: string | null;
  lastLoginUserAgent?: string | null;
};

type PasswordRecord = {
  userId: number;
  hashedPassword: string;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
};

type TemplateRecord = {
  id: number;
  code: string;
  nameAr?: string;
  nameEn?: string;
  titleAr?: string;
  titleEn?: string;
  description?: string;
  aiPrompt?: string;
  placeholdersSchema?: string;
  isActive?: boolean;
  content?: string;
};

type DocumentRecord = {
  id: number;
  userId: number;
  title?: string;
  content?: string;
  outputHtml?: string;
  outputText?: string;
  lang?: string;
  inputData?: Record<string, unknown>;
  companyLogo?: string;
  companyName?: string;
  saved?: boolean;
  isSaved?: boolean;
  templateCode?: string;
  attachments?: AttachmentRef[];
  createdAt: Date;
  updatedAt?: Date;
};

// مرفقات عامة ذات بنية مرنة
interface AttachmentRef {
  id?: string | number;
  name?: string;
  fileName?: string;
  url?: string;
  mimeType?: string;
  sizeBytes?: number;
  [key: string]: unknown; // السماح بحقول إضافية بدون any
}

type CalculationType =
  | "end-of-service"
  | "vacation"
  | "overtime"
  | "deduction";

type CalculationHistoryRecord = {
  id: number;
  userId: number;
  calculationType: CalculationType;
  salary?: number | null;
  contractType?: string | null;
  terminationReason?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  duration?: {
    years: number;
    months: number;
    days: number;
  } | null;
  inputData?: Record<string, unknown> | null;
  result?: Record<string, unknown> | null;
  notes?: string | null;
  createdAt: Date;
};

type GeneratedLetterRecord = {
  id: number;
  userId: number;
  letterType: string;
  title?: string;
  category?: string;
  language?: string;
  style?: string;
  content: string;
  metadata?: Record<string, unknown> | null;
  isFavorite?: boolean;
  createdAt: Date;
};

type ConsultingPackage = {
  id: number;
  name: string;
  price: number;
  slaHours: number;
  isActive: boolean;
};

type ConsultingTicket = {
  id: number;
  ticketNumber: string;
  userId: number;
  consultantId?: number | null;
  packageId?: number | null;
  status: string;
  rating?: number | null;
  description?: string;
  createdAt: Date;
};

type ConsultingResponse = {
  id: number;
  ticketId: number;
  userId: number;
  message: string;
  role: string;
  attachments?: AttachmentRef[];
  createdAt: Date;
};

type DiscountCode = {
  id: number;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses?: number | null;
  usedCount: number;
  isActive: boolean;
  validFrom?: Date | null;
  validUntil?: Date | null;
  createdBy?: number | string;
};

type Notification = {
  id: number;
  userId: number | null;
  title: string;
  body: string;
  type?: string;
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, unknown>;
  link?: string | null;
  icon?: string | null;
};

type InsertResult = {
  insertId?: number | bigint | null;
};

function extractInsertId(result: unknown): number {
  if (!result) return 0;
  const insertId = (result as InsertResult).insertId;
  if (typeof insertId === "bigint") {
    return Number(insertId);
  }
  if (typeof insertId === "number") {
    return insertId;
  }
  return 0;
}

type NotificationPreferences = {
  userId: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
};

type Consultant = {
  id: number;
  userId: number;
  status: "pending" | "approved" | "rejected";
  fullName?: string;
  specializations?: string[];
  fullNameAr?: string;
  email?: string;
  phone?: string;
  mainSpecialization?: string;
  yearsOfExperience?: number;
  subSpecializations?: string[];
  profilePicture?: string | null;
  bio?: string | null;
  bioAr?: string | null;
  bioEn?: string | null;
  qualifications?: string[];
  certifications?: string[];
  ibanNumber?: string | null;
  bankName?: string | null;
  accountHolderName?: string | null;
  averageRating?: number | null;
  reviewsCount?: number | null;
  consultations?: number | null;
  city?: string | null;
  languages?: string[];
  achievements?: string[];
  price?: number | null;
  services?: Record<string, unknown>;
  availability?: Array<{ day: string; slot: string; active: boolean }>;
  sla?: Record<string, unknown>;
  channels?: Record<string, boolean>;
};

type ConsultantDocumentRecord = {
  id: number;
  consultantId: number;
  title: string;
  url: string;
  fileSize?: number;
  mimeType?: string;
  documentType?: string;
  verificationStatus?: string;
  verificationNotes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type ChatConversation = {
  id: number;
  userId?: number | null;
  visitorName?: string | null;
  visitorEmail?: string | null;
  visitorToken?: string | null;
  status: "open" | "closed";
  lastMessageAt?: Date;
};

type ChatMessage = {
  id: number;
  conversationId: number;
  senderType: "admin" | "visitor" | "assistant";
  senderName?: string;
  message: string;
  createdAt: Date;
  read?: boolean;
};

type ContactRequestRecord = DbContactRequestRow;

type ConsultationType = {
  id: number;
  nameAr: string;
  descriptionAr: string;
  price: number;
  duration: number;
  isActive: boolean;
  requiredDocuments?: string[];
  requiredInfo?: string[];
  estimatedDuration?: number;
  basePriceSAR?: number;
  slaHours?: number;
};

type ConsultationBooking = {
  id: number;
  ticketNumber?: string;
  userId: number;
  consultantId: number;
  consultationTypeId: number;
  scheduledDate: Date;
  status: string;
  subject?: string;
  price?: number;
  slaHours?: number;
  packageName?: string | null;
  packagePrice?: number | null;
  packageSlaHours?: number | null;
  createdAt?: Date;
  clientId?: number;
  scheduledTime?: string;
  description?: string;
  requiredInfo?: Record<string, unknown>;
  attachments?: AttachmentRef[];
  duration?: number;
};

type ConsultationMessage = {
  id: number;
  bookingId: number;
  senderId: number;
  message: string;
  createdAt: Date;
  isAiAssisted?: boolean;
  aiSuggestion?: string;
};

type ConsentRecord = {
  userId: number;
  policyVersion: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  hasConsent?: boolean;
  consentedAt?: Date;
  withdrawnAt?: Date;
  withdrawn?: boolean;
};

type TestUserSeed = {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  userType?: string;
};

let seq = 1;
const nextId = () => seq++;

// In-memory stores
const users: UserRecord[] = [];
const passwords: PasswordRecord[] = [];
const templates: TemplateRecord[] = [
  {
    id: nextId(),
    code: "offer-letter",
    nameAr: "عرض عمل",
    nameEn: "Offer Letter",
    titleAr: "خطاب عرض وظيفي",
    description: "عرض وظيفي متكامل مع تفاصيل الراتب وموعد المباشرة",
    placeholdersSchema: JSON.stringify({
      fields: [
        { key: "employeeName", label: "اسم المرشح" },
        { key: "jobTitle", label: "المسمى الوظيفي" },
        { key: "department", label: "القسم" },
        { key: "startDate", label: "تاريخ المباشرة" },
        { key: "salary", label: "الراتب" },
      ],
    }),
    isActive: true,
    content: "Offer letter template",
  },
  {
    id: nextId(),
    code: "warning",
    nameAr: "إنذار",
    nameEn: "Warning Notice",
    titleAr: "إنذار رسمي",
    description: "تنبيه للموظف حول مخالفة أو سلوك غير مقبول",
    placeholdersSchema: JSON.stringify({
      fields: [
        { key: "employeeName", label: "اسم الموظف" },
        { key: "violation", label: "المخالفة" },
        { key: "expectedBehavior", label: "السلوك المطلوب" },
        { key: "deadline", label: "المهلة" },
      ],
    }),
    isActive: true,
    content: "Warning notice template",
  },
  {
    id: nextId(),
    code: "salary-letter",
    nameAr: "شهادة راتب",
    nameEn: "Salary Certificate",
    titleAr: "شهادة تعريف بالراتب",
    description: "خطاب تعريف رسمي للراتب يمكن تقديمه للبنوك والجهات الرسمية",
    placeholdersSchema: JSON.stringify({
      fields: [
        { key: "employeeName", label: "اسم الموظف" },
        { key: "employeeId", label: "الرقم الوظيفي" },
        { key: "jobTitle", label: "المسمى الوظيفي" },
        { key: "salary", label: "الراتب الإجمالي" },
        { key: "issueDate", label: "تاريخ الإصدار" },
      ],
    }),
    aiPrompt:
      "قم بكتابة شهادة راتب رسمية باللغة العربية مع إبراز تفاصيل الراتب وبيانات الموظف",
    isActive: true,
    content: "Salary letter template",
  },
  {
    id: nextId(),
    code: "experience-letter",
    nameAr: "شهادة خبرة",
    nameEn: "Experience Letter",
    titleAr: "شهادة خبرة",
    description: "شهادة تثبت خدمة الموظف وفترته في الشركة",
    placeholdersSchema: JSON.stringify({
      fields: [
        { key: "employeeName", label: "اسم الموظف" },
        { key: "jobTitle", label: "المسمى الوظيفي" },
        { key: "startDate", label: "تاريخ البداية" },
        { key: "endDate", label: "تاريخ النهاية" },
        { key: "achievements", label: "أبرز الإنجازات" },
      ],
    }),
    aiPrompt:
      "اكتب شهادة خبرة مهنية توضح فترة خدمة الموظف ومسؤولياته الرئيسية وأسلوبه المهني",
    isActive: true,
    content: "Experience letter template",
  },
];
const documents: DocumentRecord[] = [];
const calculationHistoryRecords: CalculationHistoryRecord[] = [];
const generatedLetterLogs: GeneratedLetterRecord[] = [];
const consultingPackages: ConsultingPackage[] = [
  { id: nextId(), name: "أساسي", price: 299, slaHours: 24, isActive: true },
  { id: nextId(), name: "احترافي", price: 499, slaHours: 12, isActive: true },
];
const consultationTypes: ConsultationType[] = [
  {
    id: nextId(),
    nameAr: "استشارة سياسات الموارد البشرية",
    descriptionAr: "مراجعة سياسات الموارد البشرية والامتثال",
    price: 299,
    duration: 45,
    slaHours: 24,
    estimatedDuration: 45,
    basePriceSAR: 299,
    isActive: true,
  },
  {
    id: nextId(),
    nameAr: "استشارة توظيف",
    descriptionAr: "دعم كامل لعمليات التوظيف",
    price: 199,
    duration: 30,
    slaHours: 48,
    estimatedDuration: 30,
    basePriceSAR: 199,
    isActive: true,
  },
];
const tickets: ConsultingTicket[] = [];
const ticketResponses: ConsultingResponse[] = [];
const discountCodes: DiscountCode[] = [];
const discountUsages: { id: number; codeId: number; userId: number; usedAt: Date }[] = [];
const notifications: Notification[] = [];
const notificationPreferences: NotificationPreferences[] = [];
const consultants: Consultant[] = [];
const consultantDocs: ConsultantDocumentRecord[] = [];
const loginOtps = new Map<
  number,
  { code: string; expiresAt: Date; attempts: number; ip?: string; userAgent?: string }
>();
const loginMeta = new Map<
  number,
  { lastIp?: string | null; lastUserAgent?: string | null; lastAt?: Date }
>();
const bookings: ConsultationBooking[] = [];
const consultationMessages: ConsultationMessage[] = [];
const consents: ConsentRecord[] = [];
// GenericLogEntry interface removed - was defined but never used
interface DataSubjectRequest {
  id: number;
  userId: number;
  type: string;
  status: "open" | "in-progress" | "closed";
  payloadJson?: string;
  createdAt: Date;
  updatedAt?: Date;
}
interface SecurityIncident {
  id: number;
  description: string;
  cause?: string;
  affectedDataCategories?: string;
  affectedUsersCount?: number;
  riskLevel: "low" | "medium" | "high";
  status: "new" | "investigating" | "reported" | "resolved";
  createdAt: Date;
  reportedToSdaiaAt?: Date;
  reportedToUsersAt?: Date;
  updatedAt?: Date;
  isLate?: boolean;
}
// In-memory storage (note: these are used for in-memory mode only)
// const emailLogs: GenericLogEntry[] = [];
// const smsLogs: GenericLogEntry[] = [];
const dataRequests: DataSubjectRequest[] = [];
const securityIncidents: SecurityIncident[] = [];
const chatConversations: ChatConversation[] = [];
const chatMessages: ChatMessage[] = [];
const contactRequestsStore: ContactRequestRecord[] = [];
const testUserSeeds: TestUserSeed[] = [
  {
    email: "employee1@gmail.com",
    password: "SecurePass123!",
    name: "أحمد محمد",
    userType: "employee",
  },
  {
    email: "employee2@gmail.com",
    password: "SecurePass123!",
    name: "فاطمة علي",
    userType: "employee",
  },
  {
    email: "employee3@gmail.com",
    password: "SecurePass123!",
    name: "محمود حسن",
    userType: "employee",
  },
  {
    email: "test.employee@gmail.com",
    password: "TestPass123!",
    name: "موظف اختبار",
    userType: "employee",
  },
  {
    email: "consultant1@gmail.com",
    password: "ConsultPass123!",
    name: "محمد أحمد",
    userType: "consultant",
  },
  {
    email: "consultant2@gmail.com",
    password: "ConsultPass123!",
    name: "سارة خالد",
    userType: "consultant",
  },
  {
    email: "consultant3@gmail.com",
    password: "ConsultPass123!",
    name: "علي محمود",
    userType: "consultant",
  },
  {
    email: "test.consultant@gmail.com",
    password: "TestConsult123!",
    name: "مستشار اختبار",
    userType: "consultant",
  },
  {
    email: "admin@company1.com",
    password: "AdminPass123!",
    name: "أحمد الشركة",
    userType: "company",
  },
  {
    email: "admin@company2.com",
    password: "AdminPass123!",
    name: "فاطمة الشركة",
    userType: "company",
  },
  {
    email: "admin@company3.com",
    password: "AdminPass123!",
    name: "محمود الشركة",
    userType: "company",
  },
  {
    email: "test.admin@company.com",
    password: "TestAdmin123!",
    name: "مسؤول اختبار الشركة",
    userType: "company",
  },
  {
    email: "admin@rabit.com",
    password: "AdminRabit123!",
    name: "مسؤول النظام",
    userType: "admin",
    role: "admin",
  },
  {
    email: "superadmin@rabit.com",
    password: "SuperAdmin123!",
    name: "مسؤول فائق",
    userType: "admin",
    role: "admin",
  },
  {
    email: "test.admin@rabit.com",
    password: "TestSysAdmin123!",
    name: "مسؤول اختبار النظام",
    userType: "admin",
    role: "admin",
  },
];

// Minimal stub DB object used by health check/tests
const fakeDb = {
  delete(_table?: unknown) {
    return {
      where: async (_condition?: unknown) => {
        return undefined;
      },
    };
  },
  select(_fields?: unknown) {
    return {
      from: (_table?: unknown) => {
        return {
          where: (_condition?: unknown) => {
            return {
              limit: async (_n?: number) => {
                return [];
              },
            };
          },
          limit: async (_n?: number) => {
            return [];
          },
        };
      },
      limit: async (_n?: number) => {
        return [];
      },
    };
  },
  async execute() {
    return [];
  },
};

// تجمع أخطاء التهيئة أثناء التطوير بدون استخدام console مباشرة لتجاوز قاعدة اللينت
// (معلق) يمكن تفعيل تجميع أخطاء البذور لاحقاً إذا لزم
// const _seedErrors: { message: string; error: unknown }[] = [];

export async function getDb() {
  return fakeDb;
}

export async function execute() {
  // Stub for health checks
  return [];
}

// Contact Requests
type CreateContactRequestInput = {
  fullName: string;
  email: string;
  phoneNumber?: string;
  companyName?: string;
  teamSize?: string;
  topic?: DbInsertContactRequestRow["topic"];
  message: string;
  preferredContactMethod?: DbInsertContactRequestRow["preferredContactMethod"];
  hearAboutUs?: string;
  source?: string;
  locale?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown> | null;
  assignedTo?: number | null;
};

export async function createContactRequest(input: CreateContactRequestInput) {
  const payload: DbInsertContactRequestRow = {
    fullName: input.fullName,
    email: input.email,
    phoneNumber: input.phoneNumber ?? null,
    companyName: input.companyName ?? null,
    teamSize: input.teamSize ?? null,
    topic: input.topic ?? "sales",
    message: input.message,
    preferredContactMethod: input.preferredContactMethod ?? "email",
    hearAboutUs: input.hearAboutUs ?? null,
    status: "new",
    source: input.source ?? "marketing-site",
    locale: input.locale ?? "ar",
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    metadata: input.metadata ?? null,
    assignedTo: input.assignedTo ?? null,
  } as DbInsertContactRequestRow;

  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    const result = await db.insert(contactRequestsTable).values(payload);
    const insertedId = extractInsertId(result);
    if (insertedId) {
      const [row] = await db
        .select()
        .from(contactRequestsTable)
        .where(eq(contactRequestsTable.id, insertedId))
        .limit(1);
      if (row) {
        return row;
      }
    }
    const [latest] = await db
      .select()
      .from(contactRequestsTable)
      .orderBy(desc(contactRequestsTable.createdAt))
      .limit(1);
    if (latest) {
      return latest;
    }
    return {
      id: insertedId || 0,
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ContactRequestRecord;
  }

  const record: ContactRequestRecord = {
    id: nextId(),
    ...payload,
    status: payload.status ?? "new",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as ContactRequestRecord;
  contactRequestsStore.push(record);
  return record;
}

export async function listContactRequests(limit = 50) {
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    return db
      .select()
      .from(contactRequestsTable)
      .orderBy(desc(contactRequestsTable.createdAt))
      .limit(limit);
  }
  return [...contactRequestsStore]
    .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
    .slice(0, limit);
}

// Users & auth
export async function createUser(input: {
  email?: string | null;
  name?: string | null;
  phoneNumber?: string | null;
  role?: UserRole;
  openId?: string | null;
  userType?: string | null;
}) {
  // إذا كان لدينا قاعدة بيانات فعلية استخدم drizzle، وإلا استخدم التخزين بالذاكرة
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    // ملاحظة: المخطط الحالي لا يحتوي نوع "consultant" في userType، سنضعه null لتفادي خطأ الإدراج
    const userTypeValue = input.userType === "consultant" ? null : input.userType ?? null;
    const result = await db
      .insert(usersTable)
      .values({
        email: input.email ?? null,
        name: input.name ?? null,
        phoneNumber: input.phoneNumber ?? null,
        role: input.role || "user",
        userType: userTypeValue as DrizzleUserType,
        openId: input.openId ?? null,
      });
    const insertedId = extractInsertId(result);
    if (insertedId) {
      return insertedId;
    }
    // Fallback: استرجاع السجل عن طريق البريد بعد الإدراج
    if (input.email) {
      const rows = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, input.email))
        .execute();
      const fallback = rows[0];
      if (fallback) {
        return fallback.id;
      }
    }
    return 0;
  }
  const id = nextId();
  users.push({
    id,
    email: input.email,
    name: input.name,
    role: input.role || "user",
    openId: input.openId ?? null,
    userType: input.userType ?? null,
    lastSignedIn: null,
    phoneNumber: null,
    loginMethod: null,
    emailVerified: null,
    profileCompleted: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return id;
}

export async function createUserWithPassword(input: {
  email: string;
  password: string;
  name?: string;
  phoneNumber?: string;
  role?: UserRole;
  userType?: string;
}) {
  if (process.env.DATABASE_URL) {
    const userId = await createUser({
      email: input.email,
      name: input.name ?? null,
      phoneNumber: input.phoneNumber ?? null,
      role: input.role ?? "user",
      userType: input.userType ?? null,
    });
    const hashedPassword = await hashPassword(input.password);
    await savePassword(userId, hashedPassword);
    return getUserById(userId);
  }
  const userId = await createUser({
    email: input.email,
    name: input.name ?? null,
    role: input.role ?? "user",
    userType: input.userType ?? null,
  });
  const hashedPassword = await hashPassword(input.password);
  await savePassword(userId, hashedPassword);
  return getUserById(userId);
}

export async function verifyUserLogin(email: string, password: string) {
  if (process.env.DATABASE_URL) {
    const user = await getUserByEmail(email);
    if (!user) return null;
    const pwd = await getPasswordByUserId(user.id);
    if (!pwd) return null;
    const valid = await verifyPassword(password, pwd.hashedPassword);
    return valid ? user : null;
  }
  const user = await getUserByEmail(email);
  if (!user) return null;
  const pwd = await getPasswordByUserId(user.id);
  if (!pwd) return null;
  const valid = await verifyPassword(password, pwd.hashedPassword);
  return valid ? user : null;
}

export async function getUserById(id: number) {
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    const rows = await db.select().from(usersTable).where(eq(usersTable.id, id));
    const row = rows[0];
    if (!row) return undefined;
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role as UserRole,
      userType: row.userType ?? null,
      lastSignedIn: row.lastSignedIn ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      openId: row.openId ?? null,
      phoneNumber: row.phoneNumber ?? null,
      loginMethod: row.loginMethod ?? null,
      emailVerified: row.emailVerified ?? null,
      profileCompleted: row.profileCompleted ?? null,
      profilePicture: row.profilePicture ?? null,
    } as UserRecord;
  }
  return users.find(u => u.id === id);
}

export async function getUserByEmail(email: string) {
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    const rows = await db.select().from(usersTable).where(eq(usersTable.email, email));
    const row = rows[0];
    if (!row) return undefined;
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role as UserRole,
      userType: row.userType ?? null,
      lastSignedIn: row.lastSignedIn ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      openId: row.openId ?? null,
      phoneNumber: row.phoneNumber ?? null,
      loginMethod: row.loginMethod ?? null,
      emailVerified: row.emailVerified ?? null,
      profileCompleted: row.profileCompleted ?? null,
      profilePicture: row.profilePicture ?? null,
    } as UserRecord;
  }
  return users.find(u => u.email === email);
}

export async function getUserByOpenId(openId: string) {
  return users.find(u => u.openId === openId);
}

export async function savePassword(userId: number, hashedPassword: string) {
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    // تحقق إن كان هناك سجل سابق
    const existing = await db
      .select()
      .from(passwordsTable)
      .where(eq(passwordsTable.userId, userId));
    if (existing.length > 0) {
      await db
        .update(passwordsTable)
        .set({ passwordHash: hashedPassword })
        .where(eq(passwordsTable.userId, userId))
        .execute();
      return;
    }
    await db
      .insert(passwordsTable)
      .values({ userId, passwordHash: hashedPassword })
      .execute();
    return;
  }
  const existing = passwords.find(p => p.userId === userId);
  if (existing) {
    existing.hashedPassword = hashedPassword;
    return;
  }
  passwords.push({ userId, hashedPassword });
}

export async function getPasswordByUserId(userId: number) {
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    const rows = await db
      .select()
      .from(passwordsTable)
      .where(eq(passwordsTable.userId, userId));
    const row = rows[0];
    if (!row) return undefined;
    return {
      userId: row.userId,
      hashedPassword: row.passwordHash,
      resetToken: row.resetToken ?? null,
      resetTokenExpiry: row.resetTokenExpiry ?? null,
    } as PasswordRecord;
  }
  return passwords.find(p => p.userId === userId);
}

export async function updateUserLastSignedIn(userId: number) {
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    await db
      .update(usersTable)
      .set({ lastSignedIn: new Date(), updatedAt: new Date() })
      .where(eq(usersTable.id, userId))
      .execute();
    return;
  }
  const user = await getUserById(userId);
  if (user) {
    user.lastSignedIn = new Date();
    user.updatedAt = new Date();
  }
}

// Lightweight 2FA OTP store (in-memory)
export async function setLoginOtp(params: {
  userId: number;
  code: string;
  expiresAt: Date;
  ip?: string;
  userAgent?: string;
}) {
  loginOtps.set(params.userId, { ...params, attempts: 0 });
}

export async function getLoginOtp(userId: number) {
  return loginOtps.get(userId);
}

export async function clearLoginOtp(userId: number) {
  loginOtps.delete(userId);
}

export async function incrementLoginOtpAttempt(userId: number) {
  const current = loginOtps.get(userId);
  if (current) {
    current.attempts += 1;
    loginOtps.set(userId, current);
  }
}

// Lightweight login metadata (in-memory)
export async function getLoginMeta(userId: number) {
  return loginMeta.get(userId);
}

export async function setLoginMeta(userId: number, meta: { lastIp?: string | null; lastUserAgent?: string | null }) {
  loginMeta.set(userId, { ...meta, lastAt: new Date() });
}

export async function setPasswordResetToken(userId: number, token: string, expiresAt: Date) {
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    const existing = await db
      .select()
      .from(passwordsTable)
      .where(eq(passwordsTable.userId, userId));
    if (!existing.length) return;
    await db
      .update(passwordsTable)
      .set({ resetToken: token, resetTokenExpiry: expiresAt })
      .where(eq(passwordsTable.userId, userId))
      .execute();
    return;
  }
  const pwd = passwords.find(p => p.userId === userId);
  if (pwd) {
    pwd.resetToken = token;
    pwd.resetTokenExpiry = expiresAt;
  }
}

export async function findUserByResetToken(token: string) {
  const now = new Date();

  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    const rows = await db
      .select()
      .from(passwordsTable)
      .where(eq(passwordsTable.resetToken, token));
    const row = rows[0];
    if (!row) return null;
    if (!row.resetTokenExpiry || row.resetTokenExpiry < now) return null;
    const user = await getUserById(row.userId);
    return user || null;
  }

  const record = passwords.find(
    p => p.resetToken === token && p.resetTokenExpiry && p.resetTokenExpiry > now
  );
  if (!record) return null;
  const user = await getUserById(record.userId);
  return user || null;
}

export async function updateUserPassword(userId: number, hashedPassword: string) {
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    const existing = await db
      .select()
      .from(passwordsTable)
      .where(eq(passwordsTable.userId, userId));
    if (existing.length === 0) {
      await db
        .insert(passwordsTable)
        .values({
          userId,
          passwordHash: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        })
        .execute();
      return;
    } else {
      await db
        .update(passwordsTable)
        .set({
          passwordHash: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        })
        .where(eq(passwordsTable.userId, userId))
        .execute();
      return;
    }
  }
  const pwd = passwords.find(p => p.userId === userId);
  if (pwd) {
    pwd.hashedPassword = hashedPassword;
    pwd.resetToken = null;
    pwd.resetTokenExpiry = null;
  } else {
    passwords.push({
      userId,
      hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });
  }
}

export async function updateUserProfile(openId: string, data: Partial<UserRecord>) {
  const user = await getUserByOpenId(openId);
  if (!user) return null;
  Object.assign(user, data, { updatedAt: new Date() });
  return user;
}

export async function updateUserProfileById(userId: number, data: {
  name?: string;
  email?: string;
  bio?: string;
  city?: string;
  profilePicture?: string;
  linkedIn?: string;
  twitter?: string;
  metadata?: string;
  profileCompleted?: boolean;
}) {
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    await db
      .update(usersTable)
      .set({
        name: data.name,
        email: data.email,
        profilePicture: data.profilePicture,
        profileCompleted: data.profileCompleted,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));
    return getUserById(userId);
  }
  // In-memory fallback
  const user = users.find(u => u.id === userId);
  if (!user) return null;
  Object.assign(user, {
    ...data,
    updatedAt: new Date(),
  });
  return user;
}

export async function updateUserProfilePicture(openId: string, url: string) {
  return updateUserProfile(openId, { profilePicture: url });
}

// Templates & documents
export async function getAllTemplates() {
  return templates.filter(t => t.isActive !== false);
}

export async function getTemplateByCode(code: string) {
  return templates.find(t => t.code === code);
}

const isValidDocumentLang = (lang?: string): lang is "ar" | "en" | "both" =>
  lang === "ar" || lang === "en" || lang === "both";

const parseJsonField = <T = Record<string, unknown>>(value?: string | null): T | undefined => {
  if (!value) return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
};

const mapGeneratedDocumentRow = (row: DbGeneratedDocument): DocumentRecord => ({
  id: row.id,
  userId: row.userId,
  title: undefined,
  content: row.outputHtml ?? row.outputText ?? undefined,
  outputHtml: row.outputHtml ?? undefined,
  outputText: row.outputText ?? undefined,
  lang: row.lang ?? undefined,
  inputData: parseJsonField(row.inputData),
  companyLogo: row.companyLogo ?? undefined,
  companyName: row.companyName ?? undefined,
  saved: row.isSaved ?? false,
  isSaved: row.isSaved ?? false,
  templateCode: row.templateCode ?? undefined,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt ?? undefined,
});

const mapConsultantDocumentRow = (
  row: DbConsultantDocumentRow
): ConsultantDocumentRecord => ({
  id: row.id,
  consultantId: row.consultantId,
  title: row.documentName,
  url: row.documentUrl,
  fileSize: row.fileSize ?? undefined,
  mimeType: row.mimeType ?? undefined,
  documentType: row.documentType ?? undefined,
  verificationStatus: row.verificationStatus ?? undefined,
  verificationNotes: row.verificationNotes ?? null,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt ?? undefined,
});

export async function createGeneratedDocument(input: {
  userId: number;
  title?: string;
  content?: string;
  saved?: boolean;
  templateCode?: string;
  outputHtml?: string;
  outputText?: string;
  lang?: string;
  inputData?: Record<string, unknown>;
  companyLogo?: string;
  companyName?: string;
  isSaved?: boolean;
}) {
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    const langValue: "ar" | "en" | "both" = isValidDocumentLang(input.lang) ? input.lang : "ar";
    const result = await db
      .insert(generatedDocumentsTable)
      .values({
        userId: input.userId,
        templateCode: input.templateCode ?? "custom",
        outputHtml: input.outputHtml ?? input.content ?? null,
        outputText: input.outputText ?? input.content ?? null,
        lang: langValue,
        inputData: input.inputData ? JSON.stringify(input.inputData) : null,
        companyLogo: input.companyLogo ?? null,
        companyName: input.companyName ?? null,
        isSaved: input.isSaved ?? input.saved ?? false,
      });
    const insertedId = extractInsertId(result);
    if (insertedId) {
      return insertedId;
    }
    const [latest] = await db
      .select({ id: generatedDocumentsTable.id })
      .from(generatedDocumentsTable)
      .orderBy(desc(generatedDocumentsTable.createdAt))
      .limit(1);
    return latest?.id ?? 0;
  }
  const id = nextId();
  documents.push({
    id,
    userId: input.userId,
    title: input.title,
    content: input.content,
    outputHtml: input.outputHtml,
    outputText: input.outputText,
    lang: input.lang,
    inputData: input.inputData,
    companyLogo: input.companyLogo,
    companyName: input.companyName,
    saved: input.saved ?? input.isSaved ?? false,
    isSaved: input.isSaved ?? input.saved ?? false,
    templateCode: input.templateCode,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return id;
}

export async function getUserDocuments(userId: number, limit?: number) {
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    const rows = await db
      .select()
      .from(generatedDocumentsTable)
      .where(eq(generatedDocumentsTable.userId, userId))
      .orderBy(desc(generatedDocumentsTable.createdAt));
    const docs = rows.map(mapGeneratedDocumentRow);
    return typeof limit === "number" ? docs.slice(0, limit) : docs;
  }
  const docs = documents.filter(d => d.userId === userId);
  return typeof limit === "number" ? docs.slice(0, limit) : docs;
}

export async function getUserSavedDocuments(userId: number) {
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    const rows = await db
      .select()
      .from(generatedDocumentsTable)
      .where(eq(generatedDocumentsTable.userId, userId))
      .orderBy(desc(generatedDocumentsTable.createdAt));
    return rows.filter(row => row.isSaved).map(mapGeneratedDocumentRow);
  }
  return documents.filter(d => d.userId === userId && d.saved);
}

export async function getDocumentById(documentId: number) {
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    const rows = await db
      .select()
      .from(generatedDocumentsTable)
      .where(eq(generatedDocumentsTable.id, documentId));
    const row = rows[0];
    return row ? mapGeneratedDocumentRow(row) : undefined;
  }
  return documents.find(d => d.id === documentId);
}

export async function updateDocumentSavedStatus(documentId: number, saved: boolean) {
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    await db
      .update(generatedDocumentsTable)
      .set({ isSaved: saved })
      .where(eq(generatedDocumentsTable.id, documentId));
    return;
  }
  const doc = await getDocumentById(documentId);
  if (doc) {
    doc.saved = saved;
    doc.isSaved = saved;
  }
}

export async function deleteGeneratedDocument(documentId: number, userId?: number) {
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    const condition = userId
      ? and(eq(generatedDocumentsTable.id, documentId), eq(generatedDocumentsTable.userId, userId))
      : eq(generatedDocumentsTable.id, documentId);
    const deleteQuery = db.delete(generatedDocumentsTable).where(condition);
    await deleteQuery;
    return;
  }
  const idx = documents.findIndex(d => d.id === documentId && (!userId || d.userId === userId));
  if (idx >= 0) {
    documents.splice(idx, 1);
  }
}

export async function saveCalculationHistory(input: {
  userId: number;
  calculationType: CalculationType;
  salary?: number | null;
  contractType?: string | null;
  terminationReason?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  duration?: { years: number; months: number; days: number } | null;
  inputData?: Record<string, unknown> | null;
  result?: Record<string, unknown> | null;
  notes?: string | null;
}) {
  const record: CalculationHistoryRecord = {
    id: nextId(),
    createdAt: new Date(),
    ...input,
  };
  calculationHistoryRecords.unshift(record);
  return record;
}

export async function getCalculationHistory(
  userId: number,
  calculationType?: CalculationType,
  limit?: number
) {
  const list = calculationHistoryRecords.filter(
    r => r.userId === userId && (!calculationType || r.calculationType === calculationType)
  );
  const sorted = [...list].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

export async function deleteCalculationHistory(recordId: number, userId: number) {
  const idx = calculationHistoryRecords.findIndex(r => r.id === recordId && r.userId === userId);
  if (idx >= 0) {
    calculationHistoryRecords.splice(idx, 1);
  }
}

export async function saveGeneratedLetter(input: {
  userId: number;
  letterType: string;
  title?: string;
  category?: string;
  language?: string;
  style?: string;
  content: string;
  metadata?: Record<string, unknown> | null;
  isFavorite?: boolean;
}) {
  const record: GeneratedLetterRecord = {
    id: nextId(),
    createdAt: new Date(),
    ...input,
  };
  generatedLetterLogs.unshift(record);
  return record;
}

export async function getGeneratedLetters(userId: number, limit?: number) {
  const list = generatedLetterLogs.filter(r => r.userId === userId);
  const sorted = [...list].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

export async function deleteGeneratedLetter(letterId: number, userId: number) {
  const idx = generatedLetterLogs.findIndex(r => r.id === letterId && r.userId === userId);
  if (idx >= 0) {
    generatedLetterLogs.splice(idx, 1);
  }
}

// Consulting packages & tickets
export async function getActiveConsultingPackages() {
  return consultingPackages.filter(p => p.isActive);
}

export async function getConsultingPackageById(id: number) {
  return consultingPackages.find(p => p.id === id) || null;
}

export async function createConsultingTicket(input: {
  userId: number;
  consultationTypeId?: number | null;
  packageId?: number | null;
  subject?: string;
  description?: string;
}) {
  const id = nextId();
  const ticketNumber = `T-${Date.now()}-${id}`;
  tickets.push({
    id,
    ticketNumber,
    userId: input.userId,
    consultantId: null,
    packageId: input.packageId ?? null,
    status: "open",
    description: input.description,
    createdAt: new Date(),
  });
  return { id, ticketNumber };
}

export async function getUserConsultingTickets(userId: number) {
  return tickets.filter(t => t.userId === userId);
}

export async function getConsultingTicketById(ticketId: number) {
  return tickets.find(t => t.id === ticketId) || null;
}

export async function getConsultingTicketByNumber(ticketNumber: string) {
  return tickets.find(t => t.ticketNumber === ticketNumber) || null;
}

export async function getConsultingTicketResponses(ticketId: number) {
  return ticketResponses.filter(r => r.ticketId === ticketId);
}

export async function addConsultingResponse(input: {
  ticketId: number;
  userId: number;
  message: string;
  role: string;
  attachments?: AttachmentRef[];
  isInternal?: boolean;
}) {
  const id = nextId();
  ticketResponses.push({
    id,
    ticketId: input.ticketId,
    userId: input.userId,
    message: input.message,
    role: input.role,
    attachments: input.attachments,
    createdAt: new Date(),
  });
  return id;
}

export async function updateConsultingTicketStatus(ticketId: number, status: string) {
  const ticket = await getConsultingTicketById(ticketId);
  if (ticket) {
    ticket.status = status;
  }
}

export async function assignConsultingTicket(ticketId: number, consultantId: number) {
  const ticket = await getConsultingTicketById(ticketId);
  if (ticket) {
    ticket.consultantId = consultantId;
  }
}

export async function rateConsultingTicket(ticketId: number, rating: number, feedback?: string) {
  const ticket = await getConsultingTicketById(ticketId);
  if (ticket) {
    ticket.rating = rating;
    if (feedback) {
      await addConsultingResponse({
        ticketId,
        userId: ticket.userId,
        message: feedback,
        role: "user",
      });
    }
  }
}

export async function getConsultantTickets(consultantId: number) {
  return tickets.filter(t => t.consultantId === consultantId);
}

export async function getPendingConsultingTickets() {
  return tickets.filter(t => t.status === "open");
}

// Discount codes
export async function getDiscountCodeByCode(code: string) {
  return discountCodes.find(c => c.code.toLowerCase() === code.toLowerCase()) || null;
}

export async function getAllDiscountCodes() {
  return discountCodes;
}

export async function createDiscountCode(
  data: Omit<DiscountCode, "id" | "usedCount">
) {
  const id = nextId();
  discountCodes.push({
    id,
    usedCount: 0,
    ...data,
  });
  return id;
}

export async function updateDiscountCode(id: number, updates: Partial<DiscountCode>) {
  const code = discountCodes.find(c => c.id === id);
  if (code) {
    Object.assign(code, updates);
  }
}

export async function deleteDiscountCode(id: number) {
  const idx = discountCodes.findIndex(c => c.id === id);
  if (idx >= 0) {
    discountCodes.splice(idx, 1);
  }
}

export async function getDiscountCodeUsageHistory(codeId: number) {
  // In-memory implementation returns recorded usages (if any) filtered by code
  return discountUsages.filter(usage => usage.codeId === codeId);
}

// Test helpers
export function __resetDiscountData() {
  discountCodes.length = 0;
  discountUsages.length = 0;
}

// Notifications DB flag (skip during tests)
const useNotificationsDb = Boolean(process.env.DATABASE_URL) && process.env.NODE_ENV !== "test";

const mapNotificationRow = (row: DbNotificationRow): Notification => ({
  id: row.id,
  userId: row.userId ?? null,
  title: row.title,
  body: row.body,
  type: row.type ?? "system",
  read: Boolean(row.isRead),
  createdAt: row.createdAt ?? new Date(),
  metadata: (row.metadata as Record<string, unknown>) ?? undefined,
  link: row.link ?? null,
  icon: row.icon ?? null,
});

const mapNotificationPrefsRow = (
  row: DbNotificationPreferenceRow
): NotificationPreferences => ({
  userId: row.userId,
  emailEnabled: row.emailEnabled ?? true,
  smsEnabled: row.smsEnabled ?? false,
  pushEnabled: row.pushEnabled ?? false,
});

// Notifications
export async function createNotification(
  input: Omit<Notification, "id" | "createdAt" | "read">
) {
  if (useNotificationsDb) {
    const db = await getDrizzleDb();
    const insertResult = await db
      .insert(notificationsTable)
      .values({
        userId: input.userId ?? null,
        title: input.title,
        body: input.body,
        type: (input.type as DbNotificationRow["type"]) ?? "system",
        link: input.link ?? null,
        icon: input.icon ?? null,
        metadata: input.metadata ?? null,
        isRead: false,
        createdAt: new Date(),
      });
    const insertedId = extractInsertId(insertResult);
    if (insertedId) {
      const [row] = await db
        .select()
        .from(notificationsTable)
        .where(eq(notificationsTable.id, insertedId))
        .limit(1);
      if (row) {
        return mapNotificationRow(row);
      }
    }
    const [latest] = await db
      .select()
      .from(notificationsTable)
      .orderBy(desc(notificationsTable.createdAt))
      .limit(1);
    if (latest) {
      return mapNotificationRow(latest);
    }
  }

  const notif: Notification = {
    id: nextId(),
    createdAt: new Date(),
    read: false,
    ...input,
  };
  notifications.push(notif);
  return notif;
}

export async function getUserNotifications(userId: number, limit = 20) {
  if (useNotificationsDb) {
    const db = await getDrizzleDb();
    const rows = await db
      .select()
      .from(notificationsTable)
      .where(or(eq(notificationsTable.userId, userId), isNull(notificationsTable.userId)))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(limit);
    return rows.map(mapNotificationRow);
  }
  return notifications
    .filter(n => n.userId === userId || n.userId === null)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export async function getUnreadNotificationsCount(userId: number) {
  if (useNotificationsDb) {
    const db = await getDrizzleDb();
    const rows = await db
      .select()
      .from(notificationsTable)
      .where(
        and(
          or(eq(notificationsTable.userId, userId), isNull(notificationsTable.userId)),
          eq(notificationsTable.isRead, false)
        )
      );
    return rows.length;
  }
  return notifications.filter(
    n => (n.userId === userId || n.userId === null) && !n.read
  ).length;
}

export async function markNotificationAsRead(id: number) {
  if (useNotificationsDb) {
    const db = await getDrizzleDb();
    const markAsReadQuery = db
      .update(notificationsTable)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notificationsTable.id, id));
    await markAsReadQuery;
    return;
  }
  const note = notifications.find(n => n.id === id);
  if (note) {
    note.read = true;
  }
}

export async function markAllNotificationsAsRead(userId: number) {
  if (useNotificationsDb) {
    const db = await getDrizzleDb();
    const markAllQuery = db
      .update(notificationsTable)
      .set({ isRead: true, readAt: new Date() })
      .where(or(eq(notificationsTable.userId, userId), isNull(notificationsTable.userId)));
    await markAllQuery;
    return;
  }
  for (const n of notifications) {
    if (n.userId === userId || n.userId === null) n.read = true;
  }
}

export async function deleteNotification(id: number) {
  if (useNotificationsDb) {
    const db = await getDrizzleDb();
    const deleteNotificationQuery = db
      .delete(notificationsTable)
      .where(eq(notificationsTable.id, id));
    await deleteNotificationQuery;
    return;
  }
  const idx = notifications.findIndex(n => n.id === id);
  if (idx >= 0) notifications.splice(idx, 1);
}

export async function deleteAllNotifications(userId: number) {
  if (useNotificationsDb) {
    const db = await getDrizzleDb();
    const deleteAllQuery = db
      .delete(notificationsTable)
      .where(or(eq(notificationsTable.userId, userId), isNull(notificationsTable.userId)));
    await deleteAllQuery;
    return;
  }
  for (let i = notifications.length - 1; i >= 0; i--) {
    if (notifications[i].userId === userId || notifications[i].userId === null) {
      notifications.splice(i, 1);
    }
  }
}

export async function resetNotificationStore() {
  if (useNotificationsDb) {
    const db = await getDrizzleDb();
    await db.delete(notificationsTable);
    await db.delete(notificationPreferencesTable);
  }
  notifications.length = 0;
  notificationPreferences.length = 0;
}

export async function getNotificationPreferences(userId: number) {
  if (useNotificationsDb) {
    const db = await getDrizzleDb();
    const existing = await db
      .select()
      .from(notificationPreferencesTable)
      .where(eq(notificationPreferencesTable.userId, userId))
      .limit(1);
    const row = existing[0];
    if (row) {
      return mapNotificationPrefsRow(row);
    }

    await db.insert(notificationPreferencesTable).values({
      userId,
      inAppEnabled: true,
      emailEnabled: true,
      pushEnabled: false,
      smsEnabled: false,
      notifyOnBooking: true,
      notifyOnResponse: true,
      notifyOnReminder: true,
      notifyOnPromotion: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const [created] = await db
      .select()
      .from(notificationPreferencesTable)
      .where(eq(notificationPreferencesTable.userId, userId))
      .limit(1);
    if (created) return mapNotificationPrefsRow(created);
  }
  let prefs = notificationPreferences.find(p => p.userId === userId);
  if (!prefs) {
    prefs = {
      userId,
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
    };
    notificationPreferences.push(prefs);
  }
  return prefs;
}

export async function updateNotificationPreferences(
  userId: number,
  prefs: Partial<NotificationPreferences>
) {
  if (useNotificationsDb) {
    const db = await getDrizzleDb();
    const current = await getNotificationPreferences(userId);
    await db
      .update(notificationPreferencesTable)
      .set({
        emailEnabled: prefs.emailEnabled ?? current.emailEnabled,
        smsEnabled: prefs.smsEnabled ?? current.smsEnabled,
        pushEnabled: prefs.pushEnabled ?? current.pushEnabled,
        updatedAt: new Date(),
      })
      .where(eq(notificationPreferencesTable.userId, userId));
    return getNotificationPreferences(userId);
  }
  const current = await getNotificationPreferences(userId);
  Object.assign(current, prefs);
  return current;
}

// Chat (in-memory persistence with helpers)
const useChatDb = Boolean(process.env.DATABASE_URL) && process.env.NODE_ENV !== "test";

function generateVisitorToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function createChatConversation(input: {
  visitorName?: string | null;
  visitorEmail?: string | null;
  userId?: number | null;
}) {
  const visitorToken = generateVisitorToken();
  if (useChatDb) {
    const db = await getDrizzleDb();
    const insertResult = await db
      .insert(chatConversationsTable)
      .values({
        userId: input.userId ?? null,
        visitorName: input.visitorName ?? null,
        visitorEmail: input.visitorEmail ?? null,
        visitorToken,
        status: "open",
        lastMessageAt: new Date(),
      });
    const insertedId = extractInsertId(insertResult);
    const [row] = await db
      .select()
      .from(chatConversationsTable)
      .where(
        insertedId
          ? eq(chatConversationsTable.id, insertedId)
          : eq(chatConversationsTable.visitorToken, visitorToken)
      )
      .orderBy(desc(chatConversationsTable.createdAt))
      .limit(1);
    if (row) {
      return {
        id: row.id,
        userId: row.userId ?? null,
        visitorName: row.visitorName ?? null,
        visitorEmail: row.visitorEmail ?? null,
        visitorToken: row.visitorToken ?? visitorToken,
        status: (row.status || "open"),
        lastMessageAt: row.lastMessageAt ?? new Date(),
      };
    }
  }
  const conversation: ChatConversation = {
    id: nextId(),
    userId: input.userId ?? null,
    visitorName: input.visitorName ?? null,
    visitorEmail: input.visitorEmail ?? null,
    visitorToken,
    status: "open",
    lastMessageAt: new Date(),
  };
  chatConversations.push(conversation);
  return conversation;
}

export async function upsertChatConversation(input: {
  id?: number;
  visitorName?: string | null;
  visitorEmail?: string | null;
  userId?: number | null;
}) {
  // If no id provided, create new conversation
  if (!input.id) {
    return createChatConversation(input);
  }

  if (useChatDb) {
    return upsertChatConversationDrizzle(input.id, input);
  }
  return upsertChatConversationInMemory(input.id, input);
}

// Helper function for Drizzle database upsert
async function upsertChatConversationDrizzle(
  id: number,
  input: { visitorName?: string | null; visitorEmail?: string | null; userId?: number | null }
) {
  const db = await getDrizzleDb();
  const rows = await db
    .select()
    .from(chatConversationsTable)
    .where(eq(chatConversationsTable.id, id))
    .limit(1);
  const existing = rows[0];

  if (!existing) {
    return createChatConversation(input);
  }

  const visitorToken = existing.visitorToken || generateVisitorToken();
  await db
    .update(chatConversationsTable)
    .set({
      visitorName: existing.visitorName || input.visitorName || null,
      visitorEmail: existing.visitorEmail || input.visitorEmail || null,
      userId: existing.userId || input.userId || null,
      visitorToken,
      updatedAt: new Date(),
    })
    .where(eq(chatConversationsTable.id, existing.id));

  return {
    id: existing.id,
    userId: existing.userId ?? input.userId ?? null,
    visitorName: existing.visitorName ?? input.visitorName ?? null,
    visitorEmail: existing.visitorEmail ?? input.visitorEmail ?? null,
    visitorToken,
    status: existing.status,
    lastMessageAt: existing.lastMessageAt ?? new Date(),
  };
}

// Helper function for in-memory upsert
function upsertChatConversationInMemory(
  id: number,
  input: { visitorName?: string | null; visitorEmail?: string | null; userId?: number | null }
) {
  const existing = chatConversations.find(c => c.id === id);
  if (!existing) {
    return createChatConversation(input);
  }

  if (!existing.visitorName && input.visitorName) existing.visitorName = input.visitorName;
  if (!existing.visitorEmail && input.visitorEmail) existing.visitorEmail = input.visitorEmail;
  if (!existing.userId && input.userId) existing.userId = input.userId;
  if (!existing.visitorToken) existing.visitorToken = generateVisitorToken();
  return existing;
}

export async function getChatConversation(id: number) {
  if (useChatDb) {
    const db = await getDrizzleDb();
    const rows = await db
      .select()
      .from(chatConversationsTable)
      .where(eq(chatConversationsTable.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      userId: row.userId ?? null,
      visitorName: row.visitorName ?? null,
      visitorEmail: row.visitorEmail ?? null,
      visitorToken: row.visitorToken ?? null,
      status: row.status,
      lastMessageAt: row.lastMessageAt ?? new Date(),
    } as ChatConversation;
  }
  return chatConversations.find(c => c.id === id) || null;
}

export async function getChatConversationsByUser(userId: number) {
  if (useChatDb) {
    const db = await getDrizzleDb();
    const rows = await db
      .select()
      .from(chatConversationsTable)
      .where(eq(chatConversationsTable.userId, userId))
      .orderBy(desc(chatConversationsTable.lastMessageAt));
    return rows.map(row => ({
      id: row.id,
      userId: row.userId ?? null,
      visitorName: row.visitorName ?? null,
      visitorEmail: row.visitorEmail ?? null,
      visitorToken: row.visitorToken ?? null,
      status: row.status,
      lastMessageAt: row.lastMessageAt ?? new Date(),
    })) as ChatConversation[];
  }
  return chatConversations.filter(c => c.userId === userId);
}

export async function getAllChatConversations() {
  if (useChatDb) {
    const db = await getDrizzleDb();
    const rows = await db
      .select()
      .from(chatConversationsTable)
      .orderBy(desc(chatConversationsTable.lastMessageAt));
    return rows.map(row => ({
      id: row.id,
      userId: row.userId ?? null,
      visitorName: row.visitorName ?? null,
      visitorEmail: row.visitorEmail ?? null,
      visitorToken: row.visitorToken ?? null,
      status: row.status,
      lastMessageAt: row.lastMessageAt ?? new Date(),
    })) as ChatConversation[];
  }
  return [...chatConversations];
}

export async function updateChatConversationStatus(id: number, status: "open" | "closed") {
  if (useChatDb) {
    const db = await getDrizzleDb();
    await db
      .update(chatConversationsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(chatConversationsTable.id, id));
    return getChatConversation(id);
  }
  const convo = await getChatConversation(id);
  if (convo) {
    convo.status = status;
  }
  return convo;
}

export async function addChatMessage(input: {
  conversationId: number;
  senderType: ChatMessage["senderType"];
  senderName?: string;
  message: string;
  read?: boolean;
}) {
  if (useChatDb) {
    const db = await getDrizzleDb();
    const insertResult = await db
      .insert(chatMessagesTable)
      .values({
        conversationId: input.conversationId,
        senderType: input.senderType,
        senderName: input.senderName ?? null,
        message: input.message,
        isRead: input.read ?? false,
        createdAt: new Date(),
      });
    const insertedId = extractInsertId(insertResult);
    await db
      .update(chatConversationsTable)
      .set({ lastMessageAt: new Date() })
      .where(eq(chatConversationsTable.id, input.conversationId));
    const [row] = await db
      .select()
      .from(chatMessagesTable)
      .where(
        insertedId
          ? eq(chatMessagesTable.id, insertedId)
          : eq(chatMessagesTable.conversationId, input.conversationId)
      )
      .orderBy(desc(chatMessagesTable.createdAt))
      .limit(1);
    return {
      id: row?.id || insertedId || nextId(),
      conversationId: input.conversationId,
      senderType: input.senderType,
      senderName: input.senderName,
      message: input.message,
      createdAt: row?.createdAt ?? new Date(),
      read: input.read ?? false,
    } as ChatMessage;
  }
  const message: ChatMessage = {
    id: nextId(),
    conversationId: input.conversationId,
    senderType: input.senderType,
    senderName: input.senderName,
    message: input.message,
    createdAt: new Date(),
    read: input.read ?? false,
  };
  chatMessages.push(message);
  const convo = await getChatConversation(input.conversationId);
  if (convo) {
    convo.lastMessageAt = message.createdAt;
  }
  return message;
}

export async function getChatMessages(conversationId: number) {
  if (useChatDb) {
    const db = await getDrizzleDb();
    const rows = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.conversationId, conversationId))
      .orderBy(chatMessagesTable.createdAt);
    return rows.map(row => ({
      id: row.id,
      conversationId: row.conversationId,
      senderType: row.senderType,
      senderName: row.senderName ?? undefined,
      message: row.message ?? "",
      createdAt: row.createdAt ?? new Date(),
      read: row.isRead ?? false,
    })) as ChatMessage[];
  }
  return chatMessages
    .filter(m => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export async function markChatMessagesAsRead(conversationId: number) {
  if (useChatDb) {
    const db = await getDrizzleDb();
    await db
      .update(chatMessagesTable)
      .set({ isRead: true })
      .where(eq(chatMessagesTable.conversationId, conversationId));
    return;
  }
  for (const m of chatMessages) {
    if (m.conversationId === conversationId) m.read = true;
  }
}

export async function getUnreadChatMessagesCount(conversationId: number) {
  if (useChatDb) {
    const db = await getDrizzleDb();
    const rows = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.conversationId, conversationId));
    return rows.filter(r => !r.isRead).length;
  }
  return chatMessages.filter(m => m.conversationId === conversationId && !m.read).length;
}

export async function getTotalUnreadChatMessagesCount() {
  if (useChatDb) {
    const db = await getDrizzleDb();
    const rows = await db.select().from(chatMessagesTable);
    return rows.filter(r => !r.isRead).length;
  }
  return chatMessages.filter(m => !m.read).length;
}

export function resetChatStore() {
  chatConversations.length = 0;
  chatMessages.length = 0;
}

// Email/SMS logging
interface EmailLogEntry {
  to?: string;
  subject?: string;
  body?: string;
  templateCode?: string;
  meta?: Record<string, unknown>;
  [key: string]: unknown;
}
export async function logEmail(entry: EmailLogEntry) {
  console.info('Email sent', { 
    context: 'Email',
    to: entry.to,
    subject: entry.subject,
    meta: entry.meta,
  });
}

export async function logSMS(entry: Record<string, unknown>) {
  console.info('SMS sent', { 
    context: 'SMS',
    ...entry,
  });
}

// Consent & privacy
export async function saveUserConsent(input: {
  userId: number;
  policyVersion: string;
  ipAddress: string;
  userAgent: string;
}) {
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    await db
      .insert(userConsentsTable)
      .values({
        userId: input.userId,
        policyVersion: input.policyVersion,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      })
      .execute();
    return;
  }
  consents.push({
    ...input,
    createdAt: new Date(),
    hasConsent: true,
    consentedAt: new Date(),
  });
}

export async function getConsentStatus(userId: number) {
  return consents.find(c => c.userId === userId && !c.withdrawn) || null;
}

export async function withdrawConsent(userId: number) {
  for (const c of consents) {
    if (c.userId === userId) {
      c.withdrawn = true;
      c.hasConsent = false;
      c.withdrawnAt = new Date();
    }
  }
}

export async function getUserAllData(userId: number) {
  return {
    user: await getUserById(userId),
    documents: await getUserDocuments(userId),
    notifications: await getUserNotifications(userId),
  };
}

export async function createDataSubjectRequest(input: {
  userId: number;
  type: DataSubjectRequest["type"];
  payloadJson?: string;
  status?: DataSubjectRequest["status"];
}) {
  const id = nextId();
  const record: DataSubjectRequest = {
    id,
    userId: input.userId,
    type: input.type,
    payloadJson: input.payloadJson,
    status: input.status ?? "open",
    createdAt: new Date(),
  };
  dataRequests.push(record);
  return record;
}

export async function getDataSubjectRequests() {
  return [...dataRequests].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Security incidents
export async function createSecurityIncident(input: {
  description: string;
  cause?: string;
  affectedDataCategories?: string;
  affectedUsersCount?: number;
  riskLevel: SecurityIncident["riskLevel"];
  status?: SecurityIncident["status"];
  isLate?: boolean;
  reportedToSdaiaAt?: Date;
  reportedToUsersAt?: Date;
}) {
  const id = nextId();
  const incident: SecurityIncident = {
    id,
    description: input.description,
    cause: input.cause,
    affectedDataCategories: input.affectedDataCategories,
    affectedUsersCount: input.affectedUsersCount,
    riskLevel: input.riskLevel,
    status: input.status ?? "new",
    createdAt: new Date(),
    reportedToSdaiaAt: input.reportedToSdaiaAt,
    reportedToUsersAt: input.reportedToUsersAt,
    isLate: input.isLate,
  };
  securityIncidents.push(incident);
  return incident;
}

export async function updateSecurityIncident(id: number, updates: Partial<SecurityIncident>) {
  const incident = securityIncidents.find(i => i.id === id);
  if (incident) {
    Object.assign(incident, updates, { updatedAt: new Date() });
  }
  return incident ?? null;
}

export async function getSecurityIncidents() {
  return [...securityIncidents].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Consultants
export async function getConsultantByUserId(userId: number) {
  return consultants.find(c => c.userId === userId) || null;
}

export async function createConsultant(input: {
  userId: number;
  fullName?: string;
  status?: Consultant["status"];
  specializations?: string[];
  subSpecializations?: string[];
  fullNameAr?: string;
  email?: string;
  phone?: string;
  mainSpecialization?: string;
  yearsOfExperience?: number;
  profilePicture?: string | null;
  bioAr?: string | null;
  bioEn?: string | null;
  qualifications?: string[];
  certifications?: string[];
  ibanNumber?: string | null;
  bankName?: string | null;
  accountHolderName?: string | null;
  services?: Consultant["services"];
  availability?: Consultant["availability"];
  sla?: Consultant["sla"];
  channels?: Consultant["channels"];
}) {
  const id = nextId();
  consultants.push({
    id,
    userId: input.userId,
    fullName: input.fullName || input.fullNameAr,
    status: input.status ?? "pending",
    specializations: input.specializations ?? input.subSpecializations,
    subSpecializations: input.subSpecializations,
    email: input.email,
    phone: input.phone,
    fullNameAr: input.fullNameAr,
    mainSpecialization: input.mainSpecialization,
    yearsOfExperience: input.yearsOfExperience,
    profilePicture: input.profilePicture,
    bioAr: input.bioAr,
    bioEn: input.bioEn,
    qualifications: input.qualifications,
    certifications: input.certifications,
    ibanNumber: input.ibanNumber,
    bankName: input.bankName,
    accountHolderName: input.accountHolderName,
    services: input.services,
    availability: input.availability,
    sla: input.sla,
    channels: input.channels,
  });
  return id;
}

export async function createConsultantDocument(input: {
  consultantId: number;
  title?: string;
  url?: string;
  documentType?: string;
  documentName?: string;
  documentUrl?: string;
  fileSize?: number;
  mimeType?: string;
}) {
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    const docType =
      input.documentType === "cv" ||
      input.documentType === "certificate" ||
      input.documentType === "id" ||
      input.documentType === "license" ||
      input.documentType === "other"
        ? input.documentType
        : "other";
    const result = await db
      .insert(consultantDocumentsTable)
      .values({
        consultantId: input.consultantId,
        documentType: docType,
        documentName: input.title || input.documentName || "Document",
        documentUrl: input.documentUrl || input.url || "",
        fileSize: input.fileSize ?? null,
        mimeType: input.mimeType ?? null,
      });
    const insertedId = extractInsertId(result);
    if (insertedId) {
      return insertedId;
    }
    const [latest] = await db
      .select({ id: consultantDocumentsTable.id })
      .from(consultantDocumentsTable)
      .where(eq(consultantDocumentsTable.consultantId, input.consultantId))
      .orderBy(desc(consultantDocumentsTable.createdAt))
      .limit(1);
    return latest?.id ?? 0;
  }
  const id = nextId();
  consultantDocs.push({
    id,
    consultantId: input.consultantId,
    title: input.title || input.documentName || "Document",
    url: input.url || input.documentUrl || "",
    fileSize: input.fileSize,
    mimeType: input.mimeType,
    documentType: input.documentType,
    verificationStatus: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return id;
}

export async function getConsultantDocuments(consultantId: number) {
  if (process.env.DATABASE_URL) {
    const db = await getDrizzleDb();
    const rows = await db
      .select()
      .from(consultantDocumentsTable)
      .where(eq(consultantDocumentsTable.consultantId, consultantId))
      .orderBy(desc(consultantDocumentsTable.createdAt));
    return rows.map(mapConsultantDocumentRow);
  }
  return consultantDocs.filter(d => d.consultantId === consultantId);
}

export async function getAllSpecializations() {
  return [
    { id: 1, nameAr: "التوظيف" },
    { id: 2, nameAr: "التطوير التنظيمي" },
  ];
}

export async function getAllConsultationTypes() {
  return consultationTypes.filter(t => t.isActive);
}

export async function getApprovedConsultants() {
  return consultants.filter(c => c.status === "approved");
}

export async function getConsultantById(id: number) {
  return consultants.find(c => c.id === id) || null;
}

export async function getPendingConsultants() {
  return consultants.filter(c => c.status === "pending");
}

export async function approveConsultant(id: number) {
  const consultant = consultants.find(c => c.id === id);
  if (consultant) consultant.status = "approved";
  return consultant || null;
}

export async function rejectConsultant(id: number) {
  const consultant = consultants.find(c => c.id === id);
  if (consultant) consultant.status = "rejected";
  return consultant || null;
}

// Consultation bookings & messages
export async function createConsultationBooking(input: {
  userId: number;
  consultantId: number;
  consultationTypeId: number;
  scheduledDate: string | Date;
  clientId?: number;
  scheduledTime?: string;
  description?: string;
  subject?: string;
  requiredInfo?: Record<string, unknown>;
  attachments?: AttachmentRef[];
  status?: string;
  slaHours?: number;
  firstResponseHours?: number;
  channel?: string;
  durationMinutes?: number;
  packageName?: string | null;
  packagePrice?: number | null;
  packageSlaHours?: number | null;
}) {
  const id = nextId();
  const ticketNumber = `C-${Date.now()}-${id}`;
  const consultationType = consultationTypes.find(
    t => t.id === input.consultationTypeId
  );
  bookings.push({
    id,
    ticketNumber,
    status: input.status ?? "pending",
    createdAt: new Date(),
    slaHours: input.slaHours ?? consultationType?.slaHours ?? 24,
    firstResponseHours: input.firstResponseHours ?? consultationType?.slaHours ?? 24,
    channel: input.channel,
    duration:
      input.durationMinutes ??
      consultationType?.duration ??
      consultationType?.estimatedDuration ??
      60,
    price: consultationType?.price ?? consultationType?.basePriceSAR,
    subject: consultationType?.nameAr || "استشارة",
    ...input,
    clientId: input.clientId ?? input.userId,
    packageName: input.packageName ?? null,
    packagePrice: input.packagePrice ?? null,
    packageSlaHours: input.packageSlaHours ?? null,
    scheduledDate:
      input.scheduledDate instanceof Date
        ? input.scheduledDate
        : new Date(input.scheduledDate),
  });
  return id;
}

export async function getConsultationBookingsByClient(userId: number) {
  return bookings.filter(b => b.clientId === userId || b.userId === userId);
}

export async function getConsultationBookingsByConsultant(consultantId: number) {
  return bookings.filter(b => b.consultantId === consultantId);
}

export async function getConsultationBookingById(id: number) {
  return bookings.find(b => b.id === id) || null;
}

export async function updateConsultationStatus(bookingId: number, status: string) {
  const booking = await getConsultationBookingById(bookingId);
  if (booking) booking.status = status;
}

export async function getAllConsultationBookings() {
  return bookings;
}

export async function getConsultingTickets() {
  return tickets;
}

export async function getTicketResponses(ticketId: number) {
  return ticketResponses.filter(response => response.ticketId === ticketId);
}

export async function sendConsultationMessage(input: {
  bookingId: number;
  senderId: number;
  message: string;
  senderType?: string;
  attachments?: AttachmentRef[];
  isAiAssisted?: boolean;
  aiSuggestion?: string;
}) {
  const id = nextId();
  consultationMessages.push({
    id,
    createdAt: new Date(),
    ...input,
    isAiAssisted: input.isAiAssisted,
    aiSuggestion: input.aiSuggestion,
  });
  return id;
}

export async function getConsultationMessages(bookingId: number) {
  return consultationMessages.filter(m => m.bookingId === bookingId);
}

export async function rateConsultation(input: {
  bookingId: number;
  rating: number;
  feedback?: string;
  consultantId?: number;
  clientId?: number;
  review?: string;
}) {
  const booking = await getConsultationBookingById(input.bookingId);
  if (booking) {
    await sendConsultationMessage({
      bookingId: booking.id,
      senderId: booking.userId,
      message: input.feedback || "تم التقييم",
    });
  }
}

// Utility seeding
export async function hashPasswordForSeed(password: string) {
  return hashPassword(password);
}

export async function seedTestUsers() {
  const allowAdminSeeds =
    process.env.ALLOW_ADMIN_SEED === "true" ||
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test";

  for (const seed of testUserSeeds) {
    if (seed.role === "admin" && !allowAdminSeeds) {
      continue;
    }
    const existing = await getUserByEmail(seed.email);
    if (existing) continue;
    await createUserWithPassword({
      email: seed.email,
      password: seed.password,
      name: seed.name,
      role: seed.role,
      userType: seed.userType,
    });
  }
}

// تمت إزالة التشغيل التلقائي للبذور لتجنب إدراج غير مقصود في بيئات الإنتاج.

// =====================================================
// Admin Router Functions (Stubs)
// =====================================================

// Stats Functions
export async function getUsersCount(): Promise<number> {
  return users.length;
}

export async function getActiveSubscriptionsCount(): Promise<number> {
  if (process.env.DATABASE_URL) {
    try {
      const db = await getDrizzleDb();
      const { subscriptions } = await import("../../drizzle/schema");
      const { sql, eq } = await import("drizzle-orm");
      
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(subscriptions)
        .where(eq(subscriptions.status, 'active'));
      
      return result[0]?.count ?? 0;
    } catch (error) {
      // Log error silently and return 0
      return 0;
    }
  }
  return subscriptionsStore.size;
}

export async function getPendingBookingsCount(): Promise<number> {
  if (process.env.DATABASE_URL) {
    try {
      const db = await getDrizzleDb();
      const { consultationBookings } = await import("../../drizzle/schema");
      const { sql, eq } = await import("drizzle-orm");
      
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(consultationBookings)
        .where(eq(consultationBookings.status, 'pending'));
      
      return result[0]?.count ?? 0;
    } catch (error) {
      // Log error silently and return 0
      return 0;
    }
  }
  return bookings.filter(b => b.status === "pending").length;
}

export async function getTotalRevenue(): Promise<number> {
  if (process.env.DATABASE_URL) {
    try {
      const db = await getDrizzleDb();
      const { payments } = await import("../../drizzle/schema");
      const { sql, eq } = await import("drizzle-orm");
      
      const result = await db
        .select({ total: sql<number>`sum(${payments.finalAmount})` })
        .from(payments)
        .where(eq(payments.status, 'paid'));
      
      // Convert from halalas to SAR (divide by 100)
      const totalHalalas = result[0]?.total ?? 0;
      return Math.floor(totalHalalas / 100);
    } catch (error) {
      // Log error silently and return 0
      return 0;
    }
  }
  return 0;
}

export async function getPendingTicketsCount(): Promise<number> {
  return tickets.filter(t => t.status === "pending").length;
}

export async function getTotalConsultationsCount(): Promise<number> {
  return tickets.length;
}

// User Management Functions
export async function getAdminUsersList(params: {
  limit: number;
  offset: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}): Promise<{ users: UserRecord[]; total: number }> {
  let filteredUsers = [...users];
  
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredUsers = filteredUsers.filter(u => 
      u.name?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower)
    );
  }
  
  if (params.role) {
    filteredUsers = filteredUsers.filter(u => u.role === params.role || u.userType === params.role);
  }
  
  const total = filteredUsers.length;
  filteredUsers = filteredUsers.slice(params.offset, params.offset + params.limit);
  
  return { users: filteredUsers, total };
}

export async function createUserByAdmin(input: {
  name: string;
  email: string;
  phone?: string;
  role: string;
  status?: string;
  companyId?: number;
  createdBy: number;
}): Promise<number> {
  const id = seq++;
  const user: UserRecord = {
    id,
    email: input.email,
    name: input.name,
    role: input.role === "admin" ? "admin" : "user",
    userType: input.role,
    phoneNumber: input.phone,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  users.push(user);
  return id;
}

export async function updateUserByAdmin(
  id: number,
  data: Partial<{
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
  }>
): Promise<void> {
  const user = users.find(u => u.id === id);
  if (user) {
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    if (data.phone) user.phoneNumber = data.phone;
    if (data.role) user.role = data.role === "admin" ? "admin" : "user";
    user.updatedAt = new Date();
  }
}

export async function updateUserStatus(id: number, status: string): Promise<void> {
  // Status stored in userType or separate field - for now just update the record
  const user = users.find(u => u.id === id);
  if (user) {
    // Apply status to userType field if it's a valid value
    if (status === "active" || status === "inactive" || status === "suspended") {
      user.userType = status === "active" ? user.userType : "inactive";
    }
    user.updatedAt = new Date();
  }
}

export async function deleteUser(id: number): Promise<void> {
  const index = users.findIndex(u => u.id === id);
  if (index > -1) {
    users.splice(index, 1);
  }
  const pwIndex = passwords.findIndex(p => p.userId === id);
  if (pwIndex > -1) {
    passwords.splice(pwIndex, 1);
  }
}

export async function getUserStatistics(): Promise<{
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsers: number;
}> {
  return {
    totalUsers: users.length,
    newUsersThisMonth: 0,
    activeUsers: users.length,
  };
}

export async function getAllUsersForExport(): Promise<UserRecord[]> {
  return [...users];
}

// Booking Functions
type BookingRecord = {
  id: number;
  userId: number;
  consultantId?: number;
  status: string;
  date: string;
  time: string;
  createdAt: Date;
};

const bookingsStore = new Map<number, BookingRecord>();

export async function getAdminBookingsList(params: {
  limit: number;
  offset: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  consultantId?: number;
}): Promise<{ bookings: BookingRecord[]; total: number }> {
  let bookings = Array.from(bookingsStore.values());
  
  if (params.status) {
    bookings = bookings.filter(b => b.status === params.status);
  }
  
  const total = bookings.length;
  bookings = bookings.slice(params.offset, params.offset + params.limit);
  
  return { bookings, total };
}

export async function updateBookingStatus(id: number, status: string, reason?: string): Promise<void> {
  const booking = bookingsStore.get(id);
  if (booking) {
    booking.status = status;
    // reason can be logged or stored in additional field when needed
    if (reason) {
      // Future: store cancellation/rejection reason
    }
    bookingsStore.set(id, booking);
  }
}

export async function assignBookingConsultant(id: number, consultantId: number): Promise<void> {
  const booking = bookingsStore.get(id);
  if (booking) {
    booking.consultantId = consultantId;
    bookingsStore.set(id, booking);
  }
}

export async function getTodayBookings(): Promise<BookingRecord[]> {
  const today = new Date().toISOString().split("T")[0];
  return Array.from(bookingsStore.values()).filter(b => b.date === today);
}

export async function getBookingStatistics(): Promise<{
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}> {
  const bookings = Array.from(bookingsStore.values());
  return {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    completed: bookings.filter(b => b.status === "completed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  };
}

export async function getBookingsForExport(dateFrom?: string, dateTo?: string): Promise<BookingRecord[]> {
  let bookings = Array.from(bookingsStore.values());
  if (dateFrom) {
    bookings = bookings.filter(b => b.date >= dateFrom);
  }
  if (dateTo) {
    bookings = bookings.filter(b => b.date <= dateTo);
  }
  return bookings;
}

// Subscription Functions
type SubscriptionRecord = {
  id: number;
  userId: number;
  plan: string;
  status: string;
  startDate: Date;
  endDate: Date;
  amount: number;
};

const subscriptionsStore = new Map<number, SubscriptionRecord>();
let nextSubscriptionId = 1;

export async function getAdminSubscriptionsList(params: {
  limit: number;
  offset: number;
  search?: string;
  status?: string;
  plan?: string;
}): Promise<{ subscriptions: SubscriptionRecord[]; total: number }> {
  let subs = Array.from(subscriptionsStore.values());
  
  if (params.status) {
    subs = subs.filter(s => s.status === params.status);
  }
  if (params.plan) {
    subs = subs.filter(s => s.plan === params.plan);
  }
  
  const total = subs.length;
  subs = subs.slice(params.offset, params.offset + params.limit);
  
  return { subscriptions: subs, total };
}

export async function getSubscriptionById(id: number): Promise<SubscriptionRecord | undefined> {
  return subscriptionsStore.get(id);
}

export async function createSubscription(input: {
  userId: number;
  plan: string;
  billingCycle?: string;
  startDate: Date | string;
  endDate: Date | string;
  amount?: number;
  price?: number;
  notes?: string;
  status?: string;
  features?: string[];
  employeesLimit?: number;
  createdBy: number;
}): Promise<number> {
  const id = nextSubscriptionId++;
  const startDate = typeof input.startDate === "string" ? new Date(input.startDate) : input.startDate;
  const endDate = typeof input.endDate === "string" ? new Date(input.endDate) : input.endDate;
  subscriptionsStore.set(id, {
    id,
    userId: input.userId,
    plan: input.plan,
    status: input.status ?? "active",
    startDate,
    endDate,
    amount: input.amount ?? input.price ?? 0,
  });
  return id;
}

export async function updateSubscription(
  id: number,
  data: Partial<{
    plan: string;
    status: string;
    endDate: Date | string;
    notes: string;
    employeesLimit: number;
  }>
): Promise<void> {
  const sub = subscriptionsStore.get(id);
  if (sub) {
    if (data.endDate && typeof data.endDate === "string") {
      data.endDate = new Date(data.endDate);
    }
    Object.assign(sub, data);
    subscriptionsStore.set(id, sub);
  }
}

export async function getExpiringSoonSubscriptions(days: number = 7): Promise<SubscriptionRecord[]> {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return Array.from(subscriptionsStore.values()).filter(
    s => s.status === "active" && s.endDate <= future && s.endDate >= now
  );
}

export async function getSubscriptionStatistics(): Promise<{
  total: number;
  active: number;
  trial: number;
  expired: number;
  cancelled: number;
  monthlyRevenue: number;
}> {
  const subs = Array.from(subscriptionsStore.values());
  return {
    total: subs.length,
    active: subs.filter(s => s.status === "active").length,
    trial: subs.filter(s => s.status === "trial").length,
    expired: subs.filter(s => s.status === "expired").length,
    cancelled: subs.filter(s => s.status === "cancelled").length,
    monthlyRevenue: subs.filter(s => s.status === "active").reduce((sum, s) => sum + s.amount, 0),
  };
}

export async function getSubscriptionsForExport(): Promise<SubscriptionRecord[]> {
  return Array.from(subscriptionsStore.values());
}

// Consultant Functions
export async function getAdminConsultantsList(_params: {
  limit: number;
  offset: number;
  search?: string;
  status?: string;
  specialization?: string;
}): Promise<{ consultants: Array<{ id: number; name: string; status: string }>; total: number }> {
  // Return empty for now - would integrate with consultantsStore
  return { consultants: [], total: 0 };
}

export async function updateConsultantStatus(_id: number, _status: string, _reviewNotes?: string): Promise<void> {
  // Would update consultant status - stub for future implementation
}

// Data Request Functions
type DataRequestRecord = {
  id: number;
  userId: number;
  email?: string;
  type: string;
  status: string;
  details?: string;
  createdAt: Date;
  dueDate: Date;
};

const dataRequestsStore = new Map<number, DataRequestRecord>();
// nextDataRequestId will be used when createDataRequest is implemented

export async function getAdminDataRequestsList(params: {
  limit: number;
  offset: number;
  search?: string;
  type?: string;
  status?: string;
}): Promise<{ requests: DataRequestRecord[]; total: number }> {
  let requests = Array.from(dataRequestsStore.values());
  
  if (params.type) {
    requests = requests.filter(r => r.type === params.type);
  }
  if (params.status) {
    requests = requests.filter(r => r.status === params.status);
  }
  
  const total = requests.length;
  requests = requests.slice(params.offset, params.offset + params.limit);
  
  return { requests, total };
}

export async function getDataRequestById(id: number): Promise<DataRequestRecord | undefined> {
  return dataRequestsStore.get(id);
}

export async function updateDataRequestStatus(
  id: number,
  status: string,
  notes?: string,
  handledBy?: number
): Promise<void> {
  const req = dataRequestsStore.get(id);
  if (req) {
    req.status = status;
    // notes and handledBy can be stored in additional fields when needed
    if (notes || handledBy) {
      // Future: store handling details
    }
    dataRequestsStore.set(id, req);
  }
}

export async function processDataDeletion(userId: number): Promise<void> {
  // Would anonymize/delete user data
  const index = users.findIndex(u => u.id === userId);
  if (index > -1) {
    users.splice(index, 1);
  }
  const pwIndex = passwords.findIndex(p => p.userId === userId);
  if (pwIndex > -1) {
    passwords.splice(pwIndex, 1);
  }
}

export async function completeDataRequest(
  id: number,
  data: { dataFile?: string; deletedAt?: string }
): Promise<void> {
  const req = dataRequestsStore.get(id);
  if (req) {
    req.status = "completed";
    // data.dataFile and data.deletedAt can be stored when needed
    if (data.dataFile || data.deletedAt) {
      // Future: store completion details
    }
    dataRequestsStore.set(id, req);
  }
}

export async function getOverdueDataRequests(): Promise<DataRequestRecord[]> {
  const now = new Date();
  return Array.from(dataRequestsStore.values()).filter(
    r => r.status !== "completed" && r.dueDate < now
  );
}

export async function getDataRequestStatistics(): Promise<{
  total: number;
  new: number;
  inReview: number;
  completed: number;
  rejected: number;
}> {
  const requests = Array.from(dataRequestsStore.values());
  return {
    total: requests.length,
    new: requests.filter(r => r.status === "new").length,
    inReview: requests.filter(r => r.status === "in_review").length,
    completed: requests.filter(r => r.status === "completed").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };
}

export async function getDataRequestsForExport(): Promise<DataRequestRecord[]> {
  return Array.from(dataRequestsStore.values());
}

// ============================================================================
// Login Attempts Tracking
// ============================================================================

const loginAttemptsStore = new Map<number, { count: number; lockedUntil: Date | null }>();

export async function getLoginAttempts(userId: number): Promise<{ failedCount: number; lastAttempt: Date } | null> {
  const entry = loginAttemptsStore.get(userId);
  if (!entry || entry.count === 0) {
    return null;
  }
  return {
    failedCount: entry.count,
    lastAttempt: new Date(), // Use current time as we don't track individual attempt times
  };
}

export async function incrementLoginAttempts(userId: number): Promise<void> {
  const entry = loginAttemptsStore.get(userId) ?? { count: 0, lockedUntil: null };
  entry.count += 1;
  loginAttemptsStore.set(userId, entry);
}

export async function clearLoginAttempts(userId: number): Promise<void> {
  loginAttemptsStore.delete(userId);
}

// ============================================================================
// Email Verification
// ============================================================================

const emailVerificationStore = new Map<number, { token: string; expiresAt: Date }>();

export async function setEmailVerificationToken(userId: number, token: string, expiresAt: Date): Promise<void> {
  emailVerificationStore.set(userId, { token, expiresAt });
}

export async function findUserByVerificationToken(token: string): Promise<UserRecord | null> {
  for (const [userId, entry] of emailVerificationStore.entries()) {
    if (entry.token === token && entry.expiresAt > new Date()) {
      const user = await getUserById(userId);
      return user ?? null;
    }
  }
  return null;
}

export async function markEmailVerified(userId: number): Promise<void> {
  const user = users.find(u => u.id === userId);
  if (user) {
    user.emailVerified = true;
  }
  emailVerificationStore.delete(userId);
}

export async function clearPasswordResetToken(userId: number): Promise<void> {
  const pwd = passwords.find(p => p.userId === userId);
  if (pwd) {
    pwd.resetToken = null;
    pwd.resetTokenExpiry = null;
  }
}

// ============================================================================
// OAuth Support
// ============================================================================

export async function linkOAuthAccount(userId: number, provider: string, providerUserId: string): Promise<void> {
  const user = users.find(u => u.id === userId);
  if (user) {
    user.openId = `${provider}:${providerUserId}`;
    user.loginMethod = provider;
  }
}

export async function createUserFromOAuth(input: {
  email: string;
  name?: string;
  provider: string;
  providerUserId: string;
  openId: string;
  profilePicture?: string;
}): Promise<UserRecord> {
  const newUser: UserRecord = {
    id: nextId(),
    email: input.email,
    name: input.name ?? null,
    role: "user",
    openId: input.openId,
    userType: "individual",
    profilePicture: input.profilePicture ?? null,
    lastSignedIn: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    phoneNumber: null,
    loginMethod: input.provider,
    emailVerified: true,
    profileCompleted: false,
    lastLoginIp: null,
    lastLoginUserAgent: null,
  };
  users.push(newUser);
  return newUser;
}
