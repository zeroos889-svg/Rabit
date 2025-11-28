/**
 * PDF Export Utilities
 * أدوات تصدير PDF
 * 
 * يوفر وظائف لتصدير نتائج الحسابات والتقارير إلى PDF
 */

// Types for calculation results
export interface GOSIExportData {
  type: "gosi";
  date: string;
  salary: number;
  isSaudi: boolean;
  housingAllowance?: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  breakdown: {
    pension: { employee: number; employer: number };
    hazards: { employer: number };
    saned?: { employee: number; employer: number };
  };
}

export interface EOSBExportData {
  type: "eosb";
  date: string;
  salary: number;
  yearsOfService: number;
  terminationType: string;
  totalBenefit: number;
  breakdown: {
    firstFiveYears: number;
    afterFiveYears: number;
  };
  percentage: number;
}

export interface LeaveExportData {
  type: "leave";
  date: string;
  yearsOfService: number;
  usedDays: number;
  entitlement: number;
  remainingDays: number;
}

export interface ComplianceCheck {
  category: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
}

export interface ComplianceExportData {
  companyName: string;
  checkDate: Date;
  overallStatus: 'compliant' | 'non-compliant' | 'warning';
  score: number;
  checks: ComplianceCheck[];
  recommendations: string[];
}

export interface GOSIPDFData {
  employeeName: string;
  basicSalary: number;
  housingAllowance: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  calculationDate: Date;
}

export interface EOSBPDFData {
  employeeName: string;
  basicSalary: number;
  allowances: number;
  yearsOfService: number;
  terminationReason: string;
  totalAmount: number;
  calculationDate: Date;
}

export type ExportData = GOSIExportData | EOSBExportData | LeaveExportData;

/**
 * Format number as SAR currency - Exported for testing
 */
export const formatCurrency = (amount: number, language: "ar" | "en" = "ar"): string => {
  return new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en-SA", {
    style: "currency",
    currency: "SAR",
  }).format(amount);
};

// Alias for internal use
const formatSAR = formatCurrency;

/**
 * Format date - Exported for testing
 */
export const formatDate = (date: string | Date, language: "ar" | "en" = "ar"): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
};

/**
 * Generate HTML content for GOSI calculation
 */
