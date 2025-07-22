"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, SkipForward, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { OnboardingStep } from "@/lib/onboarding";

interface OnboardingOverlayProps {
  className?: string;
}

export function OnboardingOverlay({ className }: OnboardingOverlayProps) {
  const {
    isActive,
    currentStepIndex,
    getCurrentStep,
    getProgress,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
  } = useOnboardingStore();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const currentStep = getCurrentStep();
  const progress = getProgress();

  // 타겟 요소 찾기 및 위치 계산
  useEffect(() => {
    if (!isActive || !currentStep?.target) {
      setTargetElement(null);
      return;
    }

    const element = document.querySelector(currentStep.target) as HTMLElement;
    if (element) {
      setTargetElement(element);
      const rect = element.getBoundingClientRect();
      setOverlayPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  }, [isActive, currentStep]);

  // 타겟 요소 하이라이트
  useEffect(() => {
    if (targetElement) {
      targetElement.style.zIndex = "9999";
      targetElement.style.position = "relative";
      targetElement.style.boxShadow = "0 0 0 4px hsl(var(--primary) / 0.3)";
      targetElement.style.borderRadius = "8px";
    }

    return () => {
      if (targetElement) {
        targetElement.style.zIndex = "";
        targetElement.style.position = "";
        targetElement.style.boxShadow = "";
        targetElement.style.borderRadius = "";
      }
    };
  }, [targetElement]);

  if (!isActive || !currentStep) {
    return null;
  }

  const handleNext = async () => {
    if (currentStep.action) {
      // 액션 실행
      executeAction(currentStep.action);
    }
    await nextStep();
  };

  const handlePrevious = async () => {
    await previousStep();
  };

  const handleSkip = async () => {
    await skipOnboarding();
  };

  const handleComplete = async () => {
    await completeOnboarding();
  };

  const executeAction = (action: OnboardingStep["action"]) => {
    if (!action) return;

    switch (action.type) {
      case "click":
        if (action.target) {
          const element = document.querySelector(action.target) as HTMLElement;
          element?.click();
        }
        break;
      case "input":
        if (action.target && action.value) {
          const element = document.querySelector(
            action.target
          ) as HTMLInputElement;
          if (element) {
            element.value = action.value;
            element.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
        break;
      case "navigate":
        if (action.target) {
          window.location.href = action.target;
        }
        break;
    }
  };

  const getTooltipPosition = () => {
    if (!targetElement || !currentStep.position) return {};

    const rect = targetElement.getBoundingClientRect();
    const tooltipOffset = 20;

    switch (currentStep.position) {
      case "top":
        return {
          bottom: window.innerHeight - rect.top + tooltipOffset,
          left: rect.left + rect.width / 2,
          transform: "translateX(-50%)",
        };
      case "bottom":
        return {
          top: rect.bottom + tooltipOffset,
          left: rect.left + rect.width / 2,
          transform: "translateX(-50%)",
        };
      case "left":
        return {
          top: rect.top + rect.height / 2,
          right: window.innerWidth - rect.left + tooltipOffset,
          transform: "translateY(-50%)",
        };
      case "right":
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + tooltipOffset,
          transform: "translateY(-50%)",
        };
      default:
        return {};
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 z-[9998] bg-black/50'
      >
        {/* 타겟 요소 하이라이트 */}
        {targetElement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className='absolute border-4 border-primary/30 rounded-lg pointer-events-none'
            style={{
              top: overlayPosition.top - 4,
              left: overlayPosition.left - 4,
              width: overlayPosition.width + 8,
              height: overlayPosition.height + 8,
            }}
          />
        )}

        {/* 툴팁 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className='absolute bg-background border border-border rounded-lg shadow-lg max-w-sm p-4'
          style={getTooltipPosition()}
        >
          {/* 진행률 */}
          <div className='mb-3'>
            <div className='flex items-center justify-between text-sm text-muted-foreground mb-1'>
              <span>진행률</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className='h-2' />
          </div>

          {/* 제목 */}
          <h3 className='text-lg font-semibold mb-2'>{currentStep.title}</h3>

          {/* 설명 */}
          <p className='text-sm text-muted-foreground mb-4'>
            {currentStep.description}
          </p>

          {/* 액션 버튼들 */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {currentStepIndex > 0 && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handlePrevious}
                  className='flex items-center gap-1'
                >
                  <ChevronLeft className='h-4 w-4' />
                  이전
                </Button>
              )}
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleSkip}
                className='flex items-center gap-1'
              >
                <SkipForward className='h-4 w-4' />
                건너뛰기
              </Button>

              {currentStepIndex === 0 ? (
                <Button
                  onClick={handleNext}
                  className='flex items-center gap-1'
                >
                  시작하기
                  <ChevronRight className='h-4 w-4' />
                </Button>
              ) : currentStepIndex === 9 ? (
                <Button
                  onClick={handleComplete}
                  className='flex items-center gap-1'
                >
                  완료
                  <Check className='h-4 w-4' />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className='flex items-center gap-1'
                >
                  다음
                  <ChevronRight className='h-4 w-4' />
                </Button>
              )}
            </div>
          </div>

          {/* 단계 표시 */}
          <div className='flex items-center justify-center gap-1 mt-3'>
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStepIndex
                    ? "bg-primary"
                    : i < currentStepIndex
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* 닫기 버튼 */}
        <Button
          variant='ghost'
          size='sm'
          onClick={handleSkip}
          className='absolute top-4 right-4 text-muted-foreground hover:text-foreground'
        >
          <X className='h-5 w-5' />
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
