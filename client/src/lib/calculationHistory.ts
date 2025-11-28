/**
 * سجل الحسابات - Calculation History Storage
 * نظام لحفظ واسترجاع تاريخ الحسابات المالية
 */

// أنواع الحسابات المدعومة
export type CalculationType = 'gosi' | 'eosb' | 'leave' | 'saudization' | 'compliance';

// واجهة السجل الأساسية
export interface CalculationRecord {
  id: string;
  type: CalculationType;
  timestamp: number;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  metadata?: {
    employeeName?: string;
    employeeId?: string;
    department?: string;
    notes?: string;
  };
}

// واجهة سجل GOSI
export interface GOSIRecord extends CalculationRecord {
  type: 'gosi';
  inputs: {
    basicSalary: number;
    housingAllowance: number;
    isNonSaudi: boolean;
    employerContributionRate: number;
    employeeContributionRate: number;
  };
  outputs: {
    employeeContribution: number;
    employerContribution: number;
    totalContribution: number;
    totalInsurableSalary: number;
  };
}

// واجهة سجل نهاية الخدمة
export interface EOSBRecord extends CalculationRecord {
  type: 'eosb';
  inputs: {
    basicSalary: number;
    allowances: number;
    yearsOfService: number;
    terminationReason: string;
    contractType: string;
  };
  outputs: {
    totalAmount: number;
    yearsCalculation: string;
    eligibilityPercentage: number;
    breakdown: {
      firstFiveYears: number;
      afterFiveYears: number;
    };
  };
}

// واجهة سجل الإجازات
export interface LeaveRecord extends CalculationRecord {
  type: 'leave';
  inputs: {
    yearsOfService: number;
    usedDays: number;
    carryOverDays: number;
    dailySalary: number;
  };
  outputs: {
    annualEntitlement: number;
    remainingDays: number;
    totalAccrued: number;
    cashValue: number;
  };
}

// واجهة سجل السعودة
export interface SaudizationRecord extends CalculationRecord {
  type: 'saudization';
  inputs: {
    totalEmployees: number;
    saudiEmployees: number;
    sector: string;
  };
  outputs: {
    currentPercentage: number;
    requiredPercentage: number;
    isCompliant: boolean;
    shortfall: number;
  };
}

// واجهة سجل الامتثال
export interface ComplianceRecord extends CalculationRecord {
  type: 'compliance';
  inputs: {
    checkType: string;
    parameters: Record<string, unknown>;
  };
  outputs: {
    status: 'compliant' | 'non-compliant' | 'warning';
    score: number;
    issues: string[];
    recommendations: string[];
  };
}

// Union type لجميع السجلات
export type AnyCalculationRecord = 
  | GOSIRecord 
  | EOSBRecord 
  | LeaveRecord 
  | SaudizationRecord 
  | ComplianceRecord;

// مفتاح التخزين في localStorage
const STORAGE_KEY = 'rabt_calculation_history';
const MAX_RECORDS = 100; // الحد الأقصى للسجلات المحفوظة

/**
 * توليد معرف فريد للسجل
 */