const generateGOSIHTML = (data: GOSIExportData, language: "ar" | "en"): string => {
  const isArabic = language === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  return `
    <div style="direction: ${dir}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e40af; margin-bottom: 5px;">
          ${isArabic ? "تقرير حساب التأمينات الاجتماعية" : "GOSI Calculation Report"}
        </h1>
        <p style="color: #6b7280; font-size: 14px;">
          ${isArabic ? "رابِط - نظام الموارد البشرية" : "Rabit - HR Management System"}
        </p>
        <p style="color: #6b7280; font-size: 12px;">
          ${formatDate(data.date, language)}
        </p>
      </div>

      <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #334155; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
          ${isArabic ? "بيانات الموظف" : "Employee Information"}
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; color: #64748b;">${isArabic ? "الراتب الأساسي:" : "Basic Salary:"}</td>
            <td style="padding: 10px; font-weight: bold;">${formatSAR(data.salary, language)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #64748b;">${isArabic ? "بدل السكن:" : "Housing Allowance:"}</td>
            <td style="padding: 10px; font-weight: bold;">${formatSAR(data.housingAllowance || 0, language)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #64748b;">${isArabic ? "الجنسية:" : "Nationality:"}</td>
            <td style="padding: 10px; font-weight: bold;">${data.isSaudi ? (isArabic ? "سعودي" : "Saudi") : (isArabic ? "غير سعودي" : "Non-Saudi")}</td>
          </tr>
        </table>
      </div>

      <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #166534; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">
          ${isArabic ? "ملخص المساهمات" : "Contributions Summary"}
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #dcfce7;">
            <td style="padding: 15px; font-weight: bold;">${isArabic ? "مساهمة الموظف:" : "Employee Contribution:"}</td>
            <td style="padding: 15px; font-weight: bold; font-size: 18px;">${formatSAR(data.employeeContribution, language)}</td>
          </tr>
          <tr>
            <td style="padding: 15px; font-weight: bold;">${isArabic ? "مساهمة صاحب العمل:" : "Employer Contribution:"}</td>
            <td style="padding: 15px; font-weight: bold; font-size: 18px;">${formatSAR(data.employerContribution, language)}</td>
          </tr>
          <tr style="background: #166534; color: white;">
            <td style="padding: 15px; font-weight: bold;">${isArabic ? "إجمالي المساهمات:" : "Total Contributions:"}</td>
            <td style="padding: 15px; font-weight: bold; font-size: 20px;">${formatSAR(data.totalContribution, language)}</td>
          </tr>
        </table>
      </div>

      <div style="background: #fefce8; padding: 20px; border-radius: 10px;">
        <h2 style="color: #854d0e; border-bottom: 2px solid #eab308; padding-bottom: 10px;">
          ${isArabic ? "تفاصيل المساهمات" : "Contribution Details"}
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #fef9c3;">
              <th style="padding: 10px; text-align: ${isArabic ? 'right' : 'left'};">${isArabic ? "النوع" : "Type"}</th>
              <th style="padding: 10px; text-align: center;">${isArabic ? "الموظف" : "Employee"}</th>
              <th style="padding: 10px; text-align: center;">${isArabic ? "صاحب العمل" : "Employer"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px;">${isArabic ? "معاش التقاعد (18%)" : "Pension (18%)"}</td>
              <td style="padding: 10px; text-align: center;">${formatSAR(data.breakdown.pension.employee, language)}</td>
              <td style="padding: 10px; text-align: center;">${formatSAR(data.breakdown.pension.employer, language)}</td>
            </tr>
            <tr style="background: #fef9c3;">
              <td style="padding: 10px;">${isArabic ? "أخطار مهنية (2%)" : "Occupational Hazards (2%)"}</td>
              <td style="padding: 10px; text-align: center;">-</td>
              <td style="padding: 10px; text-align: center;">${formatSAR(data.breakdown.hazards.employer, language)}</td>
            </tr>
            ${data.breakdown.saned ? `
            <tr>
              <td style="padding: 10px;">${isArabic ? "ساند - التعطل عن العمل (2%)" : "SANED - Unemployment (2%)"}</td>
              <td style="padding: 10px; text-align: center;">${formatSAR(data.breakdown.saned.employee, language)}</td>
              <td style="padding: 10px; text-align: center;">${formatSAR(data.breakdown.saned.employer, language)}</td>
            </tr>
            ` : ""}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 30px; padding: 15px; background: #f1f5f9; border-radius: 10px; font-size: 12px; color: #64748b;">
        <p><strong>${isArabic ? "ملاحظة:" : "Note:"}</strong> ${isArabic ? "هذا التقرير للاسترشاد فقط. للحصول على المبالغ الدقيقة، يرجى مراجعة المؤسسة العامة للتأمينات الاجتماعية." : "This report is for reference only. For exact amounts, please consult the General Organization for Social Insurance."}</p>
      </div>
    </div>
  `;
};

/**
 * Generate HTML content for EOSB calculation
 */
