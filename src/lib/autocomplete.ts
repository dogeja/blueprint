// 자동완성 데이터 타입
export interface AutocompleteItem {
  id: string;
  text: string;
  category: string;
  frequency: number; // 사용 빈도
  lastUsed: Date;
  tags?: string[];
}

export interface AutocompleteSuggestion {
  item: AutocompleteItem;
  score: number; // 매칭 점수
  matchType: "exact" | "partial" | "fuzzy" | "tag";
}

// 자동완성 데이터 저장소
class AutocompleteStore {
  private static instance: AutocompleteStore;
  private data: Map<string, AutocompleteItem[]> = new Map();
  private readonly STORAGE_KEY = "blueprint_autocomplete_data";

  private constructor() {
    this.loadFromStorage();
    this.initializeDefaultData();
  }

  static getInstance(): AutocompleteStore {
    if (!AutocompleteStore.instance) {
      AutocompleteStore.instance = new AutocompleteStore();
    }
    return AutocompleteStore.instance;
  }

  // 기본 데이터 초기화
  private initializeDefaultData() {
    // 목표 제목 기본 템플릿
    const DEFAULT_TASK_TITLES = [
      "이메일 확인 및 응답",
      "회의 준비",
      "문서 작성",
      "코드 리뷰",
      "테스트 작성",
      "버그 수정",
      "기능 개발",
      "문서 정리",
      "데이터 분석",
      "보고서 작성",
      "프레젠테이션 준비",
      "팀 미팅",
      "고객 미팅",
      "설계 검토",
      "성능 최적화",
    ];

    // 근무 장소 기본값
    const defaultLocations = [
      { text: "사무실", category: "location" },
      { text: "재택근무", category: "location" },
      { text: "카페", category: "location" },
      { text: "고객사", category: "location" },
      { text: "출장", category: "location" },
    ];

    // 시간 제안 기본값
    const defaultTimes = [
      { text: "09:00", category: "time" },
      { text: "09:30", category: "time" },
      { text: "10:00", category: "time" },
      { text: "13:00", category: "time" },
      { text: "14:00", category: "time" },
      { text: "17:00", category: "time" },
      { text: "18:00", category: "time" },
    ];

    // 기본 데이터가 없으면 추가
    if (!this.data.has("task") || this.data.get("task")!.length === 0) {
      this.addDefaultItems(
        DEFAULT_TASK_TITLES.map((text) => ({
          text,
          category: "task",
          frequency: 1,
          lastUsed: new Date(),
          tags: [],
        }))
      );
    }
    if (!this.data.has("location") || this.data.get("location")!.length === 0) {
      this.addDefaultItems(defaultLocations);
    }
    if (!this.data.has("time") || this.data.get("time")!.length === 0) {
      this.addDefaultItems(defaultTimes);
    }
  }

  private addDefaultItems(
    items: Array<{ text: string; category: string; tags?: string[] }>
  ) {
    items.forEach((item) => {
      this.addItem({
        id: `${item.category}_${Date.now()}_${Math.random()}`,
        text: item.text,
        category: item.category,
        frequency: 1,
        lastUsed: new Date(),
        tags: item.tags || [],
      });
    });
  }

  // 아이템 추가/업데이트
  addItem(item: AutocompleteItem): void {
    if (!this.data.has(item.category)) {
      this.data.set(item.category, []);
    }

    const categoryData = this.data.get(item.category)!;
    const existingIndex = categoryData.findIndex(
      (existing) => existing.text === item.text
    );

    if (existingIndex >= 0) {
      // 기존 아이템 업데이트
      const existing = categoryData[existingIndex];
      existing.frequency += 1;
      existing.lastUsed = new Date();
      if (item.tags) {
        existing.tags = Array.from(
          new Set([...(existing.tags || []), ...item.tags])
        );
      }
    } else {
      // 새 아이템 추가
      categoryData.push(item);
    }

    // 빈도순으로 정렬
    categoryData.sort((a, b) => b.frequency - a.frequency);
    this.saveToStorage();
  }

