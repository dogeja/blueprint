// 온보딩 단계 타입 정의
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string; // 렌더링할 컴포넌트 이름
  content?: string; // 추가 설명 내용
  target?: string; // 하이라이트할 요소의 선택자
  position?: "top" | "bottom" | "left" | "right";
  required?: boolean; // 필수 단계인지 여부
  action?: {
    type: "click" | "input" | "navigate";
    target?: string;
    value?: string;
  };
}

export interface OnboardingState {
  isActive: boolean;
  currentStepIndex: number;
  completedSteps: Set<string>;
  skippedSteps: Set<string>;
  preferences: {
    showOnStartup: boolean;
    enableTooltips: boolean;
    autoAdvance: boolean;
  };
}

// 기본 온보딩 단계 정의
export const DEFAULT_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "청사진에 오신 것을 환영합니다! 🎉",
    description: "인생의 푸른 설계도를 그려보세요.",
    component: "welcome",
    content: "체계적인 목표 관리와 일일 계획으로 더 나은 하루를 만들어보세요.",
    required: true,
  },
  {
    id: "dashboard",
    title: "대시보드 둘러보기",
    description: "오늘의 현황을 한눈에 확인하세요.",
    component: "dashboard-overview",
    content: "오늘의 목표 현황과 목표 진행 상황을 한눈에 확인할 수 있습니다.",
    target: "[data-onboarding='dashboard']",
    position: "bottom",
  },
  {
    id: "daily-report",
    title: "일일 목표보고 작성",
    description: "매일의 목표를 체계적으로 기록하고 관리할 수 있습니다.",
    component: "daily-report-intro",
    content: "매일의 목표를 체계적으로 기록하고 관리할 수 있습니다.",
    target: "[data-onboarding='daily-report']",
    position: "right",
    action: {
      type: "navigate",
      target: "/daily-report",
    },
  },
  {
    id: "goals",
    title: "목표 관리하기",
    description: "장기 목표부터 일일 목표까지 체계적으로 관리하세요.",
    component: "task-management",
    content:
      "목표를 추가하고, 우선순위를 설정하고, 진행 상황을 추적할 수 있습니다.",
    target: "[data-onboarding='task-form']",
    position: "top",
  },
  {
    id: "goal-connection",
    title: "목표 연결하기",
    description: "일일 목표를 장기 목표와 연결해보세요.",
    component: "goal-connection",
    content: "일일 목표를 장기 목표와 연결하여 의미 있는 성과를 만들어보세요.",
    target: "[data-onboarding='goal-selector']",
    position: "left",
  },
  {
    id: "templates",
    title: "템플릿 활용하기",
    description: "자주 사용하는 목표 패턴을 템플릿으로 저장하세요.",
    component: "templates",
    content:
      "자주 사용하는 목표 패턴을 템플릿으로 저장하고 재사용할 수 있습니다.",
    target: "[data-onboarding='template-button']",
    position: "bottom",
  },
  {
    id: "drag-drop",
    title: "드래그 앤 드롭",
    description: "목표 순서를 쉽게 변경하세요.",
    component: "drag-and-drop",
    content: "목표 순서를 드래그하여 쉽게 변경할 수 있습니다.",
    target: "[data-onboarding='draggable-task']",
    position: "right",
  },
  {
    id: "notifications",
    title: "알림 설정",
    description: "중요한 목표 완료와 목표 달성에 대한 알림을 받으세요.",
    component: "notifications",
    content: "중요한 목표 완료와 목표 달성에 대한 알림을 받을 수 있습니다.",
    target: "[data-onboarding='notification-button']",
    position: "left",
  },
  {
    id: "completion",
    title: "온보딩 완료! 🎯",
    description: "이제 청사진을 활용하여 체계적으로 목표를 관리해보세요.",
    component: "completion",
    content: "이제 청사진을 활용하여 체계적으로 목표를 관리해보세요.",
    required: true,
  },
];

// 저장소 타입 정의
type StorageType = "localStorage" | "sessionStorage" | "indexedDB" | "cookie";

