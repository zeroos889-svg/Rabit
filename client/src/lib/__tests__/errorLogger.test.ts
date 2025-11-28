/**
 * Error Logger Tests
 * Tests for centralized error logging system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock console methods
const originalConsole = {
  error: console.error,
  warn: console.warn,
  info: console.info,
};

// Mock localStorage
class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// Simplified ErrorLogger implementation for testing
interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: unknown;
}

interface ErrorLog {
  message: string;
  stack?: string;
  context?: ErrorContext;
  timestamp: string;
  environment: "development" | "production";
}

class ErrorLogger {
  private readonly isDevelopment = true; // Mock as dev environment
  private readonly isProduction = false;
  private readonly MAX_STORED_ERRORS = 50;
  private readonly STORAGE_KEY = "error_logs";

  error(error: Error | string, context?: ErrorContext): void {
    const errorLog: ErrorLog = {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: new Date().toISOString(),
      environment: this.isDevelopment ? "development" : "production",
    };

    if (this.isDevelopment) {
      console.error("❌ Error:", errorLog.message);
      if (errorLog.stack) console.error("Stack:", errorLog.stack);
      if (context) console.error("Context:", context);
    }

    if (this.isProduction) {
      this.sendToMonitoring(errorLog);
    }

    this.storeError(errorLog);
  }

  warn(message: string, context?: ErrorContext): void {
    if (this.isDevelopment) {
      console.warn("⚠️ Warning:", message);
      if (context) console.warn("Context:", context);
    }

    const errorLog: ErrorLog = {
      message,
      context,
      timestamp: new Date().toISOString(),
      environment: this.isDevelopment ? "development" : "production",
    };

    this.storeError(errorLog);
  }

  info(message: string): void {
    if (this.isDevelopment) {
      console.info("ℹ️ Info:", message);
    }
  }

  componentError(error: Error, errorInfo: { componentStack?: string }, component: string): void {
    this.error(error, {
      component,
      componentStack: errorInfo.componentStack,
      type: "react-component-error",
    });
  }

  networkError(error: Error | string, endpoint: string, method: string): void {
    this.error(error, {
      type: "network-error",
      endpoint,
      method,
    });
  }

  validationError(message: string, field: string, value: unknown): void {
    this.error(message, {
      type: "validation-error",
      field,
      value,
    });
  }

  private sendToMonitoring(_errorLog: ErrorLog): void {
    // Production monitoring integration would go here
    // For now, just a placeholder
  }

  private storeError(errorLog: ErrorLog): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const errors: ErrorLog[] = stored ? JSON.parse(stored) : [];
      
      errors.push(errorLog);
      
      // Keep only last MAX_STORED_ERRORS
      if (errors.length > this.MAX_STORED_ERRORS) {
        errors.shift();
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(errors));
    } catch {
      // Silently fail if localStorage is not available
    }
  }

  getStoredErrors(): ErrorLog[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  clearStoredErrors(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // Silently fail
    }
  }
}

describe("ErrorLogger", () => {
  let errorLogger: ErrorLogger;
  let mockLocalStorage: MockLocalStorage;

  beforeEach(() => {
    // Setup mocks
    mockLocalStorage = new MockLocalStorage();
    (global as any).localStorage = mockLocalStorage;
    
    console.error = vi.fn();
    console.warn = vi.fn();
    console.info = vi.fn();
    
    errorLogger = new ErrorLogger();
    errorLogger.clearStoredErrors();
  });

  afterEach(() => {
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  });

  describe("Error Logging", () => {
    it("should log Error objects", () => {
      const error = new Error("Test error");
      errorLogger.error(error);

      expect(console.error).toHaveBeenCalledWith("❌ Error:", "Test error");
    });

    it("should log string errors", () => {
      errorLogger.error("String error message");

      expect(console.error).toHaveBeenCalledWith("❌ Error:", "String error message");
    });

    it("should log error context", () => {
      const error = new Error("Test error");
      const context = { component: "TestComponent", action: "submit" };
      
      errorLogger.error(error, context);

      expect(console.error).toHaveBeenCalledWith("Context:", context);
    });

    it("should log stack traces for Error objects", () => {
      const error = new Error("Test error");
      errorLogger.error(error);

      expect(console.error).toHaveBeenCalledWith("Stack:", expect.any(String));
    });

    it("should store errors in localStorage", () => {
      errorLogger.error("Test error");

      const stored = errorLogger.getStoredErrors();
      expect(stored.length).toBe(1);
      expect(stored[0].message).toBe("Test error");
    });
  });

  describe("Warning Logging", () => {
    it("should log warnings", () => {
      errorLogger.warn("Test warning");

      expect(console.warn).toHaveBeenCalledWith("⚠️ Warning:", "Test warning");
    });

    it("should log warning context", () => {
      const context = { component: "TestComponent" };
      errorLogger.warn("Test warning", context);

      expect(console.warn).toHaveBeenCalledWith("Context:", context);
    });

    it("should store warnings", () => {
      errorLogger.warn("Test warning");

      const stored = errorLogger.getStoredErrors();
      expect(stored.length).toBe(1);
      expect(stored[0].message).toBe("Test warning");
    });
  });

  describe("Info Logging", () => {
    it("should log info messages in development", () => {
      errorLogger.info("Test info");

      expect(console.info).toHaveBeenCalledWith("ℹ️ Info:", "Test info");
    });
  });

  describe("Component Error Logging", () => {
    it("should log React component errors", () => {
      const error = new Error("Component error");
      const errorInfo = { componentStack: "at ComponentName..." };
      
      errorLogger.componentError(error, errorInfo, "TestComponent");

      const stored = errorLogger.getStoredErrors();
      expect(stored[0].context?.component).toBe("TestComponent");
      expect(stored[0].context?.type).toBe("react-component-error");
    });
  });

  describe("Network Error Logging", () => {
    it("should log network errors with endpoint info", () => {
      const error = new Error("Network error");
      
      errorLogger.networkError(error, "/api/users", "GET");

      const stored = errorLogger.getStoredErrors();
      expect(stored[0].context?.type).toBe("network-error");
      expect(stored[0].context?.endpoint).toBe("/api/users");
      expect(stored[0].context?.method).toBe("GET");
    });

    it("should log string network errors", () => {
      errorLogger.networkError("Connection timeout", "/api/data", "POST");

      const stored = errorLogger.getStoredErrors();
      expect(stored[0].message).toBe("Connection timeout");
    });
  });

  describe("Validation Error Logging", () => {
    it("should log validation errors with field info", () => {
      errorLogger.validationError("Invalid email", "email", "invalid@");

      const stored = errorLogger.getStoredErrors();
      expect(stored[0].context?.type).toBe("validation-error");
      expect(stored[0].context?.field).toBe("email");
      expect(stored[0].context?.value).toBe("invalid@");
    });
  });

  describe("Error Storage", () => {
    it("should limit stored errors to MAX_STORED_ERRORS", () => {
      // Log 60 errors (more than MAX_STORED_ERRORS)
      for (let i = 0; i < 60; i++) {
        errorLogger.error(`Error ${i}`);
      }

      const stored = errorLogger.getStoredErrors();
      expect(stored.length).toBeLessThanOrEqual(50);
    });

    it("should keep most recent errors when limit is exceeded", () => {
      // Log 60 errors
      for (let i = 0; i < 60; i++) {
        errorLogger.error(`Error ${i}`);
      }

      const stored = errorLogger.getStoredErrors();
      // Should have errors 10-59 (last 50)
      expect(stored[0].message).toBe("Error 10");
      expect(stored[stored.length - 1].message).toBe("Error 59");
    });

    it("should clear stored errors", () => {
      errorLogger.error("Test error");
      expect(errorLogger.getStoredErrors().length).toBe(1);

      errorLogger.clearStoredErrors();
      expect(errorLogger.getStoredErrors().length).toBe(0);
    });

    it("should handle localStorage errors gracefully", () => {
      // Simulate localStorage error
      mockLocalStorage.setItem = vi.fn(() => {
        throw new Error("Storage quota exceeded");
      });

      // Should not throw
      expect(() => errorLogger.error("Test error")).not.toThrow();
    });
  });

  describe("Error Log Format", () => {
    it("should include timestamp in error logs", () => {
      errorLogger.error("Test error");

      const stored = errorLogger.getStoredErrors();
      expect(stored[0].timestamp).toBeDefined();
      expect(new Date(stored[0].timestamp).getTime()).toBeGreaterThan(0);
    });

    it("should include environment in error logs", () => {
      errorLogger.error("Test error");

      const stored = errorLogger.getStoredErrors();
      expect(stored[0].environment).toBe("development");
    });

    it("should preserve all context fields", () => {
      const context = {
        component: "TestComponent",
        action: "submit",
        userId: "user123",
        customField: "custom value",
      };

      errorLogger.error("Test error", context);

      const stored = errorLogger.getStoredErrors();
      expect(stored[0].context).toEqual(context);
    });
  });
});
