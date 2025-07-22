"use client";

import React, { useEffect } from "react";
import { OnboardingOverlay } from "@/components/ui/onboarding-overlay";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { useAuthStore } from "@/lib/stores/auth-store";

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { user } = useAuthStore();
  const { isActive, isCompleted, isSkipped, preferences } =
    useOnboardingStore();

  // 사용자가 로그인하고 온보딩이 완료되지 않은 경우 자동 시작
  useEffect(() => {
    if (user && !isCompleted() && !isSkipped() && preferences.showOnStartup) {
      // 약간의 지연 후 온보딩 시작 (페이지 로딩 완료 후)
      const timer = setTimeout(() => {
        if (!isActive) {
          // useOnboardingStore().startOnboarding();
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, isActive, isCompleted, isSkipped, preferences.showOnStartup]);

  return (
    <>
      {children}
      <OnboardingOverlay />
    </>
  );
}
