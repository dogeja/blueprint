"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, Play } from "lucide-react";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";

interface OnboardingTriggerProps {
  variant?: "default" | "icon" | "text";
  className?: string;
  children?: React.ReactNode;
}

export function OnboardingTrigger({
  variant = "default",
  className,
  children,
}: OnboardingTriggerProps) {
  const { startOnboarding, isCompleted, isSkipped } = useOnboardingStore();

  const handleStartOnboarding = async () => {
    await startOnboarding();
  };

  // 온보딩이 완료되었거나 건너뛰어진 경우 표시하지 않음
  if (isCompleted() || isSkipped()) {
    return null;
  }

  switch (variant) {
    case "icon":
      return (
        <Button
          variant='ghost'
          size='sm'
          onClick={handleStartOnboarding}
          className={className}
          title='온보딩 시작'
        >
          <HelpCircle className='h-4 w-4' />
        </Button>
      );

    case "text":
      return (
        <Button
          variant='link'
          onClick={handleStartOnboarding}
          className={className}
        >
          {children || "온보딩 시작"}
        </Button>
      );

    default:
      return (
        <Button onClick={handleStartOnboarding} className={className}>
          <Play className='h-4 w-4 mr-2' />
          {children || "온보딩 시작"}
        </Button>
      );
  }
}
