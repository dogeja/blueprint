"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, X, Clock, MapPin, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AutocompleteSuggestion, AutocompleteItem } from "@/lib/autocomplete";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: AutocompleteItem) => void;
  suggestions: AutocompleteSuggestion[];
  placeholder?: string;
  category: "task" | "location" | "time";
  className?: string;
  disabled?: boolean;
  showClearButton?: boolean;
  maxSuggestions?: number;
}

const categoryIcons = {
  task: Briefcase,
  location: MapPin,
  time: Clock,
};

const matchTypeColors = {
  exact: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  partial: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  fuzzy:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  tag: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

export function AutocompleteInput({
  value,
  onChange,
  onSelect,
  suggestions,
  placeholder,
  category,
  className,
  disabled = false,
  showClearButton = true,
  maxSuggestions = 8,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const CategoryIcon = categoryIcons[category];

  // 입력값이 외부에서 변경되면 동기화
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 드롭다운 표시/숨김 관리
  useEffect(() => {
    const shouldShow = suggestions.length > 0 && inputValue.trim() !== "";
    setIsOpen(shouldShow);
    setHighlightedIndex(-1);
  }, [suggestions, inputValue]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 키보드 네비게이션
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setHighlightedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case "Enter":
          event.preventDefault();
          if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
            handleSelect(suggestions[highlightedIndex].item);
          }
          break;
        case "Escape":
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, suggestions, highlightedIndex]
  );

  // 입력값 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  // 제안 선택 처리
  const handleSelect = (item: AutocompleteItem) => {
    setInputValue(item.text);
    onChange(item.text);
    onSelect?.(item);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // 입력값 초기화
  const handleClear = () => {
    setInputValue("");
    onChange("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // 드롭다운 스크롤 관리
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex]);

  const displayedSuggestions = suggestions.slice(0, maxSuggestions);

  return (
    <div className={cn("relative", className)}>
      <div className='relative'>
        <Input
          ref={inputRef}
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0 && inputValue.trim() !== "") {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            if (suggestions.length === 0 || inputValue.trim() === "") {
              setIsOpen(false);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder='목표 제목을 입력하세요...'
          className='flex-1 border-0 bg-transparent focus:ring-0 focus:outline-none'
          disabled={disabled}
        />

        <div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1'>
          {showClearButton && inputValue && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={handleClear}
              className='h-6 w-6 p-0 hover:bg-muted'
            >
              <X className='h-3 w-3' />
            </Button>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </div>

      {/* 드롭다운 */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className='absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto'
        >
          {displayedSuggestions.length === 0 ? (
            <div className='px-3 py-2 text-sm text-muted-foreground'>
              제안사항이 없습니다
            </div>
          ) : (
            displayedSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.item.id}
                type='button'
                onClick={() => handleSelect(suggestion.item)}
                className={cn(
                  "w-full px-3 py-2 text-left hover:bg-muted focus:bg-muted focus:outline-none transition-colors",
                  highlightedIndex === index && "bg-muted"
                )}
              >
                <div className='flex items-center gap-2'>
                  <CategoryIcon className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                  <span className='flex-1 truncate'>
                    {suggestion.item.text}
                  </span>
                  <div className='flex items-center gap-1'>
                    <Badge
                      variant='outline'
                      className={cn(
                        "text-xs",
                        matchTypeColors[suggestion.matchType]
                      )}
                    >
                      {suggestion.matchType === "exact" && "정확"}
                      {suggestion.matchType === "partial" && "부분"}
                      {suggestion.matchType === "fuzzy" && "유사"}
                      {suggestion.matchType === "tag" && "태그"}
                    </Badge>
                    {suggestion.item.frequency > 1 && (
                      <Badge variant='secondary' className='text-xs'>
                        {suggestion.item.frequency}회
                      </Badge>
                    )}
                  </div>
                </div>
                {suggestion.item.tags && suggestion.item.tags.length > 0 && (
                  <div className='flex items-center gap-1 mt-1'>
                    {suggestion.item.tags.slice(0, 3).map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant='outline'
                        className='text-xs text-muted-foreground'
                      >
                        {tag}
                      </Badge>
                    ))}
                    {suggestion.item.tags.length > 3 && (
                      <span className='text-xs text-muted-foreground'>
                        +{suggestion.item.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// 특화된 컴포넌트들
export function TaskAutocompleteInput(
  props: Omit<AutocompleteInputProps, "category">
) {
  return (
    <AutocompleteInput
      {...props}
      category='task'
      placeholder='업무 제목을 입력하세요...'
    />
  );
}

export function LocationAutocompleteInput(
  props: Omit<AutocompleteInputProps, "category">
) {
  return (
    <AutocompleteInput
      {...props}
      category='location'
      placeholder='근무 장소를 입력하세요...'
    />
  );
}

export function TimeAutocompleteInput(
  props: Omit<AutocompleteInputProps, "category">
) {
  return (
    <AutocompleteInput
      {...props}
      category='time'
      placeholder='시간을 입력하세요...'
    />
  );
}