const generateEOSBHTML = (data: EOSBExportData, language: "ar" | "en"): string => {
  const isArabic = language === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const terminationTypeLabels: Record<string, { ar: string; en: string }> = {
    resignation: { ar: "استقالة", en: "Resignation" },
    termination: { ar: "إنهاء من صاحب العمل", en: "Employer Termination" },
    retirement: { ar: "تقاعد", en: "Retirement" },
    end_of_contract: { ar: "انتهاء العقد", en: "End of Contract" },
    article80: { ar: "المادة 80", en: "Article 80" },
  };

  return `
    <div style="direction: ${dir}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #7c3aed; margin-bottom: 5px;">
          ${isArabic ? "تقرير حساب مكافأة نهاية الخدمة" : "End of Service Benefit Report"}
        </h1>
        <p style="color: #6b7280; font-size: 14px;">
          ${isArabic ? "رابِط - نظام الموارد البشرية" : "Rabit - HR Management System"}
        </p>
        <p style="color: #6b7280; font-size: 12px;">
          ${formatDate(data.date, language)}
        </p>
      </div>

      <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #334155; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px;">
          ${isArabic ? "بيانات الموظف" : "Employee Information"}
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; color: #64748b;">${isArabic ? "الراتب الشهري:" : "Monthly Salary:"}</td>
            <td style="padding: 10px; font-weight: bold;">${formatSAR(data.salary, language)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #64748b;">${isArabic ? "سنوات الخدمة:" : "Years of Service:"}</td>
            <td style="padding: 10px; font-weight: bold;">${data.yearsOfService} ${isArabic ? "سنة" : "years"}</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #64748b;">${isArabic ? "سبب إنهاء الخدمة:" : "Termination Reason:"}</td>
            <td style="padding: 10px; font-weight: bold;">${terminationTypeLabels[data.terminationType]?.[language] || data.terminationType}</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #64748b;">${isArabic ? "نسبة الاستحقاق:" : "Entitlement Percentage:"}</td>
            <td style="padding: 10px; font-weight: bold;">${data.percentage}%</td>
          </tr>
        </table>
      </div>

      <div style="background: #faf5ff; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #6b21a8; border-bottom: 2px solid #a855f7; padding-bottom: 10px;">
          ${isArabic ? "تفاصيل الحساب" : "Calculation Details"}
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 15px; color: #64748b;">${isArabic ? "السنوات الخمس الأولى (نصف راتب × سنوات):" : "First 5 Years (half salary × years):"}</td>
            <td style="padding: 15px; font-weight: bold;">${formatSAR(data.breakdown.firstFiveYears, language)}</td>
          </tr>
          <tr style="background: #f3e8ff;">
            <td style="padding: 15px; color: #64748b;">${isArabic ? "ما بعد السنة الخامسة (راتب كامل × سنوات):" : "After 5 Years (full salary × years):"}</td>
            <td style="padding: 15px; font-weight: bold;">${formatSAR(data.breakdown.afterFiveYears, language)}</td>
          </tr>
        </table>
      </div>

      <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; border-radius: 15px; text-align: center; color: white;">
        <h2 style="margin: 0 0 10px 0; font-size: 18px;">
          ${isArabic ? "إجمالي مكافأة نهاية الخدمة" : "Total End of Service Benefit"}
        </h2>
        <p style="font-size: 36px; font-weight: bold; margin: 0;">
          ${formatSAR(data.totalBenefit, language)}
        </p>
      </div>

      <div style="margin-top: 30px; padding: 15px; background: #f1f5f9; border-radius: 10px; font-size: 12px; color: #64748b;">
        <p><strong>${isArabic ? "الأساس القانوني:" : "Legal Basis:"}</strong> ${isArabic ? "المادة 84 و 85 من نظام العمل السعودي" : "Articles 84 and 85 of Saudi Labor Law"}</p>
        <p><strong>${isArabic ? "ملاحظة:" : "Note:"}</strong> ${isArabic ? "هذا التقرير للاسترشاد فقط. قد تختلف المبالغ الفعلية حسب بنود العقد والاتفاقيات الخاصة." : "This report is for reference only. Actual amounts may vary based on contract terms and special agreements."}</p>
      </div>
    </div>
  `;
};

/**
 * Generate HTML content for Leave calculation
 */
