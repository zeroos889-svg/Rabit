import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * Enhanced Error Fallback Component
 * Provides user-friendly error messages with recovery options
 */
export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  // Log error to monitoring service in production
  if (process.env.NODE_ENV === "production") {
    // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
    console.error("Error caught by boundary:", error);
  }

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-2xl">عذراً، حدث خطأ ما</CardTitle>
              <CardDescription>
                نعتذر عن الإزعاج. حدث خطأ غير متوقع في التطبيق.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Message */}
          {isDevelopment && (
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <h3 className="font-semibold text-sm mb-2 text-destructive">
                رسالة الخطأ (Development Only):
              </h3>
              <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
                {error.message}
              </pre>
              {error.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                    Stack Trace
                  </summary>
                  <pre className="text-xs text-muted-foreground mt-2 overflow-auto max-h-60">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* User-friendly message */}
          <div className="space-y-3">
            <h4 className="font-semibold">ماذا يمكنك فعله؟</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>حاول تحديث الصفحة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>تأكد من اتصالك بالإنترنت</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>امسح ذاكرة التخزين المؤقت للمتصفح</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>إذا استمرت المشكلة، اتصل بالدعم الفني</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={resetErrorBoundary}
              className="flex-1"
              size="lg"
            >
              <RefreshCw className="ml-2 h-4 w-4" />
              إعادة المحاولة
            </Button>
            <Button
              onClick={() => window.location.href = "/"}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <Home className="ml-2 h-4 w-4" />
              العودة للرئيسية
            </Button>
          </div>

          {/* Support info */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>
              هل تحتاج مساعدة؟{" "}
              <a
                href="/contact"
                className="text-primary hover:underline"
              >
                اتصل بالدعم الفني
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Compact Error Message Component
 * For inline error displays
 */
export function ErrorMessage({ 
  message, 
  retry 
}: { 
  message: string; 
  retry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">حدث خطأ</h3>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      </div>
      {retry && (
        <Button onClick={retry} variant="outline" size="sm">
          <RefreshCw className="ml-2 h-4 w-4" />
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}
