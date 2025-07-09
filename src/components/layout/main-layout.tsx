"use client";

import { Navbar } from "./navbar";
import { NotificationToast } from "./notification-toast";
import { useAuthStore } from "@/lib/stores/auth-store";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='flex h-screen bg-gray-50'>
      <Navbar />
      <main className='flex-1 overflow-auto lg:ml-0'>
        <div className='p-4 lg:p-6'>{children}</div>
      </main>
      <NotificationToast />
    </div>
  );
}