const generateLeaveHTML = (data: LeaveExportData, language: "ar" | "en"): string => {
  const isArabic = language === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  return `
    <div style="direction: ${dir}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0891b2; margin-bottom: 5px;">
          ${isArabic ? "تقرير حساب الإجازات السنوية" : "Annual Leave Calculation Report"}
        </h1>
        <p style="color: #6b7280; font-size: 14px;">
          ${isArabic ? "رابِط - نظام الموارد البشرية" : "Rabit - HR Management System"}
        </p>
        <p style="color: #6b7280; font-size: 12px;">
          ${formatDate(data.date, language)}
        </p>
      </div>

      <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #334155; border-bottom: 2px solid #06b6d4; padding-bottom: 10px;">
          ${isArabic ? "بيانات الموظف" : "Employee Information"}
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; color: #64748b;">${isArabic ? "سنوات الخدمة:" : "Years of Service:"}</td>
            <td style="padding: 10px; font-weight: bold;">${data.yearsOfService} ${isArabic ? "سنة" : "years"}</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #64748b;">${isArabic ? "الاستحقاق السنوي:" : "Annual Entitlement:"}</td>
            <td style="padding: 10px; font-weight: bold;">${data.entitlement} ${isArabic ? "يوم" : "days"}</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #64748b;">${isArabic ? "الأيام المستخدمة:" : "Used Days:"}</td>
            <td style="padding: 10px; font-weight: bold;">${data.usedDays} ${isArabic ? "يوم" : "days"}</td>
          </tr>
        </table>
      </div>

      <div style="background: linear-gradient(135deg, #0891b2, #22d3ee); padding: 30px; border-radius: 15px; text-align: center; color: white;">
        <h2 style="margin: 0 0 10px 0; font-size: 18px;">
          ${isArabic ? "الرصيد المتبقي" : "Remaining Balance"}
        </h2>
        <p style="font-size: 48px; font-weight: bold; margin: 0;">
          ${data.remainingDays} <span style="font-size: 20px;">${isArabic ? "يوم" : "days"}</span>
        </p>
      </div>

      <div style="margin-top: 30px; padding: 15px; background: #f1f5f9; border-radius: 10px; font-size: 12px; color: #64748b;">
        <p><strong>${isArabic ? "الأساس القانوني:" : "Legal Basis:"}</strong></p>
        <ul style="margin: 5px 0; padding-${isArabic ? 'right' : 'left'}: 20px;">
          <li>${isArabic ? "أقل من 5 سنوات خدمة: 21 يوم سنوياً" : "Less than 5 years: 21 days per year"}</li>
          <li>${isArabic ? "أكثر من 5 سنوات خدمة: 30 يوم سنوياً" : "More than 5 years: 30 days per year"}</li>
        </ul>
        <p>${isArabic ? "المادة 109 من نظام العمل السعودي" : "Article 109 of Saudi Labor Law"}</p>
      </div>
    </div>
  `;
};

/**
 * Print calculation result as PDF-like document
 */
