import { useState, useCallback, useRef } from "react";
import {
  AppError,
  ErrorType,
  convertSupabaseError,
  isRetryableError,
  getRetryDelay,
  logError,
  getUserFriendlyMessage,
  getErrorResolution,
  isOnline,
} from "@/lib/error-handling";
import { toast } from "@/components/ui/toast";

interface UseErrorHandlerOptions {
  maxRetries?: number;
  baseDelay?: number;
  showToast?: boolean;
  autoRetry?: boolean;
}

interface ErrorState {
  currentError: AppError | null;
  isRetrying: boolean;
  retryCount: number;
  lastErrorTime: number | null;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    showToast = true,
    autoRetry = true,
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    currentError: null,
    isRetrying: false,
    retryCount: 0,
    lastErrorTime: null,
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 에러 처리 함수
  const handleError = useCallback(
    (error: any, context?: any, retryFunction?: () => Promise<any>) => {
      const appError = convertSupabaseError(error, context);

      // 에러 로깅
      logError(appError);

      // 네트워크 오프라인 상태 확인
      if (!isOnline()) {
        appError.userMessage =
          "인터넷 연결이 끊어졌습니다. 연결을 확인해주세요.";
        appError.type = ErrorType.NETWORK;
      }

      // 재시도 가능한 에러이고 자동 재시도가 활성화된 경우
      if (autoRetry && isRetryableError(appError) && retryFunction) {
        setErrorState((prev) => ({
          ...prev,
          currentError: appError,
          isRetrying: true,
          retryCount: 0,
          lastErrorTime: Date.now(),
        }));

        // 재시도 실행
        executeRetry(retryFunction, appError);
      } else {
        // 재시도 불가능한 에러 또는 자동 재시도 비활성화
        setErrorState((prev) => ({
          ...prev,
          currentError: appError,
          isRetrying: false,
          retryCount: 0,
          lastErrorTime: Date.now(),
        }));

        // 토스트 메시지 표시
        if (showToast) {
          toast.error(
            getUserFriendlyMessage(appError),
            getErrorResolution(appError).join(", ")
          );
        }
      }
    },
    [autoRetry, showToast]
  );

  // 재시도 실행 함수
  const executeRetry = useCallback(
    async (retryFunction: () => Promise<any>, originalError: AppError) => {
      let currentRetryCount = 0;

      const attemptRetry = async () => {
        if (currentRetryCount >= maxRetries) {
          // 최대 재시도 횟수 초과
          setErrorState((prev) => ({
            ...prev,
            currentError: {
              ...originalError,
              retryCount: currentRetryCount,
              userMessage:
                "여러 번 시도했지만 실패했습니다. 잠시 후 다시 시도해주세요.",
            },
            isRetrying: false,
            retryCount: currentRetryCount,
          }));

          if (showToast) {
            toast.error(
              "여러 번 시도했지만 실패했습니다. 잠시 후 다시 시도해주세요.",
              "재시도 실패"
            );
          }
          return;
        }

        try {
          currentRetryCount++;
          setErrorState((prev) => ({
            ...prev,
            retryCount: currentRetryCount,
          }));

          // 재시도 함수 실행
          await retryFunction();

          // 성공 시 에러 상태 초기화
          setErrorState((prev) => ({
            ...prev,
            currentError: null,
            isRetrying: false,
            retryCount: 0,
            lastErrorTime: null,
          }));

          // 성공 토스트 메시지
          if (showToast) {
            toast.success("작업이 성공적으로 완료되었습니다.", "재시도 성공");
          }
        } catch (retryError) {
          // 재시도 중에도 에러 발생
          const retryAppError = convertSupabaseError(retryError, {
            originalError: originalError,
            retryCount: currentRetryCount,
          });

          // 재시도 가능한지 확인
          if (
            isRetryableError(retryAppError) &&
            currentRetryCount < maxRetries
          ) {
            // 지수 백오프로 다음 재시도 예약
            const delay = getRetryDelay(currentRetryCount, baseDelay);

            retryTimeoutRef.current = setTimeout(() => {
              attemptRetry();
            }, delay);

            // 재시도 중임을 사용자에게 알림
            if (showToast) {
              toast.info(
                `${currentRetryCount}번째 재시도 중입니다.`,
                "재시도 중..."
              );
            }
          } else {
            // 재시도 불가능하거나 최대 횟수 초과
            setErrorState((prev) => ({
              ...prev,
              currentError: retryAppError,
              isRetrying: false,
              retryCount: currentRetryCount,
            }));

            if (showToast) {
              toast.error(
                getUserFriendlyMessage(retryAppError),
                getErrorResolution(retryAppError).join(", ")
              );
            }
          }
        }
      };

      // 첫 번째 재시도 시작
      attemptRetry();
    },
    [maxRetries, baseDelay, showToast]
  );

  // 수동 재시도 함수
  const retry = useCallback(
    async (retryFunction: () => Promise<any>) => {
      if (errorState.currentError && !errorState.isRetrying) {
        setErrorState((prev) => ({
          ...prev,
          isRetrying: true,
          retryCount: 0,
        }));

        executeRetry(retryFunction, errorState.currentError);
      }
    },
    [errorState.currentError, errorState.isRetrying, executeRetry]
  );

  // 에러 상태 초기화
  const clearError = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    setErrorState({
      currentError: null,
      isRetrying: false,
      retryCount: 0,
      lastErrorTime: null,
    });
  }, []);

  // 컴포넌트 언마운트 시 정리
  const cleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  return {
    // 상태
    error: errorState.currentError,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    lastErrorTime: errorState.lastErrorTime,

    // 액션
    handleError,
    retry,
    clearError,
    cleanup,

    // 유틸리티
    hasError: !!errorState.currentError,
    canRetry: errorState.currentError?.retryable && !errorState.isRetrying,
  };
}
