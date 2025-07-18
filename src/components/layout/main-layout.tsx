"use client";

import { Navbar } from "./navbar";
import { NotificationToast } from "./notification-toast";
import { ToastContainer } from "@/components/ui/toast";
import { Celebration } from "@/components/ui/celebration";
import { ProgressUpdate } from "@/components/ui/progress-update";
import { AchievementNotification } from "@/components/ui/achievement-notification";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useFeedbackStore } from "@/lib/stores/feedback-store";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isLoading } = useAuthStore();
  const { showCelebration, showProgressUpdate } = useFeedbackStore();

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

      {/* 피드백 시스템 */}
      <ToastContainer />
      <AchievementNotification />
      {showCelebration && <Celebration />}
      {showProgressUpdate && (
        <ProgressUpdate
          isVisible={showProgressUpdate}
          oldProgress={0}
          newProgress={100}
          onComplete={() =>
            useFeedbackStore.getState().setShowProgressUpdate(false)
          }
        />
      )}
    </div>
  );
}
