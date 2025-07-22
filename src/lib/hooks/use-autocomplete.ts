import { useState, useEffect, useCallback } from "react";
import { debounce } from "@/lib/validation";
import {
  suggestTasks,
  suggestLocations,
  suggestTimes,
  addTaskSuggestion,
  addLocationSuggestion,
  addTimeSuggestion,
  AutocompleteSuggestion,
  AutocompleteItem,
} from "@/lib/autocomplete";

interface UseAutocompleteOptions {
  category: "task" | "location" | "time";
  debounceMs?: number;
  maxSuggestions?: number;
  autoAddOnSelect?: boolean;
}

export function useAutocomplete(options: UseAutocompleteOptions) {
  const {
    category,
    debounceMs = 300,
    maxSuggestions = 8,
    autoAddOnSelect = true,
  } = options;

  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");

  // 검색 함수 (카테고리별)
  const searchSuggestions = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        // 빈 쿼리일 때는 자주 사용하는 항목들 표시
        let frequentSuggestions: AutocompleteSuggestion[] = [];

        switch (category) {
          case "task":
            frequentSuggestions = suggestTasks("", maxSuggestions);
            break;
          case "location":
            frequentSuggestions = suggestLocations("", maxSuggestions);
            break;
          case "time":
            frequentSuggestions = suggestTimes("", maxSuggestions);
            break;
        }

        setSuggestions(frequentSuggestions);
        return;
      }

      setIsLoading(true);

      try {
        let results: AutocompleteSuggestion[] = [];

        switch (category) {
          case "task":
            results = suggestTasks(searchQuery, maxSuggestions);
            break;
          case "location":
            results = suggestLocations(searchQuery, maxSuggestions);
            break;
          case "time":
            results = suggestTimes(searchQuery, maxSuggestions);
            break;
        }

        setSuggestions(results);
      } catch (error) {
        console.error("Autocomplete search error:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [category, maxSuggestions]
  );

  // 디바운스된 검색
  const debouncedSearch = useCallback(debounce(searchSuggestions, debounceMs), [
    searchSuggestions,
    debounceMs,
  ]);

  // 쿼리 변경 처리
  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      debouncedSearch(newQuery);
    },
    [debouncedSearch]
  );

  // 제안 선택 처리
  const handleSelect = useCallback(
    (item: AutocompleteItem) => {
      if (autoAddOnSelect) {
        // 선택된 항목을 자동완성 데이터에 추가/업데이트
        switch (category) {
          case "task":
            addTaskSuggestion(item.text, item.tags);
            break;
          case "location":
            addLocationSuggestion(item.text);
            break;
          case "time":
            addTimeSuggestion(item.text);
            break;
        }
      }

      // 쿼리 업데이트
      setQuery(item.text);
      setSuggestions([]);
    },
    [category, autoAddOnSelect]
  );

  // 수동으로 제안 추가
  const addSuggestion = useCallback(
    (text: string, tags?: string[]) => {
      switch (category) {
        case "task":
          addTaskSuggestion(text, tags);
          break;
        case "location":
          addLocationSuggestion(text);
          break;
        case "time":
          addTimeSuggestion(text);
          break;
      }

      // 현재 쿼리로 다시 검색하여 업데이트된 제안 표시
      searchSuggestions(query);
    },
    [category, query, searchSuggestions]
  );

  // 제안 초기화
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setQuery("");
  }, []);

  // 컴포넌트 마운트 시 초기 제안 로드
  useEffect(() => {
    searchSuggestions("");
  }, [searchSuggestions]);

  return {
    // 상태
    suggestions,
    isLoading,
    query,

    // 액션
    handleQueryChange,
    handleSelect,
    addSuggestion,
    clearSuggestions,
    searchSuggestions: debouncedSearch,

    // 유틸리티
    hasSuggestions: suggestions.length > 0,
    isEmpty: suggestions.length === 0,
  };
}

// 특화된 훅들
export function useTaskAutocomplete(
  options?: Omit<UseAutocompleteOptions, "category">
) {
  return useAutocomplete({ ...options, category: "task" });
}

export function useLocationAutocomplete(
  options?: Omit<UseAutocompleteOptions, "category">
) {
  return useAutocomplete({ ...options, category: "location" });
}

export function useTimeAutocomplete(
  options?: Omit<UseAutocompleteOptions, "category">
) {
  return useAutocomplete({ ...options, category: "time" });
}
