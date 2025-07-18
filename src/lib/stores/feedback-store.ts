import { create } from "zustand";

export interface FeedbackToast {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Achievement {
  id: string;
  type:
    | "task_completed"
    | "goal_reached"
    | "streak_milestone"
    | "daily_complete";
  title: string;
  description: string;
  icon: string;
  timestamp: Date;
  isNew: boolean;
}

interface FeedbackStore {
  // 토스트 알림
  toasts: FeedbackToast[];
  addToast: (toast: Omit<FeedbackToast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // 성취 알림
  achievements: Achievement[];
  addAchievement: (
    achievement: Omit<Achievement, "id" | "timestamp" | "isNew">
  ) => void;
  markAchievementAsRead: (id: string) => void;
  clearAchievements: () => void;

  // 진행률 피드백
  showProgressUpdate: boolean;
  setShowProgressUpdate: (show: boolean) => void;

  // 축하 애니메이션
  showCelebration: boolean;
  setShowCelebration: (show: boolean) => void;
}

export const useFeedbackStore = create<FeedbackStore>((set, get) => ({
  // 토스트 알림
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id, duration: toast.duration || 4000 };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // 자동 제거
    setTimeout(() => {
      get().removeToast(id);
    }, newToast.duration);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  clearToasts: () => {
    set({ toasts: [] });
  },

  // 성취 알림
  achievements: [],
  addAchievement: (achievement) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newAchievement = {
      ...achievement,
      id,
      timestamp: new Date(),
      isNew: true,
    };

    set((state) => ({
      achievements: [newAchievement, ...state.achievements],
    }));

    // 축하 애니메이션 표시
    get().setShowCelebration(true);
    setTimeout(() => {
      get().setShowCelebration(false);
    }, 3000);
  },
  markAchievementAsRead: (id) => {
    set((state) => ({
      achievements: state.achievements.map((achievement) =>
        achievement.id === id ? { ...achievement, isNew: false } : achievement
      ),
    }));
  },
  clearAchievements: () => {
    set({ achievements: [] });
  },

  // 진행률 피드백
  showProgressUpdate: false,
  setShowProgressUpdate: (show) => {
    set({ showProgressUpdate: show });
  },

  // 축하 애니메이션
  showCelebration: false,
  setShowCelebration: (show) => {
    set({ showCelebration: show });
  },
}));
