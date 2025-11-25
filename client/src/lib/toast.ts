import { toast as sonnerToast } from "sonner";
import React from "react";
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from "lucide-react";

// Enhanced toast utilities with Arabic support and better UX

interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  description?: string;
  dismissible?: boolean;
  icon?: React.ReactNode;
}

interface ToastQueueItem {
  id: string;
  type: "success" | "error" | "info" | "warning" | "loading";
  message: string;
  options?: ToastOptions;
  timestamp: number;
}

// Toast queue for managing multiple notifications
class ToastQueue {
  private queue: ToastQueueItem[] = [];
  private readonly activeToasts = new Set<string>();
  private readonly maxActive = 3;

  add(item: ToastQueueItem) {
    this.queue.push(item);
    this.process();
  }

  private process() {
    // Process queued toasts if we have space
    while (this.activeToasts.size < this.maxActive && this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        this.activeToasts.add(item.id);
        this.show(item);
      }
    }
  }

  private show(item: ToastQueueItem) {
    const toastFn = toast[item.type];
    toastFn(item.message, item.options);
    
    // Auto-remove from active toasts after duration
    setTimeout(() => {
      this.activeToasts.delete(item.id);
      this.process();
    }, item.options?.duration || 4000);
  }

  clear() {
    this.queue = [];
    this.activeToasts.clear();
    sonnerToast.dismiss();
  }
}

const toastQueue = new ToastQueue();

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      duration: options?.duration || 4000,
      action: options?.action,
      description: options?.description,
      dismissible: options?.dismissible !== false,
      icon: options?.icon || React.createElement(CheckCircle, { className: "h-5 w-5" }),
      className: "rtl:text-right toast-success",
      style: {
        direction: "rtl",
      },
    });
  },

  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      duration: options?.duration || 5000,
      action: options?.action,
      description: options?.description,
      dismissible: options?.dismissible !== false,
      icon: options?.icon || React.createElement(XCircle, { className: "h-5 w-5" }),
      className: "rtl:text-right toast-error",
      style: {
        direction: "rtl",
      },
    });
  },

  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      duration: options?.duration || 4000,
      action: options?.action,
      description: options?.description,
      dismissible: options?.dismissible !== false,
      icon: options?.icon || React.createElement(Info, { className: "h-5 w-5" }),
      className: "rtl:text-right toast-info",
      style: {
        direction: "rtl",
      },
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      duration: options?.duration || 4500,
      action: options?.action,
      description: options?.description,
      dismissible: options?.dismissible !== false,
      icon: options?.icon || React.createElement(AlertCircle, { className: "h-5 w-5" }),
      className: "rtl:text-right toast-warning",
      style: {
        direction: "rtl",
      },
    });
  },

  loading: (message: string, options?: Omit<ToastOptions, "duration">) => {
    return sonnerToast.loading(message, {
      description: options?.description,
      dismissible: options?.dismissible !== false,
      icon: options?.icon || React.createElement(Loader2, { className: "h-5 w-5 animate-spin" }),
      className: "rtl:text-right toast-loading",
      style: {
        direction: "rtl",
      },
    });
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options?: ToastOptions
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      description: options?.description,
      className: "rtl:text-right",
      style: {
        direction: "rtl",
      },
    });
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  clearAll: () => {
    toastQueue.clear();
  },
};

// Pre-defined success messages in Arabic
export const successMessages = {
  save: "تم الحفظ بنجاح ✓",
  update: "تم التحديث بنجاح ✓",
  delete: "تم الحذف بنجاح ✓",
  create: "تم الإنشاء بنجاح ✓",
  submit: "تم الإرسال بنجاح ✓",
  upload: "تم الرفع بنجاح ✓",
  download: "تم التنزيل بنجاح ✓",
  login: "تم تسجيل الدخول بنجاح ✓",
  logout: "تم تسجيل الخروج بنجاح ✓",
  register: "تم التسجيل بنجاح ✓",
  verify: "تم التحقق بنجاح ✓",
  send: "تم الإرسال بنجاح ✓",
  copy: "تم النسخ إلى الحافظة ✓",
  share: "تم المشاركة بنجاح ✓",
  payment: "تم الدفع بنجاح ✓",
  booking: "تم الحجز بنجاح ✓",
};

// Pre-defined error messages in Arabic
export const errorMessages = {
  save: "فشل الحفظ. الرجاء المحاولة مرة أخرى.",
  update: "فشل التحديث. الرجاء المحاولة مرة أخرى.",
  delete: "فشل الحذف. الرجاء المحاولة مرة أخرى.",
  create: "فشل الإنشاء. الرجاء المحاولة مرة أخرى.",
  submit: "فشل الإرسال. الرجاء المحاولة مرة أخرى.",
  upload: "فشل الرفع. الرجاء المحاولة مرة أخرى.",
  download: "فشل التنزيل. الرجاء المحاولة مرة أخرى.",
  login: "فشل تسجيل الدخول. تحقق من بياناتك.",
  logout: "فشل تسجيل الخروج. الرجاء المحاولة مرة أخرى.",
  register: "فشل التسجيل. الرجاء المحاولة مرة أخرى.",
  verify: "فشل التحقق. الرجاء المحاولة مرة أخرى.",
  send: "فشل الإرسال. الرجاء المحاولة مرة أخرى.",
  copy: "فشل النسخ. الرجاء المحاولة مرة أخرى.",
  network: "خطأ في الاتصال. تحقق من اتصالك بالإنترنت.",
  unauthorized: "جلستك انتهت. الرجاء تسجيل الدخول مرة أخرى.",
  forbidden: "ليس لديك صلاحية للقيام بهذا الإجراء.",
  notFound: "المورد المطلوب غير موجود.",
  server: "خطأ في الخادم. فريق الدعم يعمل على حل المشكلة.",
  payment: "فشلت عملية الدفع. الرجاء المحاولة مرة أخرى.",
};
