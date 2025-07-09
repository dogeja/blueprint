import { create } from "zustand";
import { GoalService } from "@/lib/database/goals";
import type { Goal, GoalWithChildren } from "@/types";

interface GoalState {
  goals: GoalWithChildren[];
  yearlyGoals: GoalWithChildren[];
  monthlyGoals: GoalWithChildren[];
  weeklyGoals: GoalWithChildren[];
  isLoading: boolean;

  // Actions
  loadGoals: () => Promise<void>;
  createGoal: (goalData: any) => Promise<void>;
  updateGoal: (goalId: string, goalData: Partial<Goal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
}

const goalService = new GoalService();

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  yearlyGoals: [],
  monthlyGoals: [],
  weeklyGoals: [],
  isLoading: false,

  loadGoals: async () => {
    set({ isLoading: true });
    try {
      const [allGoals, yearly, monthly, weekly] = await Promise.all([
        goalService.getGoals(),
        goalService.getGoals("yearly"),
        goalService.getGoals("monthly"),
        goalService.getGoals("weekly"),
      ]);

      set({
        goals: allGoals,
        yearlyGoals: yearly,
        monthlyGoals: monthly,
        weeklyGoals: weekly,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load goals:", error);
      set({ isLoading: false });
    }
  },

  createGoal: async (goalData) => {
    try {
      await goalService.createGoal(goalData);
      // Reload goals after creation
      await get().loadGoals();
    } catch (error) {
      console.error("Failed to create goal:", error);
      throw error;
    }
  },

  updateGoal: async (goalId: string, goalData: Partial<Goal>) => {
    try {
      await goalService.updateGoal(goalId, goalData);
      // Reload goals after update
      await get().loadGoals();
    } catch (error) {
      console.error("Failed to update goal:", error);
      throw error;
    }
  },

  deleteGoal: async (goalId: string) => {
    try {
      await goalService.deleteGoal(goalId);
      // Reload goals after deletion
      await get().loadGoals();
    } catch (error) {
      console.error("Failed to delete goal:", error);
      throw error;
    }
  },
}));
