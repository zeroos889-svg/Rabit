/**
 * Consultation Booking Helper Functions
 * دوال مساعدة لتبسيط منطق حجز الاستشارات المعقد
 */

import * as db from "./db";
import { TRPCError } from "@trpc/server";

interface TimeSlot {
  startMinutes: number;
  endMinutes: number;
}

interface BookingConflictCheck {
  consultantId: number;
  bookingDate: Date;
  bookingSlot: TimeSlot;
  durationMinutes: number;
}

/**
 * تحويل الوقت (HH:MM) إلى دقائق
 */
export function parseTimeToMinutes(value?: string): number | null {
  if (!value) return null;
  
  const parts = value.split(":").map(Number);
  if (parts.length !== 2 || parts.some(part => Number.isNaN(part))) {
    return null;
  }
  
  return parts[0] * 60 + parts[1];
}

/**
 * التحقق من توفر المستشار في اليوم المحدد
 */
export function checkDayAvailability(params: {
  consultant: { availability?: Array<{ day: string; active: boolean }> | null };
  bookingDate: Date;
}): { isAvailable: boolean; dayName: string } {
  const { consultant, bookingDate } = params;
  
  const dayNames = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];
  
  const dayName = dayNames[bookingDate.getDay()];
  
  // إذا لم يكن هناك جدول متاح، اعتبر أن المستشار متاح في جميع الأيام
  if (!consultant.availability || consultant.availability.length === 0) {
    return { isAvailable: true, dayName };
  }
  
  // تحقق من أن اليوم مفعل في جدول المستشار
  const isAvailable = consultant.availability.some(
    slot => slot.day === dayName && slot.active
  );
  
  return { isAvailable, dayName };
}

/**
 * فحص التعارض مع الحجوزات الموجودة
 */
export async function checkBookingConflict(params: BookingConflictCheck): Promise<boolean> {
  const { consultantId, bookingDate, bookingSlot, durationMinutes } = params;
  
  const existingBookings = await db.getConsultationBookingsByConsultant(consultantId);
  
  const hasConflict = existingBookings.some(booking => {
    // تحقق من أن الحجز في نفس اليوم
    const sameDay = new Date(booking.scheduledDate).toDateString() === bookingDate.toDateString();
    if (!sameDay) return false;
    
    // احسب وقت بداية ونهاية الحجز الموجود
    const existingStart = parseTimeToMinutes(booking.scheduledTime);
    if (existingStart === null) return false;
    
    const existingDuration = typeof booking.duration === "number" && booking.duration > 0
      ? booking.duration
      : durationMinutes;
    const existingEnd = existingStart + existingDuration;
    
    // تحقق من أن الحجز ليس ملغياً أو مكتملاً
    const activeStatus = !["cancelled", "completed", "no-show"].includes(booking.status);
    
    // تحقق من التعارض الزمني
    const overlaps = bookingSlot.startMinutes < existingEnd && 
                     existingStart < bookingSlot.endMinutes;
    
    return activeStatus && overlaps;
  });
  
  return hasConflict;
}

/**
 * استخراج معلومات SLA من المستشار
 */
export function extractSlaInfo(consultant: {
  sla?: { deliveryHours?: string | number; responseHours?: string | number } | null;
}): {
  slaHours?: number;
  firstResponseHours?: number;
} {
  const slaHours = consultant.sla?.deliveryHours
    ? Number(consultant.sla.deliveryHours)
    : undefined;
    
  const firstResponseHours = consultant.sla?.responseHours
    ? Number(consultant.sla.responseHours)
    : undefined;
    
  return { slaHours, firstResponseHours };
}

/**
 * تحديد القناة المفضلة للمستشار
 */
export function determinePreferredChannel(consultant: {
  channels?: { inPerson?: boolean; voice?: boolean; chat?: boolean } | null;
}): string | undefined {
  if (!consultant.channels) return undefined;
  
  if (consultant.channels.inPerson) return "inPerson";
  if (consultant.channels.voice) return "voice";
  if (consultant.channels.chat) return "chat";
  
  return undefined;
}

/**
 * تحليل معلومات إضافية من JSON
 */
export function parseRequiredInfo(requiredInfo?: string): Record<string, unknown> | undefined {
  if (!requiredInfo) return undefined;
  
  try {
    return JSON.parse(requiredInfo);
  } catch {
    return { raw: requiredInfo };
  }
}

/**
 * بناء ملاحظة الباقة للمستشار
 */
export function buildPackageNote(params: {
  packageName?: string;
  packagePrice?: number;
  packageSlaHours?: number;
}): string | null {
  const { packageName, packagePrice, packageSlaHours } = params;
  
  const packageNoteParts = [
    packageName ? `الباقة: ${packageName}` : null,
    packagePrice !== null && packagePrice !== undefined 
      ? `السعر: ${packagePrice} ريال` 
      : null,
    packageSlaHours ? `SLA: ${packageSlaHours} ساعة` : null,
  ].filter(Boolean);
  
  if (packageNoteParts.length === 0) return null;
  
  return `تفاصيل الباقة المختارة:\n${packageNoteParts.join(" | ")}`;
}

/**
 * التحقق من المستشار وحالته
 */
export async function verifyConsultantStatus(consultantId: number): Promise<void> {
  const consultant = await db.getConsultantById(consultantId);
  
  if (consultant?.status !== "approved") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "المستشار غير متاح",
    });
  }
}

/**
 * الحصول على مدة الاستشارة من النوع
 */
export function getConsultationDuration(consultationType?: {
  duration?: number;
  estimatedDuration?: number;
}): number {
  if (!consultationType) return 60;
  
  return consultationType.duration ?? consultationType.estimatedDuration ?? 60;
}