// 저장소 관리자
class StorageManager {
  private static instance: StorageManager;
  private readonly STORAGE_KEY = "blueprint_onboarding_state";
  private readonly COOKIE_NAME = "blueprint_onboarding";
  private readonly COOKIE_EXPIRES = 365; // 1년

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // 다중 저장소에 저장 (우선순위: localStorage > sessionStorage > cookie)
  async save(data: any): Promise<void> {
    try {
      // localStorage에 저장 (주 저장소)
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      }

      // sessionStorage에 백업 저장
      if (this.isSessionStorageAvailable()) {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      }

      // 쿠키에 핵심 정보만 저장 (기기 간 동기화용)
      this.setCookie(
        this.COOKIE_NAME,
        JSON.stringify({
          isCompleted: data.completedSteps?.includes("completion") || false,
          isSkipped: data.skippedSteps?.includes("completion") || false,
          timestamp: Date.now(),
          deviceId: await this.getDeviceId(),
        }),
        this.COOKIE_EXPIRES
      );

      // IndexedDB에 백업 (선택적)
      if (this.isIndexedDBAvailable()) {
        await this.saveToIndexedDB(data);
      }
    } catch (error) {
      console.warn("Failed to save onboarding state:", error);
    }
  }

  // 다중 저장소에서 로드
  async load(): Promise<any> {
    try {
      // 1. localStorage에서 로드 (주 저장소)
      if (this.isLocalStorageAvailable()) {
        const localData = localStorage.getItem(this.STORAGE_KEY);
        if (localData) {
          return JSON.parse(localData);
        }
      }

      // 2. sessionStorage에서 로드 (백업)
      if (this.isSessionStorageAvailable()) {
        const sessionData = sessionStorage.getItem(this.STORAGE_KEY);
        if (sessionData) {
          return JSON.parse(sessionData);
        }
      }

      // 3. IndexedDB에서 로드 (백업)
      if (this.isIndexedDBAvailable()) {
        const indexedData = await this.loadFromIndexedDB();
        if (indexedData) {
          return indexedData;
        }
      }

      // 4. 쿠키에서 기본 정보 로드
      const cookieData = this.getCookie(this.COOKIE_NAME);
      if (cookieData) {
        const parsed = JSON.parse(cookieData);
        return {
          isActive: false,
          currentStepIndex: 0,
          completedSteps: parsed.isCompleted
            ? new Set(["completion"])
            : new Set(),
          skippedSteps: parsed.isSkipped ? new Set(["completion"]) : new Set(),
          preferences: {
            showOnStartup: !parsed.isCompleted && !parsed.isSkipped,
            enableTooltips: true,
            autoAdvance: false,
          },
        };
      }
    } catch (error) {
      console.warn("Failed to load onboarding state:", error);
    }

    return null;
  }

  // 저장소 사용 가능 여부 확인
  private isLocalStorageAvailable(): boolean {
    try {
      const test = "__localStorage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private isSessionStorageAvailable(): boolean {
    try {
      const test = "__sessionStorage_test__";
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private isIndexedDBAvailable(): boolean {
    return typeof window !== "undefined" && "indexedDB" in window;
  }

  // 쿠키 관리
  setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(
      value
    )};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  }

  // IndexedDB 관리
  private async saveToIndexedDB(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("BlueprintOnboarding", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["onboarding"], "readwrite");
        const store = transaction.objectStore("onboarding");
        const putRequest = store.put(data, this.STORAGE_KEY);

        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("onboarding")) {
          db.createObjectStore("onboarding");
        }
      };
    });
  }

  private async loadFromIndexedDB(): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("BlueprintOnboarding", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["onboarding"], "readonly");
        const store = transaction.objectStore("onboarding");
        const getRequest = store.get(this.STORAGE_KEY);

        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => reject(getRequest.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("onboarding")) {
          db.createObjectStore("onboarding");
        }
      };
    });
  }

  // 기기 ID 생성 (기기 간 동기화용)
  async getDeviceId(): Promise<string> {
    try {
      // 기존 기기 ID 확인
      const existingId = localStorage.getItem("blueprint_device_id");
      if (existingId) return existingId;

      // 새 기기 ID 생성
      const deviceId = await this.generateDeviceId();
      localStorage.setItem("blueprint_device_id", deviceId);
      return deviceId;
    } catch {
      return "unknown_device";
    }
  }

  private async generateDeviceId(): Promise<string> {
    // 간단한 기기 ID 생성 (실제로는 더 정교한 방법 사용 가능)
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx?.fillText("Blueprint", 10, 10);
    const fingerprint = canvas.toDataURL();

    const userAgent = navigator.userAgent;
    const screenInfo = `${screen.width}x${screen.height}x${screen.colorDepth}`;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const combined = `${fingerprint}-${userAgent}-${screenInfo}-${timeZone}`;
    return btoa(combined).slice(0, 16);
  }

  // 모든 저장소에서 데이터 삭제
  async clear(): Promise<void> {
    try {
      if (this.isLocalStorageAvailable()) {
        localStorage.removeItem(this.STORAGE_KEY);
      }
      if (this.isSessionStorageAvailable()) {
        sessionStorage.removeItem(this.STORAGE_KEY);
      }
      this.setCookie(this.COOKIE_NAME, "", -1); // 쿠키 삭제
      if (this.isIndexedDBAvailable()) {
        await this.clearIndexedDB();
      }
    } catch (error) {
      console.warn("Failed to clear onboarding state:", error);
    }
  }

  private async clearIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("BlueprintOnboarding", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["onboarding"], "readwrite");
        const store = transaction.objectStore("onboarding");
        const deleteRequest = store.delete(this.STORAGE_KEY);

        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
    });
  }
}

