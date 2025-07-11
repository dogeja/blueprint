import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentPage {
  path: string;
  name: string;
  icon?: string;
  visitedAt: number;
  count: number; // 방문 횟수
}

interface RecentPagesState {
  recentPages: RecentPage[];
  addPage: (page: Omit<RecentPage, "visitedAt" | "count">) => void;
  clearPages: () => void;
}

export const useRecentPagesStore = create<RecentPagesState>()(
  persist(
    (set, get) => ({
      recentPages: [],
      addPage: (page) => {
        const { recentPages } = get();
        const now = Date.now();
        // 이미 존재하는 페이지라면 count 증가, visitedAt 갱신
        const existing = recentPages.find((p) => p.path === page.path);
        let updatedPages;
        if (existing) {
          updatedPages = [
            {
              ...existing,
              visitedAt: now,
              count: existing.count + 1,
            },
            ...recentPages.filter((p) => p.path !== page.path),
          ];
        } else {
          updatedPages = [
            {
              ...page,
              visitedAt: now,
              count: 1,
            },
            ...recentPages,
          ];
        }
        // 최대 10개만 유지
        set({ recentPages: updatedPages.slice(0, 10) });
      },
      clearPages: () => set({ recentPages: [] }),
    }),
    {
      name: "recent-pages",
    }
  )
);
