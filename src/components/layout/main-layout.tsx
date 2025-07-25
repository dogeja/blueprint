"use client";

import { Navbar } from "./navbar";
import { ToastContainer } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/stores/auth-store";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isLoading } = useAuthStore();

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

      {/* 토스트 시스템 */}
      <ToastContainer />
    </div>
  );
}
