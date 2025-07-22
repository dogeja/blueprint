"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSwipeDismiss } from "@/lib/hooks/use-mobile-gestures";

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
  showHandle?: boolean;
  enableSwipeDismiss?: boolean;
  snapPoints?: number[]; // 0-100 사이의 값들 (퍼센트)
  defaultSnapPoint?: number;
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
  maxHeight = "80vh",
  showHandle = true,
  enableSwipeDismiss = true,
  snapPoints = [25, 50, 75],
  defaultSnapPoint = 50,
}: MobileBottomSheetProps) {
  const [currentSnapPoint, setCurrentSnapPoint] = useState(defaultSnapPoint);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const startHeight = useRef<number>(0);

  // 스와이프로 닫기
  const gestureState = useSwipeDismiss(onClose);

  // 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // 터치 이벤트 처리
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sheetRef.current) return;

    startY.current = e.touches[0].clientY;
    startHeight.current = sheetRef.current.offsetHeight;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sheetRef.current) return;

    const currentY = e.touches[0].clientY;
    const deltaY = startY.current - currentY;
    const newHeight = startHeight.current + deltaY;
    const maxHeightPx = window.innerHeight * (parseInt(maxHeight) / 100);

    if (newHeight > 0 && newHeight < maxHeightPx) {
      sheetRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || !sheetRef.current) return;

    setIsDragging(false);
    const currentHeight = sheetRef.current.offsetHeight;
    const maxHeightPx = window.innerHeight * (parseInt(maxHeight) / 100);
    const heightPercentage = (currentHeight / maxHeightPx) * 100;

    // 가장 가까운 스냅 포인트 찾기
    const closestSnapPoint = snapPoints.reduce((prev, curr) =>
      Math.abs(curr - heightPercentage) < Math.abs(prev - heightPercentage)
        ? curr
        : prev
    );

    setCurrentSnapPoint(closestSnapPoint);

    // 스냅 포인트로 애니메이션
    const targetHeight = (closestSnapPoint / 100) * maxHeightPx;
    sheetRef.current.style.height = `${targetHeight}px`;

    // 스냅 포인트가 0에 가까우면 닫기
    if (closestSnapPoint < 10) {
      onClose();
    }
  };

  const handleSnapToPoint = (snapPoint: number) => {
    setCurrentSnapPoint(snapPoint);
    if (snapPoint < 10) {
      onClose();
    }
  };

  const getSnapPointHeight = (snapPoint: number) => {
    return `${snapPoint}vh`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 z-40'
            onClick={onClose}
          />

          {/* 바텀 시트 */}
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-xl z-50",
              className
            )}
            style={{
              height: getSnapPointHeight(currentSnapPoint),
              maxHeight,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* 핸들 */}
            {showHandle && (
              <div className='flex justify-center pt-2 pb-1'>
                <div className='w-12 h-1 bg-muted rounded-full' />
              </div>
            )}

            {/* 헤더 */}
            {title && (
              <div className='flex items-center justify-between px-4 py-3 border-b border-border'>
                <h3 className='text-lg font-semibold'>{title}</h3>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={onClose}
                  className='h-8 w-8 p-0'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            )}

            {/* 스냅 포인트 버튼들 */}
            <div className='flex items-center justify-center gap-2 px-4 py-2 border-b border-border'>
              {snapPoints.map((snapPoint) => (
                <Button
                  key={snapPoint}
                  variant='ghost'
                  size='sm'
                  onClick={() => handleSnapToPoint(snapPoint)}
                  className={cn(
                    "h-8 px-3 text-xs",
                    currentSnapPoint === snapPoint &&
                      "bg-primary text-primary-foreground"
                  )}
                >
                  {snapPoint}%
                </Button>
              ))}
            </div>

            {/* 콘텐츠 */}
            <div className='flex-1 overflow-y-auto'>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// 특화된 바텀 시트들
export function TaskFormBottomSheet({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title='업무 추가'
      maxHeight='90vh'
      snapPoints={[25, 50, 90]}
      defaultSnapPoint={90}
    >
      {children}
    </MobileBottomSheet>
  );
}

export function SettingsBottomSheet({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title='설정'
      maxHeight='80vh'
      snapPoints={[25, 50, 80]}
      defaultSnapPoint={80}
    >
      {children}
    </MobileBottomSheet>
  );
}

export function QuickActionsBottomSheet({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title='빠른 작업'
      maxHeight='60vh'
      snapPoints={[25, 50, 60]}
      defaultSnapPoint={50}
    >
      {children}
    </MobileBottomSheet>
  );
}
