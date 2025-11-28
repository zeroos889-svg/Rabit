/**
 * AI Tools Hook - Custom hooks for AI-powered features
 * خطافات مخصصة لأدوات الذكاء الاصطناعي
 * 
 * يوفر واجهة سهلة للتعامل مع:
 * - نظام العمل السعودي
 * - التأمينات الاجتماعية (GOSI)
 * - نظام النطاقات
 * - فحص الامتثال
 * - الحاسبات المالية
 */

import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";

// ============================================================================
// Types - الأنواع
// ============================================================================

export interface ComplianceCheckResult {
  compliant: boolean;
  issues: Array<{
    type: string;
    message: string;
    severity: "high" | "medium" | "low";
    recommendation?: string;
  }>;
  score: number;
  recommendations: string[];
}

export interface EOSBResult {
  amount: number;
  breakdown: {
    firstFiveYears: number;
    afterFiveYears: number;
  };
  percentage: number;
  yearsOfService: number;
}

export interface GOSIResult {
  employerContribution: number;
  employeeContribution: number;
  total: number;
  breakdown: {
    pension: { employer: number; employee: number };
    hazards: { employer: number; employee: number };
    saned?: { employer: number; employee: number };
  };
}

export interface AnnualLeaveResult {
  totalDays: number;
  accruedDays: number;
  type: "standard" | "extended";
}

export interface RegulationInfo {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  category: string;
  lastUpdated: string;
}

export interface RegulationsSummary {
  totalRegulations: number;
  categories: string[];
  regulations: RegulationInfo[];
}

export interface SaudizationAnalysis {
  currentRatio: number;
  requiredRatio: number;
  nitaqatBand: string;
  bandColor: string;
  gap: number;
  recommendations: string[];
}

export interface ContractValidation {
  valid: boolean;
  issues: Array<{
    field: string;
    issue: string;
    recommendation: string;
  }>;
  score: number;
}

// ============================================================================
// Knowledge Base Hook - قاعدة المعرفة
// ============================================================================