function generateId(): string {
  return `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * استرجاع جميع السجلات من localStorage
 */
export function getAllRecords(): AnyCalculationRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const records = JSON.parse(stored) as AnyCalculationRecord[];
    // ترتيب حسب التاريخ (الأحدث أولاً)
    return records.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error reading calculation history:', error);
    return [];
  }
}

/**
 * استرجاع السجلات حسب النوع
 */
export function getRecordsByType<T extends AnyCalculationRecord>(
  type: T['type']
): T[] {
  const allRecords = getAllRecords();
  return allRecords.filter(r => r.type === type) as T[];
}

/**
 * استرجاع سجل واحد بمعرفه
 */
export function getRecordById(id: string): AnyCalculationRecord | null {
  const allRecords = getAllRecords();
  return allRecords.find(r => r.id === id) || null;
}

/**
 * حفظ سجل جديد
 */
export function saveRecord<T extends AnyCalculationRecord>(
  record: Omit<T, 'id' | 'timestamp'>
): T {
  const newRecord = {
    ...record,
    id: generateId(),
    timestamp: Date.now(),
  } as T;

  const records = getAllRecords();
  records.unshift(newRecord);

  // الحفاظ على الحد الأقصى للسجلات
  const trimmedRecords = records.slice(0, MAX_RECORDS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedRecords));
  } catch (error) {
    console.error('Error saving calculation record:', error);
    // محاولة حذف السجلات القديمة في حالة امتلاء التخزين
    const reducedRecords = trimmedRecords.slice(0, Math.floor(MAX_RECORDS / 2));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedRecords));
  }

  return newRecord;
}

/**
 * حفظ سجل GOSI
 */
export function saveGOSIRecord(
  inputs: GOSIRecord['inputs'],
  outputs: GOSIRecord['outputs'],
  metadata?: GOSIRecord['metadata']
): GOSIRecord {
  return saveRecord<GOSIRecord>({
    type: 'gosi',
    inputs,
    outputs,
    metadata,
  });
}

/**
 * حفظ سجل نهاية الخدمة
 */
export function saveEOSBRecord(
  inputs: EOSBRecord['inputs'],
  outputs: EOSBRecord['outputs'],
  metadata?: EOSBRecord['metadata']
): EOSBRecord {
  return saveRecord<EOSBRecord>({
    type: 'eosb',
    inputs,
    outputs,
    metadata,
  });
}

/**
 * حفظ سجل الإجازات
 */
export function saveLeaveRecord(
  inputs: LeaveRecord['inputs'],
  outputs: LeaveRecord['outputs'],
  metadata?: LeaveRecord['metadata']
): LeaveRecord {
  return saveRecord<LeaveRecord>({
    type: 'leave',
    inputs,
    outputs,
    metadata,
  });
}

/**
 * حفظ سجل السعودة
 */
export function saveSaudizationRecord(
  inputs: SaudizationRecord['inputs'],
  outputs: SaudizationRecord['outputs'],
  metadata?: SaudizationRecord['metadata']
): SaudizationRecord {
  return saveRecord<SaudizationRecord>({
    type: 'saudization',
    inputs,
    outputs,
    metadata,
  });
}

/**
 * حفظ سجل الامتثال
 */
export function saveComplianceRecord(
  inputs: ComplianceRecord['inputs'],
  outputs: ComplianceRecord['outputs'],
  metadata?: ComplianceRecord['metadata']
): ComplianceRecord {
  return saveRecord<ComplianceRecord>({
    type: 'compliance',
    inputs,
    outputs,
    metadata,
  });
}

/**
 * حذف سجل
 */
export function deleteRecord(id: string): boolean {
  const records = getAllRecords();
  const index = records.findIndex(r => r.id === id);
  
  if (index === -1) return false;
  
  records.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return true;
}

/**
 * حذف جميع السجلات من نوع معين
 */
export function deleteRecordsByType(type: CalculationType): number {
  const records = getAllRecords();
  const filtered = records.filter(r => r.type !== type);
  const deletedCount = records.length - filtered.length;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return deletedCount;
}

/**
 * مسح جميع السجلات
 */
export function clearAllRecords(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * استرجاع السجلات لفترة زمنية محددة
 */
export function getRecordsByDateRange(
  startDate: Date,
  endDate: Date
): AnyCalculationRecord[] {
  const start = startDate.getTime();
  const end = endDate.getTime();
  
  return getAllRecords().filter(
    r => r.timestamp >= start && r.timestamp <= end
  );
}

/**
 * استرجاع آخر N سجلات
 */
export function getRecentRecords(count: number = 10): AnyCalculationRecord[] {
  return getAllRecords().slice(0, count);
}

/**
 * البحث في السجلات
 */
export function searchRecords(query: string): AnyCalculationRecord[] {
  const lowerQuery = query.toLowerCase();
  
  return getAllRecords().filter(record => {
    // البحث في البيانات الوصفية
    if (record.metadata) {
      const { employeeName, employeeId, department, notes } = record.metadata;
      if (employeeName?.toLowerCase().includes(lowerQuery)) return true;
      if (employeeId?.toLowerCase().includes(lowerQuery)) return true;
      if (department?.toLowerCase().includes(lowerQuery)) return true;
      if (notes?.toLowerCase().includes(lowerQuery)) return true;
    }
    
    // البحث في نوع الحساب
    if (record.type.includes(lowerQuery)) return true;
    
    return false;
  });
}

/**
 * تصدير السجلات كـ JSON
 */
export function exportRecordsAsJSON(records?: AnyCalculationRecord[]): string {
  const toExport = records || getAllRecords();
  return JSON.stringify(toExport, null, 2);
}

/**
 * استيراد السجلات من JSON
 */
export function importRecordsFromJSON(jsonString: string): number {
  try {
    const imported = JSON.parse(jsonString) as AnyCalculationRecord[];
    
    if (!Array.isArray(imported)) {
      throw new Error('Invalid format: expected an array');
    }
    
    const existing = getAllRecords();
    const existingIds = new Set(existing.map(r => r.id));
    
    // إضافة السجلات الجديدة فقط
    const newRecords = imported.filter(r => !existingIds.has(r.id));
    
    const combined = [...newRecords, ...existing]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_RECORDS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
    
    return newRecords.length;
  } catch (error) {
    console.error('Error importing records:', error);
    throw new Error('Failed to import records');
  }
}

/**
 * إحصائيات السجلات
 */
export interface HistoryStats {
  total: number;
  byType: Record<CalculationType, number>;
  lastWeek: number;
  lastMonth: number;
  oldestRecord: number | null;
  newestRecord: number | null;
}

export function getHistoryStats(): HistoryStats {
  const records = getAllRecords();
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
  
  const byType: Record<CalculationType, number> = {
    gosi: 0,
    eosb: 0,
    leave: 0,
    saudization: 0,
    compliance: 0,
  };
  
  let lastWeek = 0;
  let lastMonth = 0;
  
  records.forEach(record => {
    byType[record.type]++;
    if (record.timestamp >= oneWeekAgo) lastWeek++;
    if (record.timestamp >= oneMonthAgo) lastMonth++;
  });
  
  return {
    total: records.length,
    byType,
    lastWeek,
    lastMonth,
    oldestRecord: records.length > 0 ? records[records.length - 1].timestamp : null,
    newestRecord: records.length > 0 ? records[0].timestamp : null,
  };
}

/**
 * تنسيق التاريخ للعرض
 */
export function formatRecordDate(timestamp: number, locale: string = 'ar-SA'): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * الحصول على اسم نوع الحساب
 */
export function getCalculationTypeName(
  type: CalculationType,
  language: 'ar' | 'en' = 'ar'
): string {
  const names: Record<CalculationType, { ar: string; en: string }> = {
    gosi: { ar: 'حساب التأمينات الاجتماعية', en: 'GOSI Calculation' },
    eosb: { ar: 'حساب نهاية الخدمة', en: 'End of Service' },
    leave: { ar: 'حساب الإجازات', en: 'Leave Calculation' },
    saudization: { ar: 'نسبة السعودة', en: 'Saudization' },
    compliance: { ar: 'تقييم الامتثال', en: 'Compliance Check' },
  };
  
  return names[type][language];
}
