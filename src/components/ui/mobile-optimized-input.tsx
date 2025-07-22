"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Mic, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileOptimizedInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showClearButton?: boolean;
  enableVoiceInput?: boolean;
  enableAutoFocus?: boolean;
  onEnter?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function MobileOptimizedInput({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  showClearButton = true,
  enableVoiceInput = false,
  enableAutoFocus = false,
  onEnter,
  onFocus,
  onBlur,
}: MobileOptimizedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // 음성 인식 초기화
  useEffect(() => {
    if (enableVoiceInput && typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "ko-KR";

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onChange(transcript);
          setIsVoiceActive(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsVoiceActive(false);
        };

        recognitionRef.current.onend = () => {
          setIsVoiceActive(false);
        };
      }
    }
  }, [enableVoiceInput, onChange]);

  // 자동 포커스
  useEffect(() => {
    if (enableAutoFocus && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [enableAutoFocus]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onEnter?.();
    }
  };

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  const handleVoiceInput = () => {
    if (recognitionRef.current && !isVoiceActive) {
      try {
        recognitionRef.current.start();
        setIsVoiceActive(true);
      } catch (error) {
        console.error("Failed to start voice recognition:", error);
      }
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current && isVoiceActive) {
      recognitionRef.current.stop();
      setIsVoiceActive(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className='relative'>
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pr-20", // 오른쪽 버튼들을 위한 공간
            isFocused && "border-primary",
            isVoiceActive && "border-blue-500 bg-blue-50 dark:bg-blue-950"
          )}
          // 모바일에서 숫자 키패드 방지
          inputMode='text'
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
          spellCheck='false'
        />

        {/* 오른쪽 버튼들 */}
        <div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1'>
          {/* 음성 입력 버튼 */}
          {enableVoiceInput && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={isVoiceActive ? stopVoiceInput : handleVoiceInput}
              className={cn(
                "h-8 w-8 p-0",
                isVoiceActive &&
                  "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
              )}
              title={isVoiceActive ? "음성 입력 중지" : "음성 입력"}
            >
              <Mic className='h-4 w-4' />
            </Button>
          )}

          {/* 지우기 버튼 */}
          {showClearButton && value && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={handleClear}
              className='h-8 w-8 p-0 hover:bg-muted'
              title='지우기'
            >
              <X className='h-3 w-3' />
            </Button>
          )}

          {/* 키보드 버튼 (모바일에서 키보드 표시/숨김) */}
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => inputRef.current?.focus()}
            className='h-8 w-8 p-0 hover:bg-muted'
            title='키보드'
          >
            <Keyboard className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* 음성 입력 상태 표시 */}
      {isVoiceActive && (
        <div className='absolute inset-0 bg-blue-500/10 border-2 border-blue-500 rounded-md pointer-events-none flex items-center justify-center'>
          <div className='flex items-center gap-2 text-blue-600 dark:text-blue-400'>
            <Mic className='h-4 w-4 animate-pulse' />
            <span className='text-sm font-medium'>음성 입력 중...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// 특화된 컴포넌트들
export function MobileTaskInput(
  props: Omit<MobileOptimizedInputProps, "enableVoiceInput">
) {
  return (
    <MobileOptimizedInput
      {...props}
      enableVoiceInput={true}
      placeholder='업무 제목을 입력하세요...'
    />
  );
}

export function MobileLocationInput(
  props: Omit<MobileOptimizedInputProps, "enableVoiceInput">
) {
  return (
    <MobileOptimizedInput
      {...props}
      enableVoiceInput={true}
      placeholder='근무 장소를 입력하세요...'
    />
  );
}

export function MobileTimeInput(
  props: Omit<MobileOptimizedInputProps, "enableVoiceInput">
) {
  return (
    <MobileOptimizedInput
      {...props}
      enableVoiceInput={false}
      placeholder='시간을 입력하세요...'
    />
  );
}
