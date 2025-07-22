// 템플릿 타입 정의
export interface TaskTemplate {
  id: string;
  name: string;
  category: "workflow" | "meeting" | "development" | "planning" | "custom";
  description?: string;
  tasks: TaskTemplateItem[];
  tags: string[];
  isDefault: boolean;
  usageCount: number;
  lastUsed?: Date;
  createdBy?: string;
}

export interface TaskTemplateItem {
  title: string;
  description?: string;
  estimatedTime?: number; // 분 단위
  priority: 1 | 2 | 3 | 4 | 5;
  category?: string;
  tags?: string[];
}

// 기본 템플릿 정의
const DEFAULT_TEMPLATES: Omit<
  TaskTemplate,
  "id" | "usageCount" | "lastUsed"
>[] = [
  {
    name: "데일리 스탠드업",
    category: "meeting",
    description: "팀과의 일일 동기화 미팅",
    tasks: [
      {
        title: "어제 완료한 목표 정리",
        description: "어제 완료한 목표들을 정리하고 공유",
        estimatedTime: 15,
        priority: 1,
        category: "회의",
        tags: ["스크럼", "정리"],
      },
      {
        title: "오늘 할 목표 계획",
        description: "오늘 진행할 목표들을 계획하고 우선순위 설정",
        estimatedTime: 20,
        priority: 1,
        category: "회의",
        tags: ["계획", "우선순위"],
      },
      {
        title: "블로커 이슈 공유",
        description: "진행 중인 목표의 블로커 이슈들을 공유하고 해결 방안 논의",
        estimatedTime: 10,
        priority: 2,
        category: "회의",
        tags: ["이슈", "해결"],
      },
    ],
    tags: ["미팅", "스크럼", "일일"],
    isDefault: true,
  },
  {
    name: "기능 개발 워크플로우",
    category: "development",
    description: "새로운 기능 개발을 위한 표준 워크플로우",
    tasks: [
      {
        title: "요구사항 분석",
        description: "기능 요구사항을 분석하고 명세서 작성",
        estimatedTime: 60,
        priority: 1,
        category: "개발",
        tags: ["분석", "명세"],
      },
      {
        title: "기술 설계",
        description: "기능 구현을 위한 기술적 설계",
        estimatedTime: 90,
        priority: 1,
        category: "개발",
        tags: ["설계", "기술"],
      },
      {
        title: "코드 구현",
        description: "설계에 따른 실제 코드 구현",
        estimatedTime: 240,
        priority: 2,
        category: "개발",
        tags: ["구현", "코딩"],
      },
      {
        title: "단위 테스트",
        description: "구현된 기능에 대한 단위 테스트 작성 및 실행",
        estimatedTime: 60,
        priority: 2,
        category: "개발",
        tags: ["테스트", "단위"],
      },
      {
        title: "코드 리뷰",
        description: "구현된 코드에 대한 리뷰 진행",
        estimatedTime: 30,
        priority: 3,
        category: "개발",
        tags: ["리뷰", "코드"],
      },
      {
        title: "통합 테스트",
        description: "전체 시스템과의 통합 테스트",
        estimatedTime: 45,
        priority: 3,
        category: "개발",
        tags: ["테스트", "통합"],
      },
    ],
    tags: ["개발", "기능", "워크플로우"],
    isDefault: true,
  },
  {
    name: "프로젝트 기획",
    category: "planning",
    description: "새로운 프로젝트 기획을 위한 템플릿",
    tasks: [
      {
        title: "프로젝트 목표 정의",
        description: "프로젝트의 목표와 성공 기준을 명확히 정의",
        estimatedTime: 120,
        priority: 1,
        category: "기획",
        tags: ["목표", "정의"],
      },
      {
        title: "스테이크홀더 인터뷰",
        description: "관련 스테이크홀더들과 인터뷰를 통한 요구사항 수집",
        estimatedTime: 180,
        priority: 1,
        category: "기획",
        tags: ["인터뷰", "요구사항"],
      },
      {
        title: "시장 조사",
        description: "시장 상황과 경쟁사 분석",
        estimatedTime: 240,
        priority: 2,
        category: "기획",
        tags: ["조사", "분석"],
      },
      {
        title: "기술 검토",
        description: "프로젝트에 필요한 기술 스택 검토",
        estimatedTime: 90,
        priority: 2,
        category: "기획",
        tags: ["기술", "검토"],
      },
      {
        title: "프로젝트 계획서 작성",
        description: "프로젝트 계획서 및 일정 수립",
        estimatedTime: 120,
        priority: 3,
        category: "기획",
        tags: ["계획서", "일정"],
      },
    ],
    tags: ["기획", "프로젝트", "계획"],
    isDefault: true,
  },
  {
    name: "버그 수정 워크플로우",
    category: "workflow",
    description: "버그 수정을 위한 표준 워크플로우",
    tasks: [
      {
        title: "버그 재현 및 분석",
        description: "버그를 재현하고 원인을 분석",
        estimatedTime: 30,
        priority: 1,
        category: "개발",
        tags: ["버그", "분석"],
      },
      {
        title: "수정 계획 수립",
        description: "버그 수정을 위한 계획 수립",
        estimatedTime: 15,
        priority: 1,
        category: "개발",
        tags: ["계획", "수정"],
      },
      {
        title: "코드 수정",
        description: "버그 수정을 위한 코드 변경",
        estimatedTime: 60,
        priority: 2,
        category: "개발",
        tags: ["수정", "코드"],
      },
      {
        title: "수정 사항 테스트",
        description: "수정된 코드에 대한 테스트 수행",
        estimatedTime: 30,
        priority: 2,
        category: "개발",
        tags: ["테스트", "검증"],
      },
      {
        title: "문서 업데이트",
        description: "수정 사항에 대한 문서 업데이트",
        estimatedTime: 15,
        priority: 3,
        category: "문서",
        tags: ["문서", "업데이트"],
      },
    ],
    tags: ["버그", "수정", "워크플로우"],
    isDefault: true,
  },
  {
    name: "클라이언트 미팅",
    category: "meeting",
    description: "클라이언트와의 미팅을 위한 템플릿",
    tasks: [
      {
        title: "미팅 준비",
        description: "미팅 자료 준비 및 참석자 확인",
        estimatedTime: 30,
        priority: 1,
        category: "회의",
        tags: ["준비", "자료"],
      },
      {
        title: "클라이언트 요구사항 청취",
        description: "클라이언트의 요구사항을 청취하고 정리",
        estimatedTime: 60,
        priority: 1,
        category: "회의",
        tags: ["요구사항", "청취"],
      },
      {
        title: "현재 진행 상황 공유",
        description: "현재 프로젝트 진행 상황을 공유",
        estimatedTime: 30,
        priority: 2,
        category: "회의",
        tags: ["진행상황", "공유"],
      },
      {
        title: "이슈 및 해결 방안 논의",
        description: "발생한 이슈들과 해결 방안을 논의",
        estimatedTime: 45,
        priority: 2,
        category: "회의",
        tags: ["이슈", "해결"],
      },
      {
        title: "다음 단계 계획 수립",
        description: "다음 단계에 대한 계획을 수립하고 합의",
        estimatedTime: 30,
        priority: 3,
        category: "회의",
        tags: ["계획", "다음단계"],
      },
    ],
    tags: ["클라이언트", "미팅", "회의"],
    isDefault: true,
  },
];

