import { create } from "zustand";
import { persist } from "zustand/middleware";

// 위젯 타입 정의
export interface Widget {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  isVisible: boolean;
  order: number;
  size: "small" | "medium" | "large";
  position: "left" | "right" | "full";
}

// 위젯 설정 타입
export interface WidgetSettings {
  [widgetId: string]: {
    isVisible: boolean;
    order: number;
    size: "small" | "medium" | "large";
    position: "left" | "right" | "full";
  };
}

interface WidgetStore {
  // 상태
  widgets: Widget[];
  settings: WidgetSettings;
  isEditMode: boolean;

  // 액션
  initializeWidgets: () => void;
  toggleWidget: (widgetId: string) => void;
  updateWidgetOrder: (widgetId: string, newOrder: number) => void;
  updateWidgetSize: (
    widgetId: string,
    size: "small" | "medium" | "large"
  ) => void;
  updateWidgetPosition: (
    widgetId: string,
    position: "left" | "right" | "full"
  ) => void;
  toggleEditMode: () => void;
  resetToDefault: () => void;
  getVisibleWidgets: () => Widget[];
  getWidgetsByPosition: (position: "left" | "right" | "full") => Widget[];
}

// 기본 위젯 정의
const defaultWidgets: Widget[] = [
  {
    id: "motivation-feedback",
    type: "motivation",
    title: "동기부여 피드백",
    description: "개인화된 동기부여 메시지",
    icon: "Trophy",
    isVisible: true,
    order: 1,
    size: "medium",
    position: "full",
  },
  {
    id: "ai-suggestions",
    type: "ai",
    title: "AI 제안",
    description: "AI 기반 개인화 제안",
    icon: "Lightbulb",
    isVisible: true,
    order: 2,
    size: "medium",
    position: "full",
  },
  {
    id: "smart-reminder",
    type: "reminder",
    title: "스마트 리마인더",
    description: "중요한 알림과 미완료 항목",
    icon: "Bell",
    isVisible: true,
    order: 3,
    size: "medium",
    position: "full",
  },
  {
    id: "recent-pages",
    type: "navigation",
    title: "최근 방문",
    description: "최근 방문한 페이지",
    icon: "Clock",
    isVisible: true,
    order: 4,
    size: "small",
    position: "full",
  },
  {
    id: "stats-cards",
    type: "stats",
    title: "통계 카드",
    description: "오늘의 핵심 통계",
    icon: "BarChart3",
    isVisible: true,
    order: 5,
    size: "medium",
    position: "full",
  },
  {
    id: "today-overview",
    type: "overview",
    title: "오늘의 개요",
    description: "오늘의 업무 현황",
    icon: "Calendar",
    isVisible: true,
    order: 6,
    size: "large",
    position: "left",
  },
  {
    id: "recent-activity",
    type: "activity",
    title: "최근 활동",
    description: "최근 완료된 작업들",
    icon: "Activity",
    isVisible: true,
    order: 7,
    size: "medium",
    position: "left",
  },
  {
    id: "quick-actions",
    type: "actions",
    title: "빠른 액션",
    description: "자주 사용하는 기능",
    icon: "Zap",
    isVisible: true,
    order: 8,
    size: "small",
    position: "right",
  },
  {
    id: "calendar-integration",
    type: "calendar",
    title: "일정 관리",
    description: "캘린더 연동 및 일정",
    icon: "Calendar",
    isVisible: true,
    order: 9,
    size: "medium",
    position: "right",
  },
];

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      widgets: defaultWidgets,
      settings: {},
      isEditMode: false,

      // 위젯 초기화
      initializeWidgets: () => {
        const { settings } = get();
        const widgets = defaultWidgets.map((widget) => ({
          ...widget,
          isVisible: settings[widget.id]?.isVisible ?? widget.isVisible,
          order: settings[widget.id]?.order ?? widget.order,
          size: settings[widget.id]?.size ?? widget.size,
          position: settings[widget.id]?.position ?? widget.position,
        }));
        set({ widgets });
      },

      // 위젯 표시/숨김 토글
      toggleWidget: (widgetId: string) => {
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === widgetId
              ? { ...widget, isVisible: !widget.isVisible }
              : widget
          ),
          settings: {
            ...state.settings,
            [widgetId]: {
              ...state.settings[widgetId],
              isVisible: !state.widgets.find((w) => w.id === widgetId)
                ?.isVisible,
            },
          },
        }));
      },

      // 위젯 순서 업데이트
      updateWidgetOrder: (widgetId: string, newOrder: number) => {
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === widgetId ? { ...widget, order: newOrder } : widget
          ),
          settings: {
            ...state.settings,
            [widgetId]: {
              ...state.settings[widgetId],
              order: newOrder,
            },
          },
        }));
      },

      // 위젯 크기 업데이트
      updateWidgetSize: (
        widgetId: string,
        size: "small" | "medium" | "large"
      ) => {
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === widgetId ? { ...widget, size } : widget
          ),
          settings: {
            ...state.settings,
            [widgetId]: {
              ...state.settings[widgetId],
              size,
            },
          },
        }));
      },

      // 위젯 위치 업데이트
      updateWidgetPosition: (
        widgetId: string,
        position: "left" | "right" | "full"
      ) => {
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === widgetId ? { ...widget, position } : widget
          ),
          settings: {
            ...state.settings,
            [widgetId]: {
              ...state.settings[widgetId],
              position,
            },
          },
        }));
      },

      // 편집 모드 토글
      toggleEditMode: () => {
        set((state) => ({ isEditMode: !state.isEditMode }));
      },

      // 기본값으로 리셋
      resetToDefault: () => {
        set({
          widgets: defaultWidgets,
          settings: {},
        });
      },

      // 보이는 위젯만 반환
      getVisibleWidgets: () => {
        const { widgets } = get();
        return widgets
          .filter((widget) => widget.isVisible)
          .sort((a, b) => a.order - b.order);
      },

      // 위치별 위젯 반환
      getWidgetsByPosition: (position: "left" | "right" | "full") => {
        const { widgets } = get();
        return widgets
          .filter((widget) => widget.isVisible && widget.position === position)
          .sort((a, b) => a.order - b.order);
      },
    }),
    {
      name: "widget-settings",
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