export function useKnowledgeBase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get available regulations
  const getAvailableRegulations = trpc.knowledgeBase?.getAvailable?.useQuery?.(undefined, {
    enabled: false,
  });

  // Get regulation by ID
  const getRegulation = useCallback(async (regulationId: string) => {
    setLoading(true);
    setError(null);
    try {
      // This will be replaced with actual tRPC call
      const response = await fetch(`/api/trpc/knowledgeBase.getRegulation?input=${encodeURIComponent(JSON.stringify({ id: regulationId }))}`);
      const data = await response.json();
      return data.result?.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load regulation");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search regulations
  const searchRegulations = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/trpc/knowledgeBase.search?input=${encodeURIComponent(JSON.stringify({ query }))}`);
      const data = await response.json();
      return data.result?.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search regulations");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getAvailableRegulations: getAvailableRegulations?.data,
    getRegulation,
    searchRegulations,
    refetch: getAvailableRegulations?.refetch,
  };
}

// ============================================================================
// Regulations Hook - الأنظمة (للصفحات)
// ============================================================================

/**
 * Hook for fetching Saudi regulations list
 * @returns Regulations data and loading states
 */
export function useRegulations() {
  const [data, setData] = useState<Array<{
    id: string;
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    category: string;
    articles?: Array<{ id: string; title: string; content: string }>;
  }> | null>(null);
  const [loading, setLoading] = useState(true);
  // Error state reserved for future API integration
  const _error: string | null = null;

  // Static regulations data (matches backend knowledge base)
  useState(() => {
    const regulations = [
      {
        id: "labor-law",
        name: "Saudi Labor Law",
        nameAr: "نظام العمل السعودي",
        description: "The primary law governing employment relations in Saudi Arabia",
        descriptionAr: "القانون الأساسي المنظم لعلاقات العمل في المملكة العربية السعودية",
        category: "labor",
      },
      {
        id: "social-insurance",
        name: "Social Insurance Law",
        nameAr: "نظام التأمينات الاجتماعية",
        description: "Regulates occupational hazard insurance and retirement for workers",
        descriptionAr: "ينظم التأمين ضد المخاطر المهنية والتقاعد للعاملين",
        category: "insurance",
      },
      {
        id: "nitaqat",
        name: "Nitaqat System",
        nameAr: "نظام نطاقات",
        description: "Program incentivizing companies to hire Saudi nationals",
        descriptionAr: "برنامج تحفيز المنشآت لتوطين الوظائف",
        category: "employment",
      },
      {
        id: "wage-protection",
        name: "Wage Protection System",
        nameAr: "نظام حماية الأجور",
        description: "Ensures timely payment of employee wages",
        descriptionAr: "يضمن صرف الأجور في مواعيدها المحددة",
        category: "labor",
      },
      {
        id: "hr-regulations",
        name: "HR Regulations",
        nameAr: "لائحة الموارد البشرية",
        description: "Regulates HR procedures in the private sector",
        descriptionAr: "تنظم إجراءات الموارد البشرية في القطاع الخاص",
        category: "labor",
      },
      {
        id: "e-services",
        name: "Electronic Services System",
        nameAr: "نظام الخدمات الإلكترونية",
        description: "Regulates electronic signatures and digital transactions",
        descriptionAr: "تنظيم التوقيع الإلكتروني والمعاملات الرقمية",
        category: "technology",
      },
      {
        id: "health-insurance",
        name: "Health Insurance Law",
        nameAr: "نظام الضمان الصحي",
        description: "Mandatory health insurance for private sector employees",
        descriptionAr: "التأمين الصحي الإلزامي للعاملين في القطاع الخاص",
        category: "insurance",
      },
      {
        id: "occupational-safety",
        name: "Occupational Safety Regulations",
        nameAr: "لائحة السلامة المهنية",
        description: "Workplace safety and health standards",
        descriptionAr: "معايير السلامة وصحة العمل",
        category: "safety",
      },
      {
        id: "remote-work",
        name: "Remote Work Regulations",
        nameAr: "لائحة العمل عن بعد",
        description: "Regulates remote and flexible work arrangements",
        descriptionAr: "تنظيم العمل عن بعد والعمل المرن",
        category: "employment",
      },
      {
        id: "visa-regulations",
        name: "Visa and Residency Regulations",
        nameAr: "نظام التأشيرات والإقامات",
        description: "Regulates visa issuance and work permits",
        descriptionAr: "تنظيم إصدار التأشيرات وتصاريح العمل",
        category: "labor",
      },
    ];
    setData(regulations);
    setLoading(false);
  });

  return { data, loading, error: _error };
}

// ============================================================================
// Compliance Check Hook - فحص الامتثال
// ============================================================================

export function useComplianceCheck() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComplianceCheckResult | null>(null);

  const checkDecisionCompliance = useCallback(async (decision: {
    type: string;
    description: string;
    affectedEmployees?: number;
    context?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/trpc/aiSaudi.checkDecisionCompliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(decision),
      });
      const data = await response.json();
      setResult(data.result?.data);
      return data.result?.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check compliance");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkTerminationCompliance = useCallback(async (termination: {
    reason: string;
    employeeType: string;
    yearsOfService: number;
    hasWarnings: boolean;
    noticeGiven: boolean;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/trpc/aiSaudi.checkTerminationCompliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(termination),
      });
      const data = await response.json();
      setResult(data.result?.data);
      return data.result?.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check termination compliance");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateContract = useCallback(async (contract: {
    type: string;
    duration?: number;
    salary: number;
    benefits: string[];
    clauses: string[];
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/trpc/aiSaudi.validateContract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contract),
      });
      const data = await response.json();
      return data.result?.data as ContractValidation;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to validate contract");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    result,
    checkDecisionCompliance,
    checkTerminationCompliance,
    validateContract,
    clearResult: () => setResult(null),
  };
}

// ============================================================================
// GOSI Calculator Hook - حاسبة التأمينات
// ============================================================================

export function useGOSICalculator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GOSIResult | null>(null);

  const calculateGOSI = useCallback(async (params: {
    salary: number;
    isSaudi: boolean;
    housingAllowance?: number;
    transportAllowance?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/trpc/aiSaudi.calculateGOSI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      setResult(data.result?.data);
      return data.result?.data as GOSIResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate GOSI");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateBulkGOSI = useCallback(async (employees: Array<{
    id: string;
    name: string;
    salary: number;
    isSaudi: boolean;
  }>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/trpc/aiSaudi.calculateBulkGOSI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employees }),
      });
      const data = await response.json();
      return data.result?.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate bulk GOSI");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    result,
    calculateGOSI,
    calculateBulkGOSI,
    clearResult: () => setResult(null),
  };
}

// ============================================================================
// EOSB Calculator Hook - حاسبة مكافأة نهاية الخدمة
// ============================================================================

export function useEOSBCalculator() {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [result, setResult] = useState<EOSBResult | null>(null);

  const calculateEOSB = useCallback((params: {
    monthlySalary: number;
    yearsOfService: number;
    terminationType: "resignation" | "termination" | "end_of_contract" | "retirement" | "article80";
  }): EOSBResult => {
    const { monthlySalary, yearsOfService, terminationType } = params;

    // Article 80 - No benefit
    if (terminationType === "article80") {
      return {
        amount: 0,
        breakdown: { firstFiveYears: 0, afterFiveYears: 0 },
        percentage: 0,
        yearsOfService,
      };
    }

    // Calculate based on Saudi Labor Law
    let percentage = 100;

    if (terminationType === "resignation") {
      if (yearsOfService < 2) {
        percentage = 0;
      } else if (yearsOfService < 5) {
        percentage = 33.33;
      } else if (yearsOfService < 10) {
        percentage = 66.67;
      } else {
        percentage = 100;
      }
    }

    // First 5 years: half month salary per year
    const firstFiveYears = Math.min(yearsOfService, 5) * (monthlySalary / 2);
    
    // After 5 years: full month salary per year
    const afterFiveYears = Math.max(0, yearsOfService - 5) * monthlySalary;

    const totalBenefit = firstFiveYears + afterFiveYears;
    const amount = (totalBenefit * percentage) / 100;

    setResult({
      amount,
      breakdown: { firstFiveYears, afterFiveYears },
      percentage,
      yearsOfService,
    });

    return {
      amount,
      breakdown: { firstFiveYears, afterFiveYears },
      percentage,
      yearsOfService,
    };
  }, []);

  return {
    loading,
    error,
    result,
    calculateEOSB,
    clearResult: () => setResult(null),
  };
}

// ============================================================================
// Annual Leave Calculator Hook - حاسبة الإجازات
// ============================================================================

export function useAnnualLeaveCalculator() {
  const calculateAnnualLeave = useCallback((params: {
    yearsOfService: number;
    daysWorkedInYear?: number;
  }): AnnualLeaveResult => {
    const { yearsOfService, daysWorkedInYear = 365 } = params;

    // Saudi Labor Law: 21 days for < 5 years, 30 days for >= 5 years
    const totalDays = yearsOfService >= 5 ? 30 : 21;
    const type = yearsOfService >= 5 ? "extended" : "standard";

    // Calculate accrued days based on days worked
    const accruedDays = Math.round((totalDays * daysWorkedInYear) / 365);

    return {
      totalDays,
      accruedDays,
      type,
    };
  }, []);

  return {
    calculateAnnualLeave,
  };
}

// ============================================================================
// Saudization Analysis Hook - تحليل السعودة
// ============================================================================

export function useSaudizationAnalysis() {
  const [_loading, _setLoading] = useState(false);
  const [_error, _setError] = useState<string | null>(null);
  const [result, setResult] = useState<SaudizationAnalysis | null>(null);

  const analyzeSaudization = useCallback(async (params: {
    totalEmployees: number;
    saudiEmployees: number;
    sector: string;
    companySize: "small" | "medium" | "large" | "giant";
  }) => {
    _setLoading(true);
    _setError(null);
    try {
      const response = await fetch("/api/trpc/aiSaudi.analyzeSaudization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      setResult(data.result?.data);
      return data.result?.data as SaudizationAnalysis;
    } catch (err) {
      _setError(err instanceof Error ? err.message : "Failed to analyze saudization");
      return null;
    } finally {
      _setLoading(false);
    }
  }, []);

  const simulateHiring = useCallback(async (params: {
    currentSaudis: number;
    currentTotal: number;
    newSaudis: number;
    newNonSaudis: number;
    sector: string;
  }) => {
    _setLoading(true);
    _setError(null);
    try {
      const response = await fetch("/api/trpc/aiSaudi.simulateHiringImpact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      return data.result?.data;
    } catch (err) {
      _setError(err instanceof Error ? err.message : "Failed to simulate hiring impact");
      return null;
    } finally {
      _setLoading(false);
    }
  }, []);

  return {
    loading: _loading,
    error: _error,
    result,
    analyzeSaudization,
    simulateHiring,
    clearResult: () => setResult(null),
  };
}

// ============================================================================
// Document Generator Hook - مولد المستندات
// ============================================================================

export function useDocumentGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContract = useCallback(async (params: {
    employeeName: string;
    employeeId: string;
    position: string;
    salary: number;
    startDate: string;
    contractType: "unlimited" | "limited";
    duration?: number;
    benefits?: string[];
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/trpc/aiSaudi.generateContract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      return data.result?.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate contract");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateTerminationLetter = useCallback(async (params: {
    employeeName: string;
    employeeId: string;
    reason: string;
    lastWorkingDay: string;
    entitlements: string[];
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/trpc/aiSaudi.generateTerminationLetter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      return data.result?.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate termination letter");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateExperienceCertificate = useCallback(async (params: {
    employeeName: string;
    position: string;
    startDate: string;
    endDate: string;
    duties: string[];
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/trpc/aiSaudi.generateExperienceCertificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      return data.result?.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate experience certificate");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    generateContract,
    generateTerminationLetter,
    generateExperienceCertificate,
  };
}

// ============================================================================
// AI Chat Hook - محادثة الذكاء الاصطناعي
// ============================================================================

export function useAIChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>>([]);

  const sendMessage = useCallback(async (message: string) => {
    setLoading(true);
    setError(null);
    
    const userMessage = {
      role: "user" as const,
      content: message,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch("/api/trpc/ai.chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      
      const assistantMessage = {
        role: "assistant" as const,
        content: data.result?.data?.response || "عذراً، لم أتمكن من معالجة طلبك.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      return assistantMessage.content;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    loading,
    error,
    messages,
    sendMessage,
    clearMessages,
  };
}

// ============================================================================
// Export all hooks
// ============================================================================

export default {
  useKnowledgeBase,
  useComplianceCheck,
  useGOSICalculator,
  useEOSBCalculator,
  useAnnualLeaveCalculator,
  useSaudizationAnalysis,
  useDocumentGenerator,
  useAIChat,
};