// 온보딩 저장소
class OnboardingStore {
  private static instance: OnboardingStore;
  private state: OnboardingState;
  private storageManager: StorageManager;

  private constructor() {
    this.storageManager = StorageManager.getInstance();
    this.state = this.getDefaultState();
    this.initializeState();
  }

  static getInstance(): OnboardingStore {
    if (!OnboardingStore.instance) {
      OnboardingStore.instance = new OnboardingStore();
    }
    return OnboardingStore.instance;
  }

  private getDefaultState(): OnboardingState {
    return {
      isActive: false,
      currentStepIndex: 0,
      completedSteps: new Set(),
      skippedSteps: new Set(),
      preferences: {
        showOnStartup: true,
        enableTooltips: true,
        autoAdvance: false,
      },
    };
  }

  private async initializeState(): Promise<void> {
    try {
      const stored = await this.storageManager.load();
      if (stored) {
        this.state = {
          ...stored,
          completedSteps: new Set(stored.completedSteps || []),
          skippedSteps: new Set(stored.skippedSteps || []),
        };
      }
    } catch (error) {
      console.warn("Failed to initialize onboarding state:", error);
    }
  }

  // 상태 가져오기
  getState(): OnboardingState {
    return { ...this.state };
  }

  // 온보딩 시작
  async startOnboarding(): Promise<void> {
    this.state.isActive = true;
    this.state.currentStepIndex = 0;
    await this.storageManager.save(this.state);
  }

  // 온보딩 종료
  async completeOnboarding(): Promise<void> {
    this.state.isActive = false;
    this.state.completedSteps.add("completion");
    await this.storageManager.save(this.state);
  }

  // 온보딩 건너뛰기
  async skipOnboarding(): Promise<void> {
    this.state.isActive = false;
    this.state.skippedSteps.add("completion");
    await this.storageManager.save(this.state);
  }

  // 다음 단계로 이동
  async nextStep(): Promise<void> {
    const currentStep = DEFAULT_ONBOARDING_STEPS[this.state.currentStepIndex];
    if (currentStep) {
      this.state.completedSteps.add(currentStep.id);
    }

    if (this.state.currentStepIndex < DEFAULT_ONBOARDING_STEPS.length - 1) {
      this.state.currentStepIndex++;
    } else {
      await this.completeOnboarding();
      return;
    }
    await this.storageManager.save(this.state);
  }

