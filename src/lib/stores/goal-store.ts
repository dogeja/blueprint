import { create } from "zustand";
import { GoalService } from "@/lib/database/goals";
import type { Goal, GoalWithChildren } from "@/types";
import { toast } from "@/components/ui/toast";

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
      const newGoal = await goalService.createGoal(goalData);
      // Reload goals after creation
      await get().loadGoals();

      // 성공 토스트
      toast.success(
        "목표 생성 완료! 🎯",
        `${goalData.title} 목표를 새로 설정하셨습니다!`
      );
    } catch (error) {
      console.error("Failed to create goal:", error);

      // 에러 토스트
      toast.error(
        "목표 생성 실패",
        "목표 생성 중 오류가 발생했습니다. 다시 시도해주세요."
      );

      throw error;
    }
  },

  updateGoal: async (goalId: string, goalData: Partial<Goal>) => {
    try {
      await goalService.updateGoal(goalId, goalData);
      // Reload goals after update
      await get().loadGoals();

      // 피드백 제공
      // const feedbackStore = useFeedbackStore.getState(); // This line is removed as per the new_code
      // feedbackStore.addToast({ // This line is removed as per the new_code
      //   type: "success", // This line is removed as per the new_code
      //   title: "목표 수정 완료! ✏️", // This line is removed as per the new_code
      //   message: "목표가 성공적으로 수정되었습니다.", // This line is removed as per the new_code
      //   duration: 3000, // This line is removed as per the new_code
      // }); // This line is removed as per the new_code
    } catch (error) {
      console.error("Failed to update goal:", error);

      // 에러 피드백
      // const feedbackStore = useFeedbackStore.getState(); // This line is removed as per the new_code
      // feedbackStore.addToast({ // This line is removed as per the new_code
      //   type: "error", // This line is removed as per the new_code
      //   title: "목표 수정 실패", // This line is removed as per the new_code
      //   message: "목표 수정 중 오류가 발생했습니다. 다시 시도해주세요.", // This line is removed as per the new_code
      //   duration: 5000, // This line is removed as per the new_code
      // }); // This line is removed as per the new_code

      throw error;
    }
  },

  deleteGoal: async (goalId: string) => {
    try {
      await goalService.deleteGoal(goalId);
      // Reload goals after deletion
      await get().loadGoals();

      // 피드백 제공
      // const feedbackStore = useFeedbackStore.getState(); // This line is removed as per the new_code
      // feedbackStore.addToast({ // This line is removed as per the new_code
      //   type: "info", // This line is removed as per the new_code
      //   title: "목표 삭제 완료", // This line is removed as per the new_code
      //   message: "목표가 성공적으로 삭제되었습니다.", // This line is removed as per the new_code
      //   duration: 3000, // This line is removed as per the new_code
      // }); // This line is removed as per the new_code
    } catch (error) {
      console.error("Failed to delete goal:", error);

      // 에러 피드백
      // const feedbackStore = useFeedbackStore.getState(); // This line is removed as per the new_code
      // feedbackStore.addToast({ // This line is removed as per the new_code
      //   type: "error", // This line is removed as per the new_code
      //   title: "목표 삭제 실패", // This line is removed as per the new_code
      //   message: "목표 삭제 중 오류가 발생했습니다. 다시 시도해주세요.", // This line is removed as per the new_code
      //   duration: 5000, // This line is removed as per the new_code
      // }); // This line is removed as per the new_code

      throw error;
    }
  },
}));
