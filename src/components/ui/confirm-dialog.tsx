"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "warning" | "danger" | "info";
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  onCancel,
  variant = "warning",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          border: "border-red-200 dark:border-red-800",
          bg: "bg-red-50 dark:bg-red-950/20",
          icon: "text-red-600 dark:text-red-400",
          title: "text-red-800 dark:text-red-200",
          message: "text-red-700 dark:text-red-300",
          confirmButton: "bg-red-600 hover:bg-red-700 text-white",
        };
      case "info":
        return {
          border: "border-blue-200 dark:border-blue-800",
          bg: "bg-blue-50 dark:bg-blue-950/20",
          icon: "text-blue-600 dark:text-blue-400",
          title: "text-blue-800 dark:text-blue-200",
          message: "text-blue-700 dark:text-blue-300",
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
        };
      default: // warning
        return {
          border: "border-orange-200 dark:border-orange-800",
          bg: "bg-orange-50 dark:bg-orange-950/20",
          icon: "text-orange-600 dark:text-orange-400",
          title: "text-orange-800 dark:text-orange-200",
          message: "text-orange-700 dark:text-orange-300",
          confirmButton: "bg-orange-600 hover:bg-orange-700 text-white",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <Card
        className={`w-full max-w-md border-2 ${styles.border} ${styles.bg}`}
      >
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <AlertTriangle className={`w-5 h-5 ${styles.icon}`} />
              <CardTitle className={`text-lg ${styles.title}`}>
                {title}
              </CardTitle>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={onCancel}
              className='h-8 w-8 p-0'
            >
              <X className='w-4 h-4' />
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className={`text-sm ${styles.message}`}>{message}</p>
          <div className='flex gap-2'>
            <Button
              onClick={onConfirm}
              className={`flex-1 ${styles.confirmButton}`}
            >
              {confirmText}
            </Button>
            <Button variant='outline' onClick={onCancel} className='flex-1'>
              {cancelText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
