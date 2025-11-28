/**
 * AI Alert System - نظام التنبيهات الذكية الاستباقية
 * يراقب الامتثال والمواعيد المهمة ويرسل تنبيهات استباقية
 */

import { loadRegulation } from "./knowledge-base-loader";

// ============================================
// Types & Interfaces
// ============================================

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlertCategory = 
  | 'compliance' 
  | 'contract' 
  | 'leave' 
  | 'saudization' 
  | 'gosi' 
  | 'document' 
  | 'performance'
  | 'salary'
  | 'legal';

export interface Alert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  dueDate?: Date;
  daysRemaining?: number;
  actionRequired: string[];
  actionRequiredAr: string[];
  legalBasis?: string;
  affectedEmployees?: number[];
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface AlertConfig {
  contractExpiryDays: number;
  documentExpiryDays: number;
  probationEndDays: number;
  leaveBalanceThreshold: number;
  nitaqatThreshold: number;
  gosiPaymentDays: number;
}

// ============================================
// Default Configuration
// ============================================

const DEFAULT_CONFIG: AlertConfig = {
  contractExpiryDays: 30,
  documentExpiryDays: 60,
  probationEndDays: 14,
  leaveBalanceThreshold: 5,
  nitaqatThreshold: 5, // 5% قبل الحد الأدنى
  gosiPaymentDays: 5,
};

// ============================================
// Knowledge Base Access
// ============================================

function getLaborLaw() {
  return loadRegulation('labor-law') as Record<string, any>;
}

function getNitaqat() {
  return loadRegulation('nitaqat') as Record<string, any>;
}

function getGOSI() {
  return loadRegulation('gosi') as Record<string, any>;
}

function getViolations() {
  return loadRegulation('violations') as Record<string, any>;
}

// ============================================
// Alert Generation Functions
// ============================================

/**
 * فحص انتهاء العقود
 */
export function checkContractExpiry(
  contracts: Array<{
    employeeId: number;
    employeeName: string;
    contractEndDate: string;
    contractType: string;
  }>,
  config: Partial<AlertConfig> = {}
): Alert[] {
  const { contractExpiryDays } = { ...DEFAULT_CONFIG, ...config };
  const alerts: Alert[] = [];
  const today = new Date();
  
  for (const contract of contracts) {
    const endDate = new Date(contract.contractEndDate);
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= contractExpiryDays && daysRemaining > 0) {
      let severity: AlertSeverity = 'medium';
      if (daysRemaining <= 7) severity = 'critical';
      else if (daysRemaining <= 14) severity = 'high';
      
      alerts.push({
        id: `contract-expiry-${contract.employeeId}`,
        category: 'contract',
        severity,
        title: `Contract Expiring: ${contract.employeeName}`,
        titleAr: `انتهاء عقد: ${contract.employeeName}`,
        message: `Employment contract for ${contract.employeeName} will expire in ${daysRemaining} days on ${endDate.toLocaleDateString('en-SA')}.`,
        messageAr: `سينتهي عقد العمل للموظف ${contract.employeeName} خلال ${daysRemaining} يوم في ${endDate.toLocaleDateString('ar-SA')}.`,
        dueDate: endDate,
        daysRemaining,
        actionRequired: [
          'Decide on contract renewal or termination',
          'Prepare renewal documents if extending',
          'Notify employee of decision',
          'Update records in Qiwa platform'
        ],
        actionRequiredAr: [
          'اتخاذ قرار بشأن تجديد أو إنهاء العقد',
          'تحضير مستندات التجديد إن وُجد',
          'إبلاغ الموظف بالقرار',
          'تحديث السجلات في منصة قوى'
        ],
        legalBasis: 'المادة 55 من نظام العمل',
        affectedEmployees: [contract.employeeId],
        createdAt: today,
        metadata: { contractType: contract.contractType }
      });
    } else if (daysRemaining <= 0) {
      alerts.push({
        id: `contract-expired-${contract.employeeId}`,
        category: 'contract',
        severity: 'critical',
        title: `Contract EXPIRED: ${contract.employeeName}`,
        titleAr: `عقد منتهي: ${contract.employeeName}`,
        message: `Employment contract for ${contract.employeeName} has EXPIRED ${Math.abs(daysRemaining)} days ago!`,
        messageAr: `انتهى عقد العمل للموظف ${contract.employeeName} منذ ${Math.abs(daysRemaining)} يوم!`,
        dueDate: endDate,
        daysRemaining: 0,
        actionRequired: [
          'URGENT: Renew or terminate contract immediately',
          'Risk of labor violations and fines'
        ],
        actionRequiredAr: [
          'عاجل: تجديد أو إنهاء العقد فوراً',
          'خطر مخالفات عمالية وغرامات'
        ],
        legalBasis: 'المادة 55 من نظام العمل',
        affectedEmployees: [contract.employeeId],
        createdAt: today
      });
    }
  }
  
  return alerts;
}

