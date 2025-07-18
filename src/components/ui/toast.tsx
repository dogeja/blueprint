"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { useFeedbackStore, FeedbackToast } from "@/lib/stores/feedback-store";

export interface ToastProps {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onRemove: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
};

const toastStyles = {
  success:
    "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
  info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
  warning:
    "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
  error:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
};

export function Toast({
  id,
  type,
  title,
  message,
  action,
  onRemove,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const Icon = toastIcons[type];

  useEffect(() => {
    // 진입 애니메이션
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(id), 300);
  };

  return (
    <div
      className={cn(
        "relative w-full max-w-sm p-4 rounded-lg border shadow-lg transition-all duration-300 transform",
        toastStyles[type],
        isVisible && !isLeaving
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      )}
    >
      <div className='flex items-start gap-3'>
        <Icon className='w-5 h-5 mt-0.5 flex-shrink-0' />
        <div className='flex-1 min-w-0'>
          <h4 className='font-semibold text-sm'>{title}</h4>
          {message && <p className='text-sm mt-1 opacity-90'>{message}</p>}
          {action && (
            <Button
              variant='outline'
              size='sm'
              onClick={action.onClick}
              className='mt-2 h-7 px-2 text-xs'
            >
              {action.label}
            </Button>
          )}
        </div>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleRemove}
          className='h-6 w-6 p-0 opacity-70 hover:opacity-100'
        >
          <X className='w-4 h-4' />
        </Button>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useFeedbackStore();

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2'>
      {toasts.map((toast: FeedbackToast) => (
        <Toast key={toast.id} {...toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
