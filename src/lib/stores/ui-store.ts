import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  showPWAInstallPrompt: boolean;
  isOnline: boolean;
  showOfflineIndicator: boolean;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  setShowPWAInstallPrompt: (show: boolean) => void;
  setIsOnline: (online: boolean) => void;
  setShowOfflineIndicator: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  sidebarOpen: false,
  showPWAInstallPrompt: false,
  isOnline: true,
  showOfflineIndicator: false,

  // Actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setShowPWAInstallPrompt: (show) => set({ showPWAInstallPrompt: show }),
  setIsOnline: (online) => set({ isOnline: online }),
  setShowOfflineIndicator: (show) => set({ showOfflineIndicator: show }),
}));