/**
 * فحص انتهاء المستندات (إقامة، جواز، رخص)
 */
export function checkDocumentExpiry(
  documents: Array<{
    employeeId: number;
    employeeName: string;
    documentType: 'iqama' | 'passport' | 'work_permit' | 'driving_license' | 'professional_license';
    expiryDate: string;
    documentNumber?: string;
  }>,
  config: Partial<AlertConfig> = {}
): Alert[] {
  const { documentExpiryDays } = { ...DEFAULT_CONFIG, ...config };
  const alerts: Alert[] = [];
  const today = new Date();
  
  const documentNames: Record<string, { en: string; ar: string }> = {
    iqama: { en: 'Iqama (Residence Permit)', ar: 'الإقامة' },
    passport: { en: 'Passport', ar: 'جواز السفر' },
    work_permit: { en: 'Work Permit', ar: 'تصريح العمل' },
    driving_license: { en: 'Driving License', ar: 'رخصة القيادة' },
    professional_license: { en: 'Professional License', ar: 'الرخصة المهنية' }
  };
  
  for (const doc of documents) {
    const expiryDate = new Date(doc.expiryDate);
    const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const docName = documentNames[doc.documentType] || { en: doc.documentType, ar: doc.documentType };
    
    if (daysRemaining <= documentExpiryDays && daysRemaining > 0) {
      let severity: AlertSeverity = 'medium';
      if (doc.documentType === 'iqama' || doc.documentType === 'work_permit') {
        if (daysRemaining <= 14) severity = 'critical';
        else if (daysRemaining <= 30) severity = 'high';
      } else {
        if (daysRemaining <= 7) severity = 'high';
      }
      
      alerts.push({
        id: `doc-expiry-${doc.employeeId}-${doc.documentType}`,
        category: 'document',
        severity,
        title: `${docName.en} Expiring: ${doc.employeeName}`,
        titleAr: `انتهاء ${docName.ar}: ${doc.employeeName}`,
        message: `${docName.en} for ${doc.employeeName} will expire in ${daysRemaining} days.`,
        messageAr: `${docName.ar} للموظف ${doc.employeeName} ستنتهي خلال ${daysRemaining} يوم.`,
        dueDate: expiryDate,
        daysRemaining,
        actionRequired: [
          `Initiate ${docName.en} renewal process`,
          'Collect required documents',
          'Submit renewal application'
        ],
        actionRequiredAr: [
          `بدء إجراءات تجديد ${docName.ar}`,
          'جمع المستندات المطلوبة',
          'تقديم طلب التجديد'
        ],
        affectedEmployees: [doc.employeeId],
        createdAt: today,
        metadata: { documentNumber: doc.documentNumber }
      });
    }
  }
  
  return alerts;
}

/**
 * فحص نسبة السعودة ونطاقات
 */
