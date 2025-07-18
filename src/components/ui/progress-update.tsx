"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Target, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressUpdateProps {
  isVisible: boolean;
  oldProgress: number;
  newProgress: number;
  goalTitle?: string;
  onComplete?: () => void;
}

export function ProgressUpdate({
  isVisible,
  oldProgress,
  newProgress,
  goalTitle,
  onComplete,
}: ProgressUpdateProps) {
  const [currentProgress, setCurrentProgress] = useState(oldProgress);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible && oldProgress !== newProgress) {
      setIsAnimating(true);

      // 진행률 애니메이션
      const duration = 1000; // 1초
      const steps = 60;
      const increment = (newProgress - oldProgress) / steps;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const newValue = oldProgress + increment * currentStep;
        setCurrentProgress(Math.min(newValue, newProgress));

        if (currentStep >= steps) {
          clearInterval(interval);
          setTimeout(() => {
            setIsAnimating(false);
            onComplete?.();
          }, 500);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [isVisible, oldProgress, newProgress, onComplete]);

  if (!isVisible) return null;

  return (
    <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40'>
      <div className='bg-background border border-border rounded-xl shadow-2xl p-6 min-w-80'>
        <div className='text-center space-y-4'>
          {/* 아이콘 */}
          <div className='flex justify-center'>
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500",
                isAnimating
                  ? "bg-green-100 dark:bg-green-900 scale-110"
                  : "bg-muted"
              )}
            >
              {isAnimating ? (
                <TrendingUp className='w-8 h-8 text-green-600 dark:text-green-400 animate-pulse' />
              ) : (
                <CheckCircle className='w-8 h-8 text-muted-foreground' />
              )}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <h3 className='text-lg font-semibold text-foreground'>
              {isAnimating ? "진행률 업데이트 중..." : "업데이트 완료!"}
            </h3>
            {goalTitle && (
              <p className='text-sm text-muted-foreground mt-1'>{goalTitle}</p>
            )}
          </div>

          {/* 진행률 바 */}
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>진행률</span>
              <span className='font-semibold text-primary'>
                {currentProgress.toFixed(0)}%
              </span>
            </div>
            <div className='w-full bg-muted rounded-full h-3 overflow-hidden'>
              <div
                className={cn(
                  "h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out",
                  isAnimating && "animate-pulse"
                )}
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>

          {/* 진행률 변화 표시 */}
          {oldProgress !== newProgress && (
            <div className='flex items-center justify-center gap-2 text-sm'>
              <span className='text-muted-foreground'>
                {oldProgress.toFixed(0)}%
              </span>
              <TrendingUp className='w-4 h-4 text-green-600' />
              <span className='font-semibold text-green-600'>
                {newProgress.toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
