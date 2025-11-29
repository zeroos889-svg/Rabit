/**
 * Compliance Check Components - مكونات فحص الامتثال
 * 
 * مكونات React لعرض نتائج فحص الامتثال للأنظمة السعودية
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Shield,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import type { ComplianceCheckResult } from "@/hooks/useAI";

// ============================================================================
// Types
// ============================================================================

export interface ComplianceIssue {
  type: string;
  message: string;
  severity: "high" | "medium" | "low";
  recommendation?: string;
  regulationRef?: string;
}

export interface ComplianceScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export interface ComplianceResultCardProps {
  result: ComplianceCheckResult;
  title?: string;
  showDetails?: boolean;
}

export interface ComplianceIssueItemProps {
  issue: ComplianceIssue;
  index: number;
}

// ============================================================================
// Compliance Score Component - عرض درجة الامتثال
// ============================================================================

export function ComplianceScore({ score, size = "md", showLabel = true }: ComplianceScoreProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    if (score >= 40) return "bg-orange-100";
    return "bg-red-100";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return isArabic ? "ممتاز" : "Excellent";
    if (score >= 60) return isArabic ? "جيد" : "Good";
    if (score >= 40) return isArabic ? "متوسط" : "Fair";
    return isArabic ? "يحتاج تحسين" : "Needs Improvement";
  };

  const sizeClasses = {
    sm: "w-16 h-16 text-lg",
    md: "w-24 h-24 text-2xl",
    lg: "w-32 h-32 text-3xl",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${sizeClasses[size]} ${getScoreBg(score)} rounded-full flex items-center justify-center`}
      >
        <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
      </div>
      {showLabel && (
        <Badge variant="outline" className={getScoreColor(score)}>
          {getScoreLabel(score)}
        </Badge>
      )}
    </div>
  );
}

// ============================================================================
// Compliance Issue Item - عنصر المشكلة
// ============================================================================

export function ComplianceIssueItem({ issue, index }: ComplianceIssueItemProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [expanded, setExpanded] = useState(false);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "low":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-50 border-red-200";
      case "medium":
        return "bg-yellow-50 border-yellow-200";
      case "low":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "high":
        return isArabic ? "عالي" : "High";
      case "medium":
        return isArabic ? "متوسط" : "Medium";
      case "low":
        return isArabic ? "منخفض" : "Low";
      default:
        return severity;
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getSeverityBg(issue.severity)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getSeverityIcon(issue.severity)}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant={issue.severity === "high" ? "destructive" : "secondary"}
                className="text-xs"
              >
                {getSeverityLabel(issue.severity)}
              </Badge>
              <span className="text-xs text-muted-foreground">#{index + 1}</span>
            </div>
            <p className="font-medium text-sm">{issue.message}</p>
            {issue.type && (
              <p className="text-xs text-muted-foreground mt-1">
                {isArabic ? "النوع: " : "Type: "}{issue.type}
              </p>
            )}
          </div>
        </div>
        {issue.recommendation && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="me-2"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {expanded && issue.recommendation && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">
                {isArabic ? "التوصية:" : "Recommendation:"}
              </p>
              <p className="text-sm text-muted-foreground">{issue.recommendation}</p>
            </div>
          </div>
          {issue.regulationRef && (
            <Button variant="link" size="sm" className="mt-2 p-0 h-auto">
              <ExternalLink className="h-3 w-3 me-1" />
              {isArabic ? "مرجع النظام" : "Regulation Reference"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Compliance Result Card - بطاقة نتيجة الامتثال
// ============================================================================

export function ComplianceResultCard({
  result,
  title,
  showDetails = true,
}: ComplianceResultCardProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [showAllIssues, setShowAllIssues] = useState(false);

  const highIssues = result.issues.filter((i) => i.severity === "high");
  const mediumIssues = result.issues.filter((i) => i.severity === "medium");
  const lowIssues = result.issues.filter((i) => i.severity === "low");

  const displayedIssues = showAllIssues ? result.issues : result.issues.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {result.compliant ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {title || (isArabic ? "نتيجة فحص الامتثال" : "Compliance Check Result")}
            </CardTitle>
            <CardDescription>
              {result.compliant
                ? isArabic
                  ? "المنشأة ملتزمة بالأنظمة"
                  : "Organization is compliant"
                : isArabic
                ? "يوجد بعض المخالفات التي تحتاج معالجة"
                : "There are some issues that need attention"}
            </CardDescription>
          </div>
          <ComplianceScore score={result.score} size="md" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {isArabic ? "نسبة الامتثال" : "Compliance Rate"}
            </span>
            <span className="font-medium">{result.score}%</span>
          </div>
          <Progress value={result.score} className="h-2" />
        </div>

        {/* Issue Summary */}
        {result.issues.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-red-50">
              <p className="text-2xl font-bold text-red-600">{highIssues.length}</p>
              <p className="text-xs text-muted-foreground">
                {isArabic ? "عالية الخطورة" : "High Priority"}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-50">
              <p className="text-2xl font-bold text-yellow-600">{mediumIssues.length}</p>
              <p className="text-xs text-muted-foreground">
                {isArabic ? "متوسطة" : "Medium"}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50">
              <p className="text-2xl font-bold text-blue-600">{lowIssues.length}</p>
              <p className="text-xs text-muted-foreground">
                {isArabic ? "منخفضة" : "Low"}
              </p>
            </div>
          </div>
        )}

        {/* Issues List */}
        {showDetails && result.issues.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">
              {isArabic ? "المشكلات المكتشفة:" : "Detected Issues:"}
            </h4>
            {displayedIssues.map((issue, index) => (
              <ComplianceIssueItem key={index} issue={issue} index={index} />
            ))}
            {result.issues.length > 3 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAllIssues(!showAllIssues)}
              >
                {showAllIssues
                  ? isArabic
                    ? "عرض أقل"
                    : "Show Less"
                  : isArabic
                  ? `عرض الكل (${result.issues.length})`
                  : `Show All (${result.issues.length})`}
              </Button>
            )}
          </div>
        )}

        {/* Recommendations */}
        {result.recommendations && result.recommendations.length > 0 && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>{isArabic ? "توصيات" : "Recommendations"}</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Compliance Check Dialog - نافذة فحص الامتثال
// ============================================================================

interface ComplianceCheckDialogProps {
  trigger: React.ReactNode;
  onCheck: () => Promise<ComplianceCheckResult | null>;
  title?: string;
  description?: string;
}

export function ComplianceCheckDialog({
  trigger,
  onCheck,
  title,
  description,
}: ComplianceCheckDialogProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComplianceCheckResult | null>(null);

  const handleCheck = async () => {
    setLoading(true);
    try {
      const checkResult = await onCheck();
      setResult(checkResult);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {title || (isArabic ? "فحص الامتثال" : "Compliance Check")}
          </DialogTitle>
          <DialogDescription>
            {description ||
              (isArabic
                ? "فحص مدى التزام المنشأة بالأنظمة واللوائح السعودية"
                : "Check organization compliance with Saudi regulations")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!result ? (
            <div className="text-center py-8">
              <FileCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {isArabic
                  ? "اضغط على الزر أدناه لبدء فحص الامتثال"
                  : "Click the button below to start compliance check"}
              </p>
              <Button onClick={handleCheck} disabled={loading}>
                {loading ? (
                  <>
                    <span className="animate-spin ms-2">⟳</span>
                    {isArabic ? "جاري الفحص..." : "Checking..."}
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 me-2" />
                    {isArabic ? "بدء الفحص" : "Start Check"}
                  </>
                )}
              </Button>
            </div>
          ) : (
            <ComplianceResultCard result={result} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Compliance Summary Badge - شارة ملخص الامتثال
// ============================================================================

interface ComplianceSummaryBadgeProps {
  compliant: boolean;
  score: number;
  issueCount?: number;
  onClick?: () => void;
}

export function ComplianceSummaryBadge({
  compliant,
  score,
  issueCount = 0,
  onClick,
}: ComplianceSummaryBadgeProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        compliant
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-red-100 text-red-700 hover:bg-red-200"
      }`}
    >
      {compliant ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <AlertTriangle className="h-4 w-4" />
      )}
      <span>
        {compliant
          ? isArabic
            ? "ملتزم"
            : "Compliant"
          : isArabic
          ? `${issueCount} مخالفة`
          : `${issueCount} Issues`}
      </span>
      <span className="text-xs opacity-70">({score}%)</span>
    </button>
  );
}

// ============================================================================
// Export all components
// ============================================================================

export default {
  ComplianceScore,
  ComplianceIssueItem,
  ComplianceResultCard,
  ComplianceCheckDialog,
  ComplianceSummaryBadge,
};