export function checkSaudizationCompliance(
  companyData: {
    sector: string;
    totalEmployees: number;
    saudiEmployees: number;
    currentBand: string;
  },
  config: Partial<AlertConfig> = {}
): Alert[] {
  const { nitaqatThreshold } = { ...DEFAULT_CONFIG, ...config };
  const alerts: Alert[] = [];
  const today = new Date();
  
  const nitaqat = getNitaqat();
  const sectorReq = (nitaqat?.sectorRequirements as Record<string, any>)?.[companyData.sector];
  const minimumRequired = sectorReq?.minimum || 20;
  
  const currentRatio = companyData.totalEmployees > 0 
    ? (companyData.saudiEmployees / companyData.totalEmployees) * 100 
    : 0;
  
  const gap = minimumRequired - currentRatio;
  
  if (companyData.currentBand === 'أحمر' || companyData.currentBand === 'red') {
    alerts.push({
      id: 'nitaqat-red-band',
      category: 'saudization',
      severity: 'critical',
      title: 'CRITICAL: Company in Red Nitaqat Band',
      titleAr: 'حرج: الشركة في النطاق الأحمر',
      message: `Company is in RED Nitaqat band. Current Saudization: ${currentRatio.toFixed(1)}%, Required: ${minimumRequired}%. Immediate action required.`,
      messageAr: `الشركة في النطاق الأحمر. نسبة السعودة الحالية: ${currentRatio.toFixed(1)}%، المطلوب: ${minimumRequired}%. يتطلب إجراء فوري.`,
      actionRequired: [
        'Hire Saudi nationals immediately',
        'Consider localizing positions',
        'Review workforce composition',
        'Prepare improvement plan for MHRSD'
      ],
      actionRequiredAr: [
        'توظيف مواطنين سعوديين فوراً',
        'النظر في توطين الوظائف',
        'مراجعة تركيبة القوى العاملة',
        'إعداد خطة تحسين لوزارة الموارد البشرية'
      ],
      legalBasis: 'نظام نطاقات',
      createdAt: today,
      metadata: { currentRatio, minimumRequired, gap }
    });
  } else if (gap > 0 && gap <= nitaqatThreshold) {
    alerts.push({
      id: 'nitaqat-warning',
      category: 'saudization',
      severity: 'high',
      title: 'Saudization Ratio Near Minimum Threshold',
      titleAr: 'نسبة السعودة قريبة من الحد الأدنى',
      message: `Current Saudization: ${currentRatio.toFixed(1)}% is only ${gap.toFixed(1)}% above the minimum (${minimumRequired}%).`,
      messageAr: `نسبة السعودة الحالية: ${currentRatio.toFixed(1)}% تزيد ${gap.toFixed(1)}% فقط عن الحد الأدنى (${minimumRequired}%).`,
      actionRequired: [
        'Plan for additional Saudi hires',
        'Avoid hiring non-Saudis without increasing Saudis',
        'Review Nitaqat improvement strategies'
      ],
      actionRequiredAr: [
        'التخطيط لتوظيف سعوديين إضافيين',
        'تجنب توظيف غير سعوديين دون زيادة السعوديين',
        'مراجعة استراتيجيات تحسين نطاقات'
      ],
      legalBasis: 'نظام نطاقات',
      createdAt: today,
      metadata: { currentRatio, minimumRequired, gap }
    });
  }
  
  return alerts;
}

/**
 * فحص مواعيد GOSI
 */
export function checkGOSICompliance(
  companyData: {
    lastPaymentDate?: string;
    employeesNotRegistered?: number[];
    pendingContributions?: number;
  },
  config: Partial<AlertConfig> = {}
): Alert[] {
  const { gosiPaymentDays } = { ...DEFAULT_CONFIG, ...config };
  const alerts: Alert[] = [];
  const today = new Date();
  const gosi = getGOSI();
  
  // التحقق من موعد الدفع الشهري (يجب الدفع قبل اليوم 15 من كل شهر)
  const currentDay = today.getDate();
  const paymentDeadline = 15;
  
  if (currentDay >= (paymentDeadline - gosiPaymentDays) && currentDay <= paymentDeadline) {
    alerts.push({
      id: 'gosi-payment-reminder',
      category: 'gosi',
      severity: currentDay >= paymentDeadline ? 'critical' : 'high',
      title: 'GOSI Payment Deadline Approaching',
      titleAr: 'اقتراب موعد دفع التأمينات الاجتماعية',
      message: `GOSI contributions must be paid by the 15th of each month. ${paymentDeadline - currentDay} days remaining.`,
      messageAr: `يجب دفع اشتراكات التأمينات قبل اليوم 15 من كل شهر. متبقي ${paymentDeadline - currentDay} يوم.`,
      actionRequired: [
        'Prepare GOSI contribution payment',
        'Verify all employee contributions are included',
        'Submit payment through GOSI portal'
      ],
      actionRequiredAr: [
        'تحضير دفع اشتراكات التأمينات',
        'التحقق من شمول جميع الموظفين',
        'تقديم الدفع عبر بوابة التأمينات'
      ],
      legalBasis: 'نظام التأمينات الاجتماعية',
      createdAt: today,
      metadata: { deadline: paymentDeadline, currentDay }
    });
  }
  
  // التحقق من الموظفين غير المسجلين
  if (companyData.employeesNotRegistered && companyData.employeesNotRegistered.length > 0) {
    alerts.push({
      id: 'gosi-unregistered-employees',
      category: 'gosi',
      severity: 'critical',
      title: `${companyData.employeesNotRegistered.length} Employees Not Registered in GOSI`,
      titleAr: `${companyData.employeesNotRegistered.length} موظف غير مسجل في التأمينات`,
      message: `${companyData.employeesNotRegistered.length} employees are not registered in GOSI. This is a legal violation.`,
      messageAr: `${companyData.employeesNotRegistered.length} موظف غير مسجل في التأمينات الاجتماعية. هذه مخالفة نظامية.`,
      actionRequired: [
        'Register employees in GOSI immediately',
        'Pay any backdated contributions',
        'Update employee records'
      ],
      actionRequiredAr: [
        'تسجيل الموظفين في التأمينات فوراً',
        'دفع أي اشتراكات متأخرة',
        'تحديث سجلات الموظفين'
      ],
      legalBasis: 'المادة 9 من نظام التأمينات الاجتماعية',
      affectedEmployees: companyData.employeesNotRegistered,
      createdAt: today
    });
  }
  
  return alerts;
}

