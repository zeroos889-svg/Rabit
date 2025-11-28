/**
 * Financial Calculators Components - حاسبات مالية
 * 
 * مكونات React للحاسبات المالية:
 * - حاسبة التأمينات الاجتماعية (GOSI)
 * - حاسبة مكافأة نهاية الخدمة (EOSB)
 * - حاسبة الإجازات السنوية
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  Wallet,
  Clock,
  TrendingUp,
  Info,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Download,
  Landmark,
  Gift,
  Palmtree,
} from "lucide-react";
import { useGOSICalculator, useEOSBCalculator, useAnnualLeaveCalculator } from "@/hooks/useAI";
import type { AnnualLeaveResult } from "@/hooks/useAI";
import { printCalculation } from "@/lib/pdfExport";
import { saveGOSIRecord, saveEOSBRecord, saveLeaveRecord } from "@/lib/calculationHistory";

// ============================================================================
// GOSI Calculator Component - حاسبة التأمينات
// ============================================================================

export function GOSICalculatorCard() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const { calculateGOSI, loading, clearResult } = useGOSICalculator();

  const [salary, setSalary] = useState<string>("");
  const [isSaudi, setIsSaudi] = useState(true);
  const [housingAllowance, setHousingAllowance] = useState<string>("");
  const [transportAllowance, setTransportAllowance] = useState<string>("");

  const handleCalculate = async () => {
    const salaryNum = Number.parseFloat(salary);
    if (Number.isNaN(salaryNum) || salaryNum <= 0) {
      toast.error(isArabic ? 'يرجى إدخال راتب صحيح' : 'Please enter a valid salary');
      return;
    }

    await calculateGOSI({
      salary: salaryNum,
      isSaudi,
      housingAllowance: housingAllowance ? Number.parseFloat(housingAllowance) : undefined,
      transportAllowance: transportAllowance ? Number.parseFloat(transportAllowance) : undefined,
    });

    // حفظ في السجل
    if (localResult) {
      saveGOSIRecord(
        {
          basicSalary: salaryNum,
          housingAllowance: housingAllowance ? Number.parseFloat(housingAllowance) : 0,
          isNonSaudi: !isSaudi,
          employerContributionRate: 0.11,
          employeeContributionRate: isSaudi ? 0.0975 : 0,
        },
        {
          employeeContribution: localResult.employeeContribution,
          employerContribution: localResult.employerContribution,
          totalContribution: localResult.total,
          totalInsurableSalary: salaryNum,
        }
      );
    }

    toast.success(isArabic ? 'تم حساب التأمينات بنجاح' : 'GOSI calculated successfully');
  };

  const handleExportPDF = () => {
    if (!localResult) return;
    printCalculation({
      type: 'gosi',
      date: new Date().toISOString(),
      salary: Number.parseFloat(salary),
      isSaudi,
      housingAllowance: housingAllowance ? Number.parseFloat(housingAllowance) : undefined,
      employeeContribution: localResult.employeeContribution,
      employerContribution: localResult.employerContribution,
      totalContribution: localResult.total,
      breakdown: localResult.breakdown,
    }, isArabic ? 'ar' : 'en');
    toast.success(isArabic ? 'جاري تصدير التقرير' : 'Exporting report...');
  };

  const handleReset = () => {
    setSalary("");
    setIsSaudi(true);
    setHousingAllowance("");
    setTransportAllowance("");
    clearResult();
  };

  // Local calculation for instant feedback
  const localResult = (() => {
    const salaryNum = Number.parseFloat(salary) || 0;
    if (salaryNum <= 0) return null;

    const cappedSalary = Math.min(salaryNum, 45000);
    
    // GOSI Rates
    const pensionEmployer = cappedSalary * 0.09;
    const pensionEmployee = isSaudi ? cappedSalary * 0.09 : 0;
    const hazardsEmployer = cappedSalary * 0.02;
    const hazardsEmployee = 0;
    const sanedEmployer = isSaudi ? cappedSalary * 0.0075 : 0;
    const sanedEmployee = isSaudi ? cappedSalary * 0.0075 : 0;

    const employerTotal = pensionEmployer + hazardsEmployer + sanedEmployer;
    const employeeTotal = pensionEmployee + sanedEmployee;

    return {
      employerContribution: employerTotal,
      employeeContribution: employeeTotal,
      total: employerTotal + employeeTotal,
      breakdown: {
        pension: { employer: pensionEmployer, employee: pensionEmployee },
        hazards: { employer: hazardsEmployer, employee: hazardsEmployee },
        saned: { employer: sanedEmployer, employee: sanedEmployee },
      },
    };
  })();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isArabic ? "ar-SA" : "en-SA", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-600" />
              {isArabic ? "حاسبة التأمينات الاجتماعية" : "GOSI Calculator"}
            </CardTitle>
            <CardDescription>
              {isArabic
                ? "احسب اشتراكات التأمينات الاجتماعية"
                : "Calculate social insurance contributions"}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-green-600">
            GOSI
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Salary Input */}
        <div className="space-y-2">
          <Label htmlFor="salary">
            {isArabic ? "الراتب الأساسي (ريال)" : "Basic Salary (SAR)"}
          </Label>
          <Input
            id="salary"
            type="number"
            placeholder={isArabic ? "أدخل الراتب" : "Enter salary"}
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="text-lg"
          />
          {Number.parseFloat(salary) > 45000 && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {isArabic
                ? "السقف الأعلى للاشتراك 45,000 ريال"
                : "Maximum contribution cap is 45,000 SAR"}
            </p>
          )}
        </div>

        {/* Saudi/Non-Saudi Toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <Label htmlFor="saudi-toggle" className="cursor-pointer">
            {isArabic ? "موظف سعودي" : "Saudi Employee"}
          </Label>
          <Switch
            id="saudi-toggle"
            checked={isSaudi}
            onCheckedChange={setIsSaudi}
          />
        </div>

        {/* Optional Allowances */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="housing" className="text-sm">
              {isArabic ? "بدل السكن" : "Housing Allowance"}
            </Label>
            <Input
              id="housing"
              type="number"
              placeholder="0"
              value={housingAllowance}
              onChange={(e) => setHousingAllowance(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transport" className="text-sm">
              {isArabic ? "بدل النقل" : "Transport Allowance"}
            </Label>
            <Input
              id="transport"
              type="number"
              placeholder="0"
              value={transportAllowance}
              onChange={(e) => setTransportAllowance(e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* Results */}
        {localResult && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              {isArabic ? "النتائج" : "Results"}
            </h4>

            {/* Breakdown Table */}
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-right p-2 font-medium">
                      {isArabic ? "البند" : "Item"}
                    </th>
                    <th className="text-center p-2 font-medium">
                      {isArabic ? "صاحب العمل" : "Employer"}
                    </th>
                    <th className="text-center p-2 font-medium">
                      {isArabic ? "الموظف" : "Employee"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-2">
                      {isArabic ? "المعاشات (9%)" : "Pension (9%)"}
                    </td>
                    <td className="text-center p-2">
                      {formatCurrency(localResult.breakdown.pension.employer)}
                    </td>
                    <td className="text-center p-2">
                      {formatCurrency(localResult.breakdown.pension.employee)}
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      {isArabic ? "أخطار مهنية (2%)" : "Hazards (2%)"}
                    </td>
                    <td className="text-center p-2">
                      {formatCurrency(localResult.breakdown.hazards.employer)}
                    </td>
                    <td className="text-center p-2">-</td>
                  </tr>
                  {isSaudi && localResult.breakdown.saned && (
                    <tr className="border-t">
                      <td className="p-2">
                        {isArabic ? "ساند (0.75%)" : "SANED (0.75%)"}
                      </td>
                      <td className="text-center p-2">
                        {formatCurrency(localResult.breakdown.saned.employer)}
                      </td>
                      <td className="text-center p-2">
                        {formatCurrency(localResult.breakdown.saned.employee)}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t bg-slate-50 font-medium">
                    <td className="p-2">{isArabic ? "المجموع" : "Total"}</td>
                    <td className="text-center p-2 text-green-600">
                      {formatCurrency(localResult.employerContribution)}
                    </td>
                    <td className="text-center p-2 text-blue-600">
                      {formatCurrency(localResult.employeeContribution)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total Summary */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {isArabic ? "إجمالي الاشتراكات الشهرية" : "Total Monthly Contributions"}
              </p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(localResult.total)}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button onClick={handleCalculate} disabled={!salary || loading} className="flex-1">
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin ml-2" />
          ) : (
            <Calculator className="h-4 w-4 ml-2" />
          )}
          {isArabic ? "احسب" : "Calculate"}
        </Button>
        {localResult && (
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4" />
          </Button>
        )}
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// ============================================================================
// EOSB Calculator Component - حاسبة مكافأة نهاية الخدمة
// ============================================================================

export function EOSBCalculatorCard() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const { calculateEOSB, result, clearResult } = useEOSBCalculator();

  const [salary, setSalary] = useState<string>("");
  const [years, setYears] = useState<string>("");
  const [months, setMonths] = useState<string>("0");
  const [terminationType, setTerminationType] = useState<string>("resignation");

  const terminationTypes = [
    { value: "resignation", labelAr: "استقالة", labelEn: "Resignation" },
    { value: "termination", labelAr: "إنهاء من صاحب العمل", labelEn: "Employer Termination" },
    { value: "end_of_contract", labelAr: "انتهاء العقد", labelEn: "End of Contract" },
    { value: "retirement", labelAr: "تقاعد", labelEn: "Retirement" },
    { value: "article80", labelAr: "فصل بموجب المادة 80", labelEn: "Article 80 Termination" },
  ];

  const handleCalculate = () => {
    const salaryNum = Number.parseFloat(salary);
    const yearsNum = Number.parseFloat(years) + Number.parseFloat(months) / 12;
    
    if (Number.isNaN(salaryNum) || Number.isNaN(yearsNum) || salaryNum <= 0) {
      toast.error(isArabic ? 'يرجى إدخال البيانات المطلوبة' : 'Please enter required data');
      return;
    }

    const calcResult = calculateEOSB({
      monthlySalary: salaryNum,
      yearsOfService: yearsNum,
      terminationType: terminationType as "resignation" | "termination" | "end_of_contract" | "retirement" | "article80",
    });

    // حفظ في السجل
    if (calcResult) {
      saveEOSBRecord(
        {
          basicSalary: salaryNum,
          allowances: 0,
          yearsOfService: yearsNum,
          terminationReason: terminationType,
          contractType: 'indefinite',
        },
        {
          totalAmount: calcResult.amount,
          yearsCalculation: `${yearsNum} years`,
          eligibilityPercentage: calcResult.percentage,
          breakdown: calcResult.breakdown,
        }
      );
    }

    toast.success(isArabic ? 'تم حساب مكافأة نهاية الخدمة' : 'EOSB calculated successfully');
  };

  const handleExportPDF = () => {
    if (!result) return;
    printCalculation({
      type: 'eosb',
      date: new Date().toISOString(),
      salary: Number.parseFloat(salary),
      yearsOfService: Number.parseFloat(years) + Number.parseFloat(months) / 12,
      terminationType,
      totalBenefit: result.amount,
      breakdown: result.breakdown,
      percentage: result.percentage,
    }, isArabic ? 'ar' : 'en');
    toast.success(isArabic ? 'جاري تصدير التقرير' : 'Exporting report...');
  };

  const handleReset = () => {
    setSalary("");
    setYears("");
    setMonths("0");
    setTerminationType("resignation");
    clearResult();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isArabic ? "ar-SA" : "en-SA", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              {isArabic ? "حاسبة مكافأة نهاية الخدمة" : "End of Service Calculator"}
            </CardTitle>
            <CardDescription>
              {isArabic
                ? "احسب مكافأة نهاية الخدمة حسب نظام العمل السعودي"
                : "Calculate EOSB according to Saudi Labor Law"}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-orange-600">
            EOSB
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Salary Input */}
        <div className="space-y-2">
          <Label htmlFor="eosb-salary">
            {isArabic ? "الراتب الشهري (ريال)" : "Monthly Salary (SAR)"}
          </Label>
          <Input
            id="eosb-salary"
            type="number"
            placeholder={isArabic ? "أدخل الراتب" : "Enter salary"}
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="text-lg"
          />
        </div>

        {/* Years of Service */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="years">
              {isArabic ? "سنوات الخدمة" : "Years of Service"}
            </Label>
            <Input
              id="years"
              type="number"
              placeholder="0"
              min="0"
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="months">
              {isArabic ? "الأشهر الإضافية" : "Additional Months"}
            </Label>
            <Select value={months} onValueChange={setMonths}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {m} {isArabic ? "شهر" : "months"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Termination Type */}
        <div className="space-y-2">
          <Label>{isArabic ? "نوع إنهاء الخدمة" : "Termination Type"}</Label>
          <Select value={terminationType} onValueChange={setTerminationType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {terminationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {isArabic ? type.labelAr : type.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {terminationType === "article80" && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {isArabic
                ? "لا يستحق الموظف مكافأة في هذه الحالة"
                : "Employee is not entitled to EOSB in this case"}
            </p>
          )}
        </div>

        <Separator />

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              {isArabic ? "النتائج" : "Results"}
            </h4>

            {/* Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-muted-foreground">
                  {isArabic ? "أول 5 سنوات (نصف شهر)" : "First 5 years (half month)"}
                </span>
                <span className="font-medium">
                  {formatCurrency(result.breakdown.firstFiveYears)}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-muted-foreground">
                  {isArabic ? "ما بعد 5 سنوات (شهر كامل)" : "After 5 years (full month)"}
                </span>
                <span className="font-medium">
                  {formatCurrency(result.breakdown.afterFiveYears)}
                </span>
              </div>
              {result.percentage < 100 && (
                <div className="flex justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm text-amber-700">
                    {isArabic ? "نسبة الاستحقاق" : "Entitlement Rate"}
                  </span>
                  <span className="font-medium text-amber-700">
                    {result.percentage.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {isArabic ? "إجمالي المكافأة المستحقة" : "Total EOSB Amount"}
              </p>
              <p className="text-2xl font-bold text-orange-700">
                {formatCurrency(result.amount)}
              </p>
            </div>

            {/* Info Note */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-xs text-blue-700">
                {isArabic
                  ? "يتم احتساب المكافأة بناءً على آخر راتب أساسي مع البدلات الثابتة"
                  : "EOSB is calculated based on the last basic salary plus fixed allowances"}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button onClick={handleCalculate} disabled={!salary || !years} className="flex-1">
          <Calculator className="h-4 w-4 ml-2" />
          {isArabic ? "احسب" : "Calculate"}
        </Button>
        {result && (
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4" />
          </Button>
        )}
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// ============================================================================
// Annual Leave Calculator Component - حاسبة الإجازات
// ============================================================================

export function AnnualLeaveCalculatorCard() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const { calculateAnnualLeave } = useAnnualLeaveCalculator();

  const [years, setYears] = useState<string>("");
  const [daysWorked, setDaysWorked] = useState<string>("365");
  const [result, setResult] = useState<AnnualLeaveResult | null>(null);

  const handleCalculate = () => {
    const yearsNum = Number.parseFloat(years);
    const daysNum = Number.parseFloat(daysWorked);
    
    if (Number.isNaN(yearsNum) || yearsNum < 0) {
      toast.error(isArabic ? 'يرجى إدخال سنوات الخدمة' : 'Please enter years of service');
      return;
    }

    const calcResult = calculateAnnualLeave({
      yearsOfService: yearsNum,
      daysWorkedInYear: daysNum,
    });
    setResult(calcResult);

    // حفظ في السجل
    saveLeaveRecord(
      {
        yearsOfService: yearsNum,
        usedDays: 0,
        carryOverDays: 0,
        dailySalary: 0,
      },
      {
        annualEntitlement: calcResult.totalDays,
        remainingDays: calcResult.accruedDays,
        totalAccrued: calcResult.accruedDays,
        cashValue: 0,
      }
    );

    toast.success(isArabic ? 'تم حساب الإجازات' : 'Leave calculated successfully');
  };

  const handleReset = () => {
    setYears("");
    setDaysWorked("365");
    setResult(null);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              {isArabic ? "حاسبة الإجازات السنوية" : "Annual Leave Calculator"}
            </CardTitle>
            <CardDescription>
              {isArabic
                ? "احسب رصيد إجازاتك السنوية"
                : "Calculate your annual leave balance"}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-blue-600">
            Leave
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Years of Service */}
        <div className="space-y-2">
          <Label htmlFor="leave-years">
            {isArabic ? "سنوات الخدمة" : "Years of Service"}
          </Label>
          <Input
            id="leave-years"
            type="number"
            placeholder={isArabic ? "أدخل عدد السنوات" : "Enter years"}
            min="0"
            value={years}
            onChange={(e) => setYears(e.target.value)}
          />
        </div>

        {/* Days Worked */}
        <div className="space-y-2">
          <Label htmlFor="days-worked">
            {isArabic ? "أيام العمل هذا العام" : "Days Worked This Year"}
          </Label>
          <Input
            id="days-worked"
            type="number"
            placeholder="365"
            min="0"
            max="365"
            value={daysWorked}
            onChange={(e) => setDaysWorked(e.target.value)}
          />
        </div>

        <Separator />

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              {isArabic ? "النتائج" : "Results"}
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "الاستحقاق السنوي" : "Annual Entitlement"}
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {result.totalDays} {isArabic ? "يوم" : "days"}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "المستحق حالياً" : "Currently Accrued"}
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {result.accruedDays} {isArabic ? "يوم" : "days"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm">
                {(() => {
                  if (result.type === "extended") {
                    return isArabic
                      ? "تستحق الإجازة الممتدة (30 يوم) لأن خدمتك تجاوزت 5 سنوات"
                      : "You're entitled to extended leave (30 days) as your service exceeds 5 years";
                  }
                  return isArabic
                    ? "تستحق الإجازة الأساسية (21 يوم)"
                    : "You're entitled to standard leave (21 days)";
                })()}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button onClick={handleCalculate} disabled={!years} className="flex-1">
          <Calculator className="h-4 w-4 ml-2" />
          {isArabic ? "احسب" : "Calculate"}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// ============================================================================
// Calculators Page - صفحة الحاسبات
// ============================================================================

export function CalculatorsPage() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [activeTab, setActiveTab] = useState("gosi");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary text-primary-foreground">
              <Calculator className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {isArabic ? "الحاسبات المالية" : "Financial Calculators"}
              </h1>
              <p className="text-muted-foreground">
                {isArabic 
                  ? "احسب مستحقاتك بدقة حسب الأنظمة السعودية"
                  : "Calculate your entitlements accurately per Saudi regulations"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3 mx-auto">
            <TabsTrigger value="gosi" className="flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isArabic ? "التأمينات" : "GOSI"}
              </span>
            </TabsTrigger>
            <TabsTrigger value="eosb" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isArabic ? "نهاية الخدمة" : "EOSB"}
              </span>
            </TabsTrigger>
            <TabsTrigger value="leave" className="flex items-center gap-2">
              <Palmtree className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isArabic ? "الإجازات" : "Leave"}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gosi" className="space-y-4">
            <div className="max-w-2xl mx-auto">
              <GOSICalculatorCard />
            </div>
          </TabsContent>

          <TabsContent value="eosb" className="space-y-4">
            <div className="max-w-2xl mx-auto">
              <EOSBCalculatorCard />
            </div>
          </TabsContent>

          <TabsContent value="leave" className="space-y-4">
            <div className="max-w-2xl mx-auto">
              <AnnualLeaveCalculatorCard />
            </div>
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <div className="mt-12 p-6 rounded-lg bg-muted/50 border">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            {isArabic ? "معلومات هامة" : "Important Information"}
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• {isArabic 
              ? "جميع الحسابات تتم وفقاً لنظام العمل السعودي ونظام التأمينات الاجتماعية"
              : "All calculations are based on Saudi Labor Law and Social Insurance Law"}</li>
            <li>• {isArabic 
              ? "النتائج للاسترشاد فقط وقد تختلف عن الحسابات الرسمية"
              : "Results are for guidance only and may differ from official calculations"}</li>
            <li>• {isArabic 
              ? "للحصول على حسابات دقيقة، يرجى التواصل مع إدارة الموارد البشرية"
              : "For accurate calculations, please contact your HR department"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Export all components
// ============================================================================

export default {
  GOSICalculatorCard,
  EOSBCalculatorCard,
  AnnualLeaveCalculatorCard,
  CalculatorsPage,
};
