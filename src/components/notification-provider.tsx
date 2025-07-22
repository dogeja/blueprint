"use client";

import { useEffect } from "react";
import { initializeNotifications } from "@/lib/stores/notification-store";

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  useEffect(() => {
    // 알림 시스템 초기화
    initializeNotifications();
  }, []);

  return <>{children}</>;
}
