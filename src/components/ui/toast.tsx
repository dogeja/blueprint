"use client";

import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { create } from "zustand";
import { cn } from "@/lib/utils";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // 자동 제거
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  clearToasts: () => {
    set({ toasts: [] });
  },
}));

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const toastStyles = {
  success:
    "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-200",
  error:
    "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-200",
  info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-200",
  warning:
    "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-200",
};

const iconStyles = {
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
  warning: "text-yellow-600 dark:text-yellow-400",
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToastStore();
  const [isVisible, setIsVisible] = useState(false);
  const Icon = toastIcons[toast.type];

  useEffect(() => {
    // 애니메이션을 위한 지연
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => removeToast(toast.id), 300);
  };

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ease-out max-w-sm",
        toastStyles[toast.type],
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <Icon
        className={cn("w-5 h-5 mt-0.5 flex-shrink-0", iconStyles[toast.type])}
      />

      <div className='flex-1 min-w-0'>
        <h4 className='font-medium text-sm'>{toast.title}</h4>
        {toast.message && (
          <p className='text-sm mt-1 opacity-90'>{toast.message}</p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className='text-sm font-medium underline mt-2 hover:no-underline'
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleRemove}
        className='flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors'
      >
        <X className='w-4 h-4' />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2 max-w-sm'>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

// 편의 함수들
export const toast = {
  success: (title: string, message?: string, options?: Partial<Toast>) => {
    useToastStore.getState().addToast({
      type: "success",
      title,
      message,
      ...options,
    });
  },
  error: (title: string, message?: string, options?: Partial<Toast>) => {
    useToastStore.getState().addToast({
      type: "error",
      title,
      message,
      ...options,
    });
  },
  info: (title: string, message?: string, options?: Partial<Toast>) => {
    useToastStore.getState().addToast({
      type: "info",
      title,
      message,
      ...options,
    });
  },
  warning: (title: string, message?: string, options?: Partial<Toast>) => {
    useToastStore.getState().addToast({
      type: "warning",
      title,
      message,
      ...options,
    });
  },
};