// 템플릿 저장소
class TemplateStore {
  private static instance: TemplateStore;
  private templates: Map<string, TaskTemplate> = new Map();
  private readonly STORAGE_KEY = "blueprint_task_templates";

  private constructor() {
    this.loadFromStorage();
    this.initializeDefaultTemplates();
  }

  static getInstance(): TemplateStore {
    if (!TemplateStore.instance) {
      TemplateStore.instance = new TemplateStore();
    }
    return TemplateStore.instance;
  }

  // 기본 템플릿 초기화
  private initializeDefaultTemplates(): void {
    DEFAULT_TEMPLATES.forEach((template) => {
      const id = `default_${template.name.replace(/\s+/g, "_").toLowerCase()}`;
      if (!this.templates.has(id)) {
        this.templates.set(id, {
          ...template,
          id,
          usageCount: 0,
        });
      }
    });
    this.saveToStorage();
  }

  // 템플릿 추가
  addTemplate(template: Omit<TaskTemplate, "id" | "usageCount">): string {
    const id = `custom_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newTemplate: TaskTemplate = {
      ...template,
      id,
      usageCount: 0,
      isDefault: false,
    };

    this.templates.set(id, newTemplate);
    this.saveToStorage();
    return id;
  }

  // 템플릿 업데이트
  updateTemplate(id: string, updates: Partial<TaskTemplate>): boolean {
    const template = this.templates.get(id);
    if (!template) return false;

    this.templates.set(id, { ...template, ...updates });
    this.saveToStorage();
    return true;
  }

  // 템플릿 삭제
  deleteTemplate(id: string): boolean {
    const template = this.templates.get(id);
    if (!template || template.isDefault) return false;

    this.templates.delete(id);
    this.saveToStorage();
    return true;
  }

  // 템플릿 조회
  getTemplate(id: string): TaskTemplate | undefined {
    return this.templates.get(id);
  }

  // 모든 템플릿 조회
  getAllTemplates(): TaskTemplate[] {
    return Array.from(this.templates.values());
  }

  // 카테고리별 템플릿 조회
  getTemplatesByCategory(category: TaskTemplate["category"]): TaskTemplate[] {
    return Array.from(this.templates.values())
      .filter((template) => template.category === category)
      .sort((a, b) => b.usageCount - a.usageCount);
  }

  // 자주 사용하는 템플릿 조회
  getMostUsedTemplates(limit: number = 5): TaskTemplate[] {
    return Array.from(this.templates.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  // 최근 사용한 템플릿 조회
  getRecentlyUsedTemplates(limit: number = 5): TaskTemplate[] {
    return Array.from(this.templates.values())
      .filter((template) => template.lastUsed)
      .sort(
        (a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0)
      )
      .slice(0, limit);
  }

  // 템플릿 사용 기록
  recordTemplateUsage(id: string): void {
    const template = this.templates.get(id);
    if (template) {
      template.usageCount += 1;
      template.lastUsed = new Date();
      this.saveToStorage();
    }
  }

  // 템플릿 검색
  searchTemplates(query: string): TaskTemplate[] {
    const queryLower = query.toLowerCase();
    return Array.from(this.templates.values())
      .filter(
        (template) =>
          template.name.toLowerCase().includes(queryLower) ||
          template.description?.toLowerCase().includes(queryLower) ||
          template.tags.some((tag) => tag.toLowerCase().includes(queryLower))
      )
      .sort((a, b) => b.usageCount - a.usageCount);
  }

  // 로컬 스토리지에서 로드
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.templates = new Map();

        Object.entries(parsed).forEach(([id, template]) => {
          this.templates.set(id, {
            ...(template as TaskTemplate),
            lastUsed: (template as any).lastUsed
              ? new Date((template as any).lastUsed)
              : undefined,
          });
        });
      }
    } catch (error) {
      console.warn("Failed to load template data:", error);
    }
  }

  // 로컬 스토리지에 저장
  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.templates);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to save template data:", error);
    }
  }

  // 데이터 초기화
  clear(): void {
    this.templates.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// 싱글톤 인스턴스
export const templateStore = TemplateStore.getInstance();

// 편의 함수들
export function getTemplatesByCategory(
  category: TaskTemplate["category"]
): TaskTemplate[] {
  return templateStore.getTemplatesByCategory(category);
}

export function getMostUsedTemplates(limit?: number): TaskTemplate[] {
  return templateStore.getMostUsedTemplates(limit);
}

export function getRecentlyUsedTemplates(limit?: number): TaskTemplate[] {
  return templateStore.getRecentlyUsedTemplates(limit);
}

export function searchTemplates(query: string): TaskTemplate[] {
  return templateStore.searchTemplates(query);
}

export function addCustomTemplate(
  template: Omit<TaskTemplate, "id" | "usageCount">
): string {
  return templateStore.addTemplate(template);
}

export function recordTemplateUsage(id: string): void {
  templateStore.recordTemplateUsage(id);
}
