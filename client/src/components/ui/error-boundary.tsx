import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, ChevronLeft, Bug, Mail } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: unknown[];
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Enhanced Error Boundary component with beautiful UI and recovery options
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error to error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props): void {
    // Reset error state when resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, index) => prevProps.resetKeys?.[index] !== key
      );
      if (hasChanged) {
        this.resetError();
      }
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  readonly error: Error | null;
  readonly errorInfo?: ErrorInfo | null;
  readonly resetError: () => void;
}

/**
 * Beautiful error fallback UI
 */
export function ErrorFallback({ error, errorInfo, resetError }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 -right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-red-300/30 to-orange-300/30 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 -left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-blue-300/30 to-purple-300/30 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
                <div className="relative p-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full">
                  <AlertTriangle className="h-12 w-12 text-white" />
                </div>
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              حدث خطأ غير متوقع
            </CardTitle>
            <CardDescription className="text-base mt-2">
              نعتذر عن هذا الإزعاج. يمكنك محاولة تحديث الصفحة أو العودة للرئيسية.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={resetError}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <RefreshCw className="h-4 w-4 ml-2" />
                إعادة المحاولة
              </Button>
              <Button
                variant="outline"
                onClick={() => globalThis.location.href = "/"}
                className="flex-1"
              >
                <Home className="h-4 w-4 ml-2" />
                الصفحة الرئيسية
              </Button>
            </div>

            {/* Error Details Toggle */}
            <div className="border-t pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full justify-between text-muted-foreground hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  تفاصيل الخطأ التقنية
                </span>
                <ChevronLeft className={`h-4 w-4 transition-transform ${showDetails ? "rotate-90" : ""}`} />
              </Button>
              
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-mono overflow-auto max-h-48">
                    <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
                      {error?.name}: {error?.message}
                    </p>
                    {errorInfo?.componentStack && (
                      <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                        {errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Contact Support */}
            <div className="text-center text-sm text-muted-foreground">
              <p>إذا استمرت المشكلة، تواصل معنا:</p>
              <Button variant="link" className="text-blue-600 p-0 h-auto">
                <Mail className="h-3 w-3 ml-1" />
                support@rabt.sa
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/**
 * Simple inline error display for smaller components
 */
interface InlineErrorProps {
  readonly message: string;
  readonly onRetry?: () => void;
}

export function InlineError({ 
  message, 
  onRetry 
}: InlineErrorProps) {
  return (
    <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
      <AlertTriangle className="h-5 w-5 flex-shrink-0" />
      <span className="text-sm">{message}</span>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="text-red-600 hover:text-red-700">
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * Page-level error component
 */
interface PageErrorProps {
  readonly title?: string;
  readonly message?: string;
  readonly onRetry?: () => void;
}

export function PageError({ 
  title = "حدث خطأ",
  message = "تعذر تحميل هذه الصفحة. يرجى المحاولة مرة أخرى.",
  onRetry,
}: PageErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4"
      >
        <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
      </motion.div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} className="bg-gradient-to-r from-blue-600 to-purple-600">
          <RefreshCw className="h-4 w-4 ml-2" />
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
