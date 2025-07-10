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
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen bg-background lg:flex-row'>
      <Navbar />
      <main className='w-full flex-1 overflow-auto'>
        <div className='p-4 lg:p-6'>{children}</div>
      </main>
      <NotificationToast />
    </div>
  );
}
