import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface GestureState {
  isSwiping: boolean;
  direction: "left" | "right" | "up" | "down" | null;
  distance: number;
  velocity: number;
}

interface UseMobileGesturesOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // 최소 스와이프 거리
  velocityThreshold?: number; // 최소 스와이프 속도
  enabled?: boolean;
}

export function useMobileGestures(options: UseMobileGesturesOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    velocityThreshold = 0.3,
    enabled = true,
  } = options;

  const [gestureState, setGestureState] = useState<GestureState>({
    isSwiping: false,
    direction: null,
    distance: 0,
    velocity: 0,
  });

  const startPoint = useRef<{ x: number; y: number; time: number } | null>(
    null
  );
  const currentPoint = useRef<{ x: number; y: number; time: number } | null>(
    null
  );

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      startPoint.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      currentPoint.current = { ...startPoint.current };

      setGestureState((prev) => ({
        ...prev,
        isSwiping: true,
        direction: null,
        distance: 0,
        velocity: 0,
      }));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startPoint.current || e.touches.length !== 1) return;

      const touch = e.touches[0];
      currentPoint.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      const deltaX = currentPoint.current.x - startPoint.current.x;
      const deltaY = currentPoint.current.y - startPoint.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const timeDelta = currentPoint.current.time - startPoint.current.time;
      const velocity = distance / timeDelta;

      let direction: "left" | "right" | "up" | "down" | null = null;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? "right" : "left";
      } else {
        direction = deltaY > 0 ? "down" : "up";
      }

      setGestureState({
        isSwiping: true,
        direction,
        distance,
        velocity,
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startPoint.current || !currentPoint.current) return;

      const deltaX = currentPoint.current.x - startPoint.current.x;
      const deltaY = currentPoint.current.y - startPoint.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const timeDelta = currentPoint.current.time - startPoint.current.time;
      const velocity = distance / timeDelta;

      // 스와이프 조건 확인
      if (distance >= threshold && velocity >= velocityThreshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }

      // 상태 초기화
      startPoint.current = null;
      currentPoint.current = null;
      setGestureState({
        isSwiping: false,
        direction: null,
        distance: 0,
        velocity: 0,
      });
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    enabled,
    threshold,
    velocityThreshold,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  ]);

  return gestureState;
}

// 특화된 훅들
export function useSwipeNavigation() {
  const router = useRouter();

  return useMobileGestures({
    onSwipeLeft: () => {
      // 왼쪽 스와이프: 이전 페이지
      router.back();
    },
    onSwipeRight: () => {
      // 오른쪽 스와이프: 다음 페이지 (예: 대시보드)
      router.push("/dashboard");
    },
  });
}

export function useSwipeRefresh(onRefresh: () => void) {
  return useMobileGestures({
    onSwipeDown: () => {
      // 아래로 스와이프: 새로고침
      onRefresh();
    },
    threshold: 100, // 새로고침은 더 긴 거리 필요
  });
}

export function useSwipeDismiss(onDismiss: () => void) {
  return useMobileGestures({
    onSwipeUp: () => {
      // 위로 스와이프: 닫기
      onDismiss();
    },
    threshold: 80,
  });
}