export const printCalculation = (data: ExportData, language: "ar" | "en" = "ar"): void => {
  let htmlContent: string;

  switch (data.type) {
    case "gosi":
      htmlContent = generateGOSIHTML(data, language);
      break;
    case "eosb":
      htmlContent = generateEOSBHTML(data, language);
      break;
    case "leave":
      htmlContent = generateLeaveHTML(data, language);
      break;
    default:
      console.error("Unknown export type");
      return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    console.error("Could not open print window");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="${language === 'ar' ? 'rtl' : 'ltr'}" lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${language === 'ar' ? 'تقرير الحساب' : 'Calculation Report'}</title>
      <style>
        @media print {
          body { margin: 0; padding: 20px; }
          @page { margin: 1cm; }
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          background: white;
        }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `);

  printWindow.document.close();
  
  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.print();
  }, 500);
};

/**
 * Download calculation as HTML file (can be converted to PDF via browser)
 */
export const downloadAsHTML = (data: ExportData, language: "ar" | "en" = "ar"): void => {
  let htmlContent: string;
  let filename: string;

  switch (data.type) {
    case "gosi":
      htmlContent = generateGOSIHTML(data, language);
      filename = language === "ar" ? "تقرير-التأمينات" : "gosi-report";
      break;
    case "eosb":
      htmlContent = generateEOSBHTML(data, language);
      filename = language === "ar" ? "تقرير-مكافأة-نهاية-الخدمة" : "eosb-report";
      break;
    case "leave":
      htmlContent = generateLeaveHTML(data, language);
      filename = language === "ar" ? "تقرير-الإجازات" : "leave-report";
      break;
    default:
      console.error("Unknown export type");
      return;
  }

  const fullHTML = `
    <!DOCTYPE html>
    <html dir="${language === 'ar' ? 'rtl' : 'ltr'}" lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${filename}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          background: white;
        }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;

  const blob = new Blob([fullHTML], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * Generate GOSI PDF HTML content - Exported for direct use
 */
export const generateGOSIPDF = (data: GOSIPDFData, language: "ar" | "en" = "ar"): string => {
  const isArabic = language === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  return `
    <!DOCTYPE html>
    <html dir="${dir}" lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isArabic ? "تقرير حساب التأمينات الاجتماعية" : "GOSI Calculation Report"}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          background: white;
          direction: ${dir};
        }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #1e40af; margin-bottom: 5px; }
        .header p { color: #6b7280; font-size: 14px; }
        .section { background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .section h2 { color: #334155; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 10px; }
        .label { color: #64748b; }
        .value { font-weight: bold; }
        .total-section { background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; border-radius: 15px; text-align: center; color: white; }
        .total-section h2 { margin: 0 0 10px 0; font-size: 18px; }
        .total-section .amount { font-size: 36px; font-weight: bold; margin: 0; }
        .footer { margin-top: 30px; padding: 15px; background: #f1f5f9; border-radius: 10px; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${isArabic ? "تقرير حساب التأمينات الاجتماعية" : "GOSI Calculation Report"}</h1>
        <p>${isArabic ? "رابِط - نظام الموارد البشرية" : "Rabit - HR Management System"}</p>
        <p>${formatDate(data.calculationDate, language)}</p>
      </div>

      <div class="section">
        <h2>${isArabic ? "بيانات الموظف" : "Employee Information"}</h2>
        <table>
          <tr>
            <td class="label">${isArabic ? "اسم الموظف:" : "Employee Name:"}</td>
            <td class="value">${data.employeeName}</td>
          </tr>
          <tr>
            <td class="label">${isArabic ? "الراتب الأساسي:" : "Basic Salary:"}</td>
            <td class="value">${formatSAR(data.basicSalary, language)}</td>
          </tr>
          <tr>
            <td class="label">${isArabic ? "بدل السكن:" : "Housing Allowance:"}</td>
            <td class="value">${formatSAR(data.housingAllowance, language)}</td>
          </tr>
        </table>
      </div>

      <div class="section" style="background: #f0fdf4;">
        <h2 style="color: #166534; border-color: #22c55e;">${isArabic ? "ملخص المساهمات" : "Contributions Summary"}</h2>
        <table>
          <tr>
            <td class="label">${isArabic ? "مساهمة الموظف:" : "Employee Contribution:"}</td>
            <td class="value">${formatSAR(data.employeeContribution, language)}</td>
          </tr>
          <tr>
            <td class="label">${isArabic ? "مساهمة صاحب العمل:" : "Employer Contribution:"}</td>
            <td class="value">${formatSAR(data.employerContribution, language)}</td>
          </tr>
        </table>
      </div>

      <div class="total-section">
        <h2>${isArabic ? "إجمالي المساهمات الشهرية" : "Total Monthly Contributions"}</h2>
        <p class="amount">${formatSAR(data.totalContribution, language)}</p>
      </div>

      <div class="footer">
        <p><strong>${isArabic ? "ملاحظة:" : "Note:"}</strong> ${isArabic ? "هذا التقرير للاسترشاد فقط. للحصول على المبالغ الدقيقة، يرجى مراجعة المؤسسة العامة للتأمينات الاجتماعية." : "This report is for reference only. For exact amounts, please consult the General Organization for Social Insurance."}</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate EOSB PDF HTML content - Exported for direct use
 */
export const generateEOSBPDF = (data: EOSBPDFData, language: "ar" | "en" = "ar"): string => {
  const isArabic = language === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  return `
    <!DOCTYPE html>
    <html dir="${dir}" lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isArabic ? "تقرير مكافأة نهاية الخدمة" : "End of Service Benefit Report"}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          background: white;
          direction: ${dir};
        }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #7c3aed; margin-bottom: 5px; }
        .header p { color: #6b7280; font-size: 14px; }
        .section { background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .section h2 { color: #334155; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 10px; }
        .label { color: #64748b; }
        .value { font-weight: bold; }
        .total-section { background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; border-radius: 15px; text-align: center; color: white; }
        .total-section h2 { margin: 0 0 10px 0; font-size: 18px; }
        .total-section .amount { font-size: 36px; font-weight: bold; margin: 0; }
        .footer { margin-top: 30px; padding: 15px; background: #f1f5f9; border-radius: 10px; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${isArabic ? "تقرير مكافأة نهاية الخدمة" : "End of Service Benefit Report"}</h1>
        <p>${isArabic ? "رابِط - نظام الموارد البشرية" : "Rabit - HR Management System"}</p>
        <p>${formatDate(data.calculationDate, language)}</p>
      </div>

      <div class="section">
        <h2>${isArabic ? "بيانات الموظف" : "Employee Information"}</h2>
        <table>
          <tr>
            <td class="label">${isArabic ? "اسم الموظف:" : "Employee Name:"}</td>
            <td class="value">${data.employeeName}</td>
          </tr>
          <tr>
            <td class="label">${isArabic ? "الراتب الأساسي:" : "Basic Salary:"}</td>
            <td class="value">${formatSAR(data.basicSalary, language)}</td>
          </tr>
          <tr>
            <td class="label">${isArabic ? "البدلات:" : "Allowances:"}</td>
            <td class="value">${formatSAR(data.allowances, language)}</td>
          </tr>
          <tr>
            <td class="label">${isArabic ? "سنوات الخدمة:" : "Years of Service:"}</td>
            <td class="value">${data.yearsOfService} ${isArabic ? "سنة" : "years"}</td>
          </tr>
          <tr>
            <td class="label">${isArabic ? "سبب انتهاء الخدمة:" : "Termination Reason:"}</td>
            <td class="value">${data.terminationReason}</td>
          </tr>
        </table>
      </div>

      <div class="total-section">
        <h2>${isArabic ? "إجمالي مكافأة نهاية الخدمة" : "Total End of Service Benefit"}</h2>
        <p class="amount">${formatSAR(data.totalAmount, language)}</p>
      </div>

      <div class="footer">
        <p><strong>${isArabic ? "الأساس القانوني:" : "Legal Basis:"}</strong> ${isArabic ? "المادة 84 و 85 من نظام العمل السعودي" : "Articles 84 and 85 of Saudi Labor Law"}</p>
        <p><strong>${isArabic ? "ملاحظة:" : "Note:"}</strong> ${isArabic ? "هذا التقرير للاسترشاد فقط. قد تختلف المبالغ الفعلية حسب بنود العقد." : "This report is for reference only. Actual amounts may vary based on contract terms."}</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate Compliance PDF HTML content
 */
export const generateCompliancePDF = (data: ComplianceExportData, language: "ar" | "en" = "ar"): string => {
  const isArabic = language === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const statusColors = {
    'compliant': '#22c55e',
    'non-compliant': '#ef4444',
    'warning': '#f59e0b'
  };

  const statusLabels = {
    'compliant': { ar: 'متوافق', en: 'Compliant' },
    'non-compliant': { ar: 'غير متوافق', en: 'Non-Compliant' },
    'warning': { ar: 'تحذير', en: 'Warning' }
  };

  const checkStatusLabels = {
    'pass': { ar: 'ناجح', en: 'Pass', color: '#22c55e' },
    'warning': { ar: 'تحذير', en: 'Warning', color: '#f59e0b' },
    'fail': { ar: 'فشل', en: 'Fail', color: '#ef4444' }
  };

  return `
    <!DOCTYPE html>
    <html dir="${dir}" lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isArabic ? "تقرير الامتثال" : "Compliance Report"}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
          background: white;
          direction: ${dir};
        }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #1e40af; margin-bottom: 5px; }
        .header p { color: #6b7280; font-size: 14px; }
        .company-info { background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .status-badge {
          display: inline-block;
          padding: 8px 20px;
          border-radius: 20px;
          color: white;
          font-weight: bold;
          font-size: 16px;
        }
        .score-section {
          text-align: center;
          margin: 20px 0;
          padding: 30px;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          border-radius: 15px;
          color: white;
        }
        .score { font-size: 48px; font-weight: bold; }
        .checks-section { margin: 20px 0; }
        .check-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border-bottom: 1px solid #e5e7eb;
        }
        .check-status {
          padding: 4px 12px;
          border-radius: 12px;
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        .recommendations {
          background: #fef3c7;
          padding: 20px;
          border-radius: 10px;
          margin-top: 20px;
        }
        .recommendations h3 { color: #92400e; margin-bottom: 15px; }
        .recommendations ul { margin: 0; padding-${isArabic ? 'right' : 'left'}: 20px; }
        .recommendations li { margin-bottom: 8px; color: #78350f; }
        .footer { margin-top: 30px; padding: 15px; background: #f1f5f9; border-radius: 10px; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${isArabic ? "تقرير الامتثال للأنظمة السعودية" : "Saudi Regulations Compliance Report"}</h1>
        <p>${isArabic ? "رابِط - نظام الموارد البشرية" : "Rabit - HR Management System"}</p>
        <p>${formatDate(data.checkDate, language)}</p>
      </div>

      <div class="company-info">
        <h2 style="margin-top: 0; color: #334155;">${isArabic ? "معلومات الشركة" : "Company Information"}</h2>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px; color: #64748b;">${isArabic ? "اسم الشركة:" : "Company Name:"}</td>
            <td style="padding: 8px; font-weight: bold;">${data.companyName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #64748b;">${isArabic ? "تاريخ الفحص:" : "Check Date:"}</td>
            <td style="padding: 8px; font-weight: bold;">${formatDate(data.checkDate, language)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #64748b;">${isArabic ? "الحالة العامة:" : "Overall Status:"}</td>
            <td style="padding: 8px;">
              <span class="status-badge" style="background-color: ${statusColors[data.overallStatus]}">
                ${statusLabels[data.overallStatus][language]}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <div class="score-section">
        <h2 style="margin: 0 0 10px 0;">${isArabic ? "نسبة الامتثال" : "Compliance Score"}</h2>
        <p class="score">${data.score}%</p>
      </div>

      <div class="checks-section">
        <h2 style="color: #334155; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
          ${isArabic ? "نتائج الفحص التفصيلية" : "Detailed Check Results"}
        </h2>
        ${data.checks.map(check => `
          <div class="check-item">
            <div>
              <strong>${check.category}</strong>
              <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">${check.message}</p>
            </div>
            <span class="check-status" style="background-color: ${checkStatusLabels[check.status].color}">
              ${checkStatusLabels[check.status][language]}
            </span>
          </div>
        `).join('')}
      </div>

      ${data.recommendations.length > 0 ? `
        <div class="recommendations">
          <h3>${isArabic ? "التوصيات" : "Recommendations"}</h3>
          <ul>
            ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="footer">
        <p><strong>${isArabic ? "ملاحظة:" : "Note:"}</strong> ${isArabic ? "هذا التقرير للاسترشاد فقط ولا يغني عن الاستشارة القانونية المتخصصة. يجب مراجعة الجهات الرسمية للتأكد من الامتثال الكامل." : "This report is for reference only and does not replace specialized legal consultation. Please consult official authorities to ensure full compliance."}</p>
      </div>
    </body>
    </html>
  `;
};

export default {
  printCalculation,
  downloadAsHTML,
  formatCurrency,
  formatDate,
  generateGOSIPDF,
  generateEOSBPDF,
  generateCompliancePDF,
};