/**
 * فحص رصيد الإجازات
 */
export function checkLeaveBalances(
  employees: Array<{
    id: number;
    name: string;
    leaveBalance: number;
    yearsOfService: number;
    lastLeaveDate?: string;
  }>,
  config: Partial<AlertConfig> = {}
): Alert[] {
  const { leaveBalanceThreshold } = { ...DEFAULT_CONFIG, ...config };
  const alerts: Alert[] = [];
  const today = new Date();
  const laborLaw = getLaborLaw();
  
  for (const emp of employees) {
    // التحقق من تراكم الإجازات
    const maxAnnualLeave = emp.yearsOfService >= 5 ? 30 : 21;
    const maxAccumulated = maxAnnualLeave * 2; // الحد الأقصى للتراكم
    
    if (emp.leaveBalance >= maxAccumulated - leaveBalanceThreshold) {
      alerts.push({
        id: `leave-accumulation-${emp.id}`,
        category: 'leave',
        severity: 'medium',
        title: `High Leave Balance: ${emp.name}`,
        titleAr: `رصيد إجازات مرتفع: ${emp.name}`,
        message: `${emp.name} has ${emp.leaveBalance} days of accumulated leave (max: ${maxAccumulated}).`,
        messageAr: `لدى ${emp.name} رصيد ${emp.leaveBalance} يوم إجازة متراكمة (الحد الأقصى: ${maxAccumulated}).`,
        actionRequired: [
          'Encourage employee to take leave',
          'Plan leave schedule to reduce accumulation'
        ],
        actionRequiredAr: [
          'تشجيع الموظف على أخذ إجازة',
          'التخطيط لجدول إجازات لتقليل التراكم'
        ],
        legalBasis: 'المادة 109 من نظام العمل',
        affectedEmployees: [emp.id],
        createdAt: today,
        metadata: { leaveBalance: emp.leaveBalance, maxAllowed: maxAccumulated }
      });
    }
    
    // التحقق من عدم أخذ إجازة لفترة طويلة
    if (emp.lastLeaveDate) {
      const lastLeave = new Date(emp.lastLeaveDate);
      const daysSinceLeave = Math.ceil((today.getTime() - lastLeave.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLeave > 365) {
        alerts.push({
          id: `no-leave-taken-${emp.id}`,
          category: 'leave',
          severity: 'low',
          title: `No Leave Taken: ${emp.name}`,
          titleAr: `لم يأخذ إجازة: ${emp.name}`,
          message: `${emp.name} has not taken leave for ${daysSinceLeave} days.`,
          messageAr: `${emp.name} لم يأخذ إجازة منذ ${daysSinceLeave} يوم.`,
          actionRequired: [
            'Remind employee of leave entitlement',
            'Discuss leave planning with manager'
          ],
          actionRequiredAr: [
            'تذكير الموظف باستحقاقات الإجازة',
            'مناقشة تخطيط الإجازات مع المدير'
          ],
          legalBasis: 'المادة 109 من نظام العمل',
          affectedEmployees: [emp.id],
          createdAt: today
        });
      }
    }
  }
  
  return alerts;
}

/**
 * فحص نهاية فترة التجربة
 */
export function checkProbationEnding(
  employees: Array<{
    id: number;
    name: string;
    joiningDate: string;
    probationDays: number;
  }>,
  config: Partial<AlertConfig> = {}
): Alert[] {
  const { probationEndDays } = { ...DEFAULT_CONFIG, ...config };
  const alerts: Alert[] = [];
  const today = new Date();
  
  for (const emp of employees) {
    const joinDate = new Date(emp.joiningDate);
    const probationEndDate = new Date(joinDate.getTime() + (emp.probationDays * 24 * 60 * 60 * 1000));
    const daysRemaining = Math.ceil((probationEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining > 0 && daysRemaining <= probationEndDays) {
      alerts.push({
        id: `probation-ending-${emp.id}`,
        category: 'contract',
        severity: daysRemaining <= 7 ? 'high' : 'medium',
        title: `Probation Ending: ${emp.name}`,
        titleAr: `انتهاء فترة التجربة: ${emp.name}`,
        message: `Probation period for ${emp.name} ends in ${daysRemaining} days. Decision required.`,
        messageAr: `تنتهي فترة تجربة ${emp.name} خلال ${daysRemaining} يوم. يلزم اتخاذ قرار.`,
        dueDate: probationEndDate,
        daysRemaining,
        actionRequired: [
          'Review employee performance during probation',
          'Decide on confirmation or termination',
          'Prepare confirmation letter if applicable',
          'Notify employee of decision'
        ],
        actionRequiredAr: [
          'مراجعة أداء الموظف خلال فترة التجربة',
          'اتخاذ قرار التثبيت أو إنهاء الخدمة',
          'تحضير خطاب التثبيت إن أمكن',
          'إبلاغ الموظف بالقرار'
        ],
        legalBasis: 'المادة 53 من نظام العمل',
        affectedEmployees: [emp.id],
        createdAt: today
      });
    }
  }
  
  return alerts;
}

// ============================================
// Alert Aggregation & Prioritization
// ============================================

/**
 * تجميع جميع التنبيهات وترتيبها حسب الأولوية
 */
export function aggregateAlerts(alertLists: Alert[][]): Alert[] {
  const allAlerts = alertLists.flat();
  
  // ترتيب حسب الأولوية
  const severityOrder: Record<AlertSeverity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4
  };
  
  return allAlerts.sort((a, b) => {
    // أولاً حسب الشدة
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    
    // ثم حسب الأيام المتبقية
    if (a.daysRemaining !== undefined && b.daysRemaining !== undefined) {
      return a.daysRemaining - b.daysRemaining;
    }
    
    // أخيراً حسب التاريخ
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

/**
 * تصفية التنبيهات حسب الفئة أو الشدة
 */
export function filterAlerts(
  alerts: Alert[],
  filters: {
    categories?: AlertCategory[];
    severities?: AlertSeverity[];
    employeeId?: number;
  }
): Alert[] {
  return alerts.filter(alert => {
    if (filters.categories && !filters.categories.includes(alert.category)) {
      return false;
    }
    if (filters.severities && !filters.severities.includes(alert.severity)) {
      return false;
    }
    if (filters.employeeId && !alert.affectedEmployees?.includes(filters.employeeId)) {
      return false;
    }
    return true;
  });
}

/**
 * تلخيص التنبيهات للوحة التحكم
 */
export function summarizeAlerts(alerts: Alert[]): {
  total: number;
  bySeverity: Record<AlertSeverity, number>;
  byCategory: Record<AlertCategory, number>;
  criticalCount: number;
  actionRequired: number;
} {
  const bySeverity: Record<AlertSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0
  };
  
  const byCategory: Partial<Record<AlertCategory, number>> = {};
  
  for (const alert of alerts) {
    bySeverity[alert.severity]++;
    byCategory[alert.category] = (byCategory[alert.category] || 0) + 1;
  }
  
  return {
    total: alerts.length,
    bySeverity,
    byCategory: byCategory as Record<AlertCategory, number>,
    criticalCount: bySeverity.critical,
    actionRequired: bySeverity.critical + bySeverity.high
  };
}

// ============================================
// Export
// ============================================

export const alertSystem = {
  checkContractExpiry,
  checkDocumentExpiry,
  checkSaudizationCompliance,
  checkGOSICompliance,
  checkLeaveBalances,
  checkProbationEnding,
  aggregateAlerts,
  filterAlerts,
  summarizeAlerts
};

export default alertSystem;