  // 아이템 검색
  search(
    query: string,
    category: string,
    limit: number = 10
  ): AutocompleteSuggestion[] {
    if (!query.trim()) {
      return this.getMostFrequent(category, limit);
    }

    const categoryData = this.data.get(category) || [];
    const suggestions: AutocompleteSuggestion[] = [];

    categoryData.forEach((item) => {
      const score = this.calculateMatchScore(query, item);
      if (score > 0) {
        suggestions.push({
          item,
          score,
          matchType: this.getMatchType(query, item),
        });
      }
    });

    // 점수순으로 정렬하고 제한
    return suggestions.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  // 매칭 점수 계산
  private calculateMatchScore(query: string, item: AutocompleteItem): number {
    const queryLower = query.toLowerCase();
    const textLower = item.text.toLowerCase();

    // 정확한 매칭
    if (textLower === queryLower) {
      return 100 + item.frequency;
    }

    // 시작 부분 매칭
    if (textLower.startsWith(queryLower)) {
      return 80 + item.frequency;
    }

    // 포함 매칭
    if (textLower.includes(queryLower)) {
      return 60 + item.frequency;
    }

    // 태그 매칭
    if (item.tags) {
      const tagMatch = item.tags.some((tag) =>
        tag.toLowerCase().includes(queryLower)
      );
      if (tagMatch) {
        return 40 + item.frequency;
      }
    }

    // 퍼지 매칭 (간단한 레벤슈타인 거리)
    const fuzzyScore = this.calculateFuzzyScore(queryLower, textLower);
    if (fuzzyScore > 0.7) {
      return Math.floor(fuzzyScore * 30) + item.frequency;
    }

    return 0;
  }

  // 퍼지 매칭 점수 계산 (간단한 버전)
  private calculateFuzzyScore(query: string, text: string): number {
    if (query.length === 0) return 0;
    if (text.length === 0) return 0;

    const queryChars = query.split("");
    let matchCount = 0;
    let lastIndex = -1;

    for (const char of queryChars) {
      const index = text.indexOf(char, lastIndex + 1);
      if (index !== -1) {
        matchCount++;
        lastIndex = index;
      }
    }

    return matchCount / query.length;
  }

  // 매칭 타입 결정
  private getMatchType(
    query: string,
    item: AutocompleteItem
  ): "exact" | "partial" | "fuzzy" | "tag" {
    const queryLower = query.toLowerCase();
    const textLower = item.text.toLowerCase();

    if (textLower === queryLower) return "exact";
    if (textLower.startsWith(queryLower)) return "partial";
    if (item.tags?.some((tag) => tag.toLowerCase().includes(queryLower)))
      return "tag";
    return "fuzzy";
  }

  // 가장 자주 사용되는 아이템들
  getMostFrequent(
    category: string,
    limit: number = 10
  ): AutocompleteSuggestion[] {
    const categoryData = this.data.get(category) || [];
    return categoryData.slice(0, limit).map((item) => ({
      item,
      score: item.frequency,
      matchType: "exact" as const,
    }));
  }

  // 최근 사용된 아이템들
  getRecentlyUsed(category: string, limit: number = 10): AutocompleteItem[] {
    const categoryData = this.data.get(category) || [];
    return categoryData
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
      .slice(0, limit);
  }

  // 아이템 삭제
  removeItem(id: string, category: string): void {
    const categoryData = this.data.get(category);
    if (categoryData) {
      const index = categoryData.findIndex((item) => item.id === id);
      if (index >= 0) {
        categoryData.splice(index, 1);
        this.saveToStorage();
      }
    }
  }

  // 카테고리별 아이템 수
  getItemCount(category: string): number {
    return this.data.get(category)?.length || 0;
  }

  // 모든 카테고리 가져오기
  getCategories(): string[] {
    return Array.from(this.data.keys());
  }

  // 로컬 스토리지에서 로드
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.data = new Map();

        Object.entries(parsed).forEach(([category, items]) => {
          this.data.set(
            category,
            (items as any[]).map((item) => ({
              ...item,
              lastUsed: new Date(item.lastUsed),
            }))
          );
        });
      }
    } catch (error) {
      console.warn("Failed to load autocomplete data:", error);
    }
  }

  // 로컬 스토리지에 저장
  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.data);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to save autocomplete data:", error);
    }
  }

  // 데이터 초기화
  clear(): void {
    this.data.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// 싱글톤 인스턴스
export const autocompleteStore = AutocompleteStore.getInstance();

// 편의 함수들
export function suggestTasks(
  query: string,
  limit: number = 10
): AutocompleteSuggestion[] {
  return autocompleteStore.search(query, "task", limit);
}

export function suggestLocations(
  query: string,
  limit: number = 10
): AutocompleteSuggestion[] {
  return autocompleteStore.search(query, "location", limit);
}

export function suggestTimes(
  query: string,
  limit: number = 10
): AutocompleteSuggestion[] {
  return autocompleteStore.search(query, "time", limit);
}

export function addTaskSuggestion(text: string, tags?: string[]): void {
  autocompleteStore.addItem({
    id: `task_${Date.now()}_${Math.random()}`,
    text,
    category: "task",
    frequency: 1,
    lastUsed: new Date(),
    tags: tags || [],
  });
}

export function addLocationSuggestion(text: string): void {
  autocompleteStore.addItem({
    id: `location_${Date.now()}_${Math.random()}`,
    text,
    category: "location",
    frequency: 1,
    lastUsed: new Date(),
  });
}

export function addTimeSuggestion(text: string): void {
  autocompleteStore.addItem({
    id: `time_${Date.now()}_${Math.random()}`,
    text,
    category: "time",
    frequency: 1,
    lastUsed: new Date(),
  });
}
