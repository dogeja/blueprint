"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { NotificationToast } from "./notification-toast";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useRecentPagesStore } from "@/lib/stores/recent-pages-store";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isLoading } = useAuthStore();
  const pathname = usePathname();
  const { addPage } = useRecentPagesStore();

  // 페이지 방문 기록 추가
  useEffect(() => {
    if (pathname && pathname !== "/") {
      // 페이지별 이름 매핑
      const pageNames: Record<string, string> = {
        "/dashboard": "대시보드",
        "/daily-report": "일일보고",
        "/goals": "목표 관리",
        "/analysis": "분석",
        "/settings": "설정",
      };

      const pageName = pageNames[pathname] || "페이지";

      addPage({
        path: pathname,
        name: pageName,
      });
    }
  }, [pathname, addPage]);

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen bg-background'>
      <Navbar />
      <main className='flex-1 overflow-auto'>
        <div className='p-4 lg:p-6'>{children}</div>
      </main>
      <NotificationToast />
    </div>
  );
}
