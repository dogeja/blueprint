"use client";

import { useEffect } from "react";
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";
import { cn } from "@/lib/utils";

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

export function NotificationToast() {
  const { notifications, removeNotification } = useUIStore();

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2'>
      {notifications.map((notification) => {
        const Icon = iconMap[notification.type];

        return (
          <div
            key={notification.id}
            className={cn(
              "max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto border",
              colorMap[notification.type],
              "animate-in slide-in-from-top-2 duration-300"
            )}
          >
            <div className='p-4'>
              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <Icon className='h-5 w-5' />
                </div>
                <div className='ml-3 w-0 flex-1'>
                  <p className='text-sm font-medium'>{notification.message}</p>
                </div>
                <div className='ml-4 flex-shrink-0 flex'>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className='rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
