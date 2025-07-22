"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Wifi,
  Shield,
  Database,
  RefreshCw,
  X,
  Info,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AppError, ErrorType, getErrorResolution } from "@/lib/error-handling";

interface ErrorDisplayProps {
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

const errorIcons = {
  [ErrorType.NETWORK]: Wifi,
  [ErrorType.AUTHENTICATION]: Shield,
  [ErrorType.VALIDATION]: AlertTriangle,
  [ErrorType.DATABASE]: Database,
  [ErrorType.UNKNOWN]: AlertTriangle,
};

const errorColors = {
  [ErrorType.NETWORK]: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-800 dark:text-blue-200",
    icon: "text-blue-600 dark:text-blue-400",
  },
  [ErrorType.AUTHENTICATION]: {
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-800 dark:text-red-200",
    icon: "text-red-600 dark:text-red-400",
  },
  [ErrorType.VALIDATION]: {
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-800 dark:text-yellow-200",
    icon: "text-yellow-600 dark:text-yellow-400",
  },
  [ErrorType.DATABASE]: {
    bg: "bg-orange-50 dark:bg-orange-950/20",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-800 dark:text-orange-200",
    icon: "text-orange-600 dark:text-orange-400",
  },
  [ErrorType.UNKNOWN]: {
    bg: "bg-gray-50 dark:bg-gray-950/20",
    border: "border-gray-200 dark:border-gray-800",
    text: "text-gray-800 dark:text-gray-200",
    icon: "text-gray-600 dark:text-gray-400",
  },
};

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  className,
}: ErrorDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const Icon = errorIcons[error.type];
  const colors = errorColors[error.type];
  const resolutions = getErrorResolution(error);

  return (
    <Card className={cn("border-l-4", colors.bg, colors.border, className)}>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div className={cn("p-2 rounded-lg", colors.bg)}>
              <Icon className={cn("w-5 h-5", colors.icon)} />
            </div>
            <div className='space-y-1'>
              <CardTitle className={cn("text-lg font-semibold", colors.text)}>
                {error.userMessage}
              </CardTitle>
              <div className='flex items-center gap-2'>
                <Badge
                  variant='outline'
                  className={cn("text-xs", colors.border, colors.text)}
                >
                  {error.type}
                </Badge>
                {error.retryCount !== undefined && error.retryCount > 0 && (
                  <Badge variant='secondary' className='text-xs'>
                    {error.retryCount}번째 시도
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {onDismiss && (
              <Button
                variant='ghost'
                size='sm'
                onClick={onDismiss}
                className='h-8 w-8 p-0'
              >
                <X className='w-4 h-4' />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* 해결 방법 */}
        {resolutions.length > 0 && (
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Info className='w-4 h-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>
                해결 방법:
              </span>
            </div>
            <ul className='space-y-1 ml-6'>
              {resolutions.map((resolution, index) => (
                <li
                  key={index}
                  className='text-sm text-muted-foreground flex items-start gap-2'
                >
                  <span className='w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0' />
                  {resolution}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 상세 정보 (확장 가능) */}
        {error.originalError && (
          <div className='space-y-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsExpanded(!isExpanded)}
              className='h-auto p-0 text-xs text-muted-foreground hover:text-foreground'
            >
              {isExpanded ? "상세 정보 숨기기" : "상세 정보 보기"}
            </Button>

            {isExpanded && (
              <div className='bg-muted/50 rounded-lg p-3 space-y-2'>
                <div className='text-xs font-medium text-muted-foreground'>
                  기술적 상세:
                </div>
                <pre className='text-xs text-muted-foreground whitespace-pre-wrap break-words'>
                  {JSON.stringify(error.originalError, null, 2)}
                </pre>
                {error.context && (
                  <>
                    <div className='text-xs font-medium text-muted-foreground'>
                      컨텍스트:
                    </div>
                    <pre className='text-xs text-muted-foreground whitespace-pre-wrap break-words'>
                      {JSON.stringify(error.context, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className='flex items-center gap-2 pt-2'>
          {error.retryable && onRetry && (
            <Button
              onClick={onRetry}
              size='sm'
              className='flex items-center gap-2'
              disabled={
                error.retryCount !== undefined &&
                error.retryCount >= (error.maxRetries || 3)
              }
            >
              <RefreshCw className='w-4 h-4' />
              {error.retryCount && error.retryCount > 0
                ? `다시 시도 (${error.retryCount}/${error.maxRetries || 3})`
                : "다시 시도"}
            </Button>
          )}

          {onDismiss && (
            <Button variant='outline' size='sm' onClick={onDismiss}>
              닫기
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 간단한 인라인 에러 표시 컴포넌트
interface InlineErrorProps {
  error: AppError;
  onRetry?: () => void;
  className?: string;
}

export function InlineError({ error, onRetry, className }: InlineErrorProps) {
  const Icon = errorIcons[error.type];
  const colors = errorColors[error.type];

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg border",
        colors.bg,
        colors.border,
        className
      )}
    >
      <Icon className={cn("w-4 h-4 flex-shrink-0", colors.icon)} />
      <span className={cn("text-sm flex-1", colors.text)}>
        {error.userMessage}
      </span>
      {error.retryable && onRetry && (
        <Button
          variant='ghost'
          size='sm'
          onClick={onRetry}
          className='h-6 px-2 text-xs'
        >
          재시도
        </Button>
      )}
    </div>
  );
}

// 성공 메시지 컴포넌트
interface SuccessMessageProps {
  title: string;
  message?: string;
  onDismiss?: () => void;
  className?: string;
}

export function SuccessMessage({
  title,
  message,
  onDismiss,
  className,
}: SuccessMessageProps) {
  return (
    <Card
      className={cn(
        "border-l-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20",
        className
      )}
    >
      <CardContent className='p-4'>
        <div className='flex items-start gap-3'>
          <div className='p-2 rounded-lg bg-green-100 dark:bg-green-900/20'>
            <CheckCircle className='w-5 h-5 text-green-600 dark:text-green-400' />
          </div>
          <div className='flex-1 space-y-1'>
            <h4 className='font-semibold text-green-800 dark:text-green-200'>
              {title}
            </h4>
            {message && (
              <p className='text-sm text-green-700 dark:text-green-300'>
                {message}
              </p>
            )}
          </div>
          {onDismiss && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onDismiss}
              className='h-8 w-8 p-0 text-green-600 hover:text-green-800'
            >
              <X className='w-4 h-4' />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
