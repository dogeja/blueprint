import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  currentPage: string;
  isOnline: boolean;
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
    timestamp: number;
  }>;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCurrentPage: (page: string) => void;
  setOnlineStatus: (online: boolean) => void;
  addNotification: (
    notification: Omit<UIState["notifications"][0], "id" | "timestamp">
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: false,
  currentPage: "dashboard",
  isOnline: true,
  notifications: [],

  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setCurrentPage: (page: string) => set({ currentPage: page }),
  setOnlineStatus: (online: boolean) => set({ isOnline: online }),

  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();

    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id, timestamp },
      ],
    }));

    // Auto remove after 5 seconds
    setTimeout(() => {
      get().removeNotification(id);
    }, 5000);
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => set({ notifications: [] }),
}));