  // 이전 단계로 이동
  async previousStep(): Promise<void> {
    if (this.state.currentStepIndex > 0) {
      this.state.currentStepIndex--;
      await this.storageManager.save(this.state);
    }
  }

  // 특정 단계로 이동
  async goToStep(stepIndex: number): Promise<void> {
    if (stepIndex >= 0 && stepIndex < DEFAULT_ONBOARDING_STEPS.length) {
      this.state.currentStepIndex = stepIndex;
      await this.storageManager.save(this.state);
    }
  }

  // 단계 완료 표시
  async markStepCompleted(stepId: string): Promise<void> {
    this.state.completedSteps.add(stepId);
    await this.storageManager.save(this.state);
  }

  // 단계 건너뛰기 표시
  async markStepSkipped(stepId: string): Promise<void> {
    this.state.skippedSteps.add(stepId);
    await this.storageManager.save(this.state);
  }

  // 현재 단계 가져오기
  getCurrentStep(): OnboardingStep | null {
    return DEFAULT_ONBOARDING_STEPS[this.state.currentStepIndex] || null;
  }

  // 진행률 계산
  getProgress(): number {
    const totalSteps = DEFAULT_ONBOARDING_STEPS.length;
    const completedCount = this.state.completedSteps.size;
    return Math.round((completedCount / totalSteps) * 100);
  }

  // 온보딩 완료 여부 확인
  isCompleted(): boolean {
    return this.state.completedSteps.has("completion");
  }

  // 온보딩 건너뛰기 여부 확인
  isSkipped(): boolean {
    return this.state.skippedSteps.has("completion");
  }

  // 설정 업데이트
  async updatePreferences(
    preferences: Partial<OnboardingState["preferences"]>
  ): Promise<void> {
    this.state.preferences = { ...this.state.preferences, ...preferences };
    await this.storageManager.save(this.state);
  }

  // 데이터 초기화
  async reset(): Promise<void> {
    this.state = this.getDefaultState();
    await this.storageManager.clear();
  }

  // 기기 간 동기화 상태 확인
  async checkCrossDeviceSync(): Promise<{
    hasOtherDevice: boolean;
    lastSyncTime?: number;
    deviceId?: string;
  }> {
    try {
      const cookieData = this.storageManager.getCookie("blueprint_onboarding");
      if (cookieData) {
        const parsed = JSON.parse(cookieData);
        const currentDeviceId = await this.storageManager.getDeviceId();

        return {
          hasOtherDevice: parsed.deviceId !== currentDeviceId,
          lastSyncTime: parsed.timestamp,
          deviceId: parsed.deviceId,
        };
      }
    } catch (error) {
      console.warn("Failed to check cross-device sync:", error);
    }

    return { hasOtherDevice: false };
  }
}

// 싱글톤 인스턴스
export const onboardingStore = OnboardingStore.getInstance();

// 편의 함수들
export function startOnboarding(): Promise<void> {
  return onboardingStore.startOnboarding();
}

export function completeOnboarding(): Promise<void> {
  return onboardingStore.completeOnboarding();
}

export function skipOnboarding(): Promise<void> {
  return onboardingStore.skipOnboarding();
}

export function getOnboardingState(): OnboardingState {
  return onboardingStore.getState();
}

export function getCurrentStep(): OnboardingStep | null {
  return onboardingStore.getCurrentStep();
}

export function getOnboardingProgress(): number {
  return onboardingStore.getProgress();
}

export function isOnboardingCompleted(): boolean {
  return onboardingStore.isCompleted();
}

export function isOnboardingSkipped(): boolean {
  return onboardingStore.isSkipped();
}

export function checkCrossDeviceSync(): Promise<{
  hasOtherDevice: boolean;
  lastSyncTime?: number;
  deviceId?: string;
}> {
  return onboardingStore.checkCrossDeviceSync();
}
