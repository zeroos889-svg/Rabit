import { Component, ReactNode } from "react";
import { ErrorFallback } from "./ErrorFallback";
import { errorLogger } from "@/lib/errorLogger";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
  lastErrorTime: number | null;
}

/**
 * Enhanced Error Boundary Component
 * Catches React component errors and displays user-friendly fallback UI
 * Includes error recovery mechanisms and error tracking
 */
class ErrorBoundary extends Component<Props, State> {
  private resetTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorCount: 0,
      lastErrorTime: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error using centralized error logger
    const safeErrorInfo = {
      componentStack: errorInfo.componentStack ?? undefined,
    };
    errorLogger.componentError(error, safeErrorInfo, "ErrorBoundary");

    // Track error frequency (for detecting error loops)
    const now = Date.now();
    const timeSinceLastError = this.state.lastErrorTime 
      ? now - this.state.lastErrorTime 
      : Infinity;

    // If errors are happening rapidly (< 5 seconds apart), increase count
    this.setState((prevState) => {
      const newErrorCount = timeSinceLastError < 5000 
        ? prevState.errorCount + 1 
        : 1;

      return {
        errorCount: newErrorCount,
        lastErrorTime: now
      };
    });

    // Auto-recovery mechanism: if only 1-2 errors, try to auto-reset after 10 seconds
    const errorCount = timeSinceLastError < 5000 ? this.state.errorCount + 1 : 1;
    if (errorCount <= 2) {
      this.resetTimeout = setTimeout(() => {
        this.handleReset();
      }, 10000);
    }
  }

  componentWillUnmount() {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
  }

  handleReset = () => {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
      this.resetTimeout = null;
    }
    
    this.setState({ 
      hasError: false, 
      error: null,
      // Keep error count for tracking, but reset if enough time has passed
      errorCount: 0,
      lastErrorTime: null
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // If error loop detected (3+ rapid errors), show more serious warning
      if (this.state.errorCount >= 3) {
        return (
          <div className="min-h-screen flex items-center justify-center p-4 bg-destructive/5">
            <div className="max-w-md text-center space-y-4">
              <h2 className="text-2xl font-bold text-destructive">
                خطأ متكرر
              </h2>
              <p className="text-muted-foreground">
                حدثت أخطاء متعددة بشكل متتالي. قد تحتاج إلى:
              </p>
              <ul className="text-sm text-right space-y-2">
                <li>• مسح ذاكرة التخزين المؤقت</li>
                <li>• إعادة تشغيل المتصفح</li>
                <li>• الاتصال بالدعم الفني</li>
              </ul>
              <button
                onClick={() => globalThis.window.location.href = "/"}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        );
      }

      // Use custom fallback if provided, otherwise use default ErrorFallback
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return <ErrorFallback error={this.state.error} resetErrorBoundary={this.handleReset} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
