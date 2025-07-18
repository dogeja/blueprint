import { create } from "zustand";
import { DailyReportService } from "@/lib/database/daily-reports";
import type { DailyReportWithTasks, Task, PhoneCall } from "@/types";
import { format, subDays } from "date-fns";
import { useFeedbackStore } from "./feedback-store";

interface DailyReportState {
  currentReport: DailyReportWithTasks | null;
  selectedDate: string;
  isLoading: boolean;
  isSaving: boolean;
  carriedOverTasks: Task[]; // 넘겨진 업무 목록
  incompleteContinuousTasks: Task[]; // 지속적 목표 미완성 업무
  incompleteShortTermTasks: Task[]; // 단기 목표 미완성 업무
  isAddingTask: boolean; // 업무 추가 중 상태
  showDateChangeConfirm: boolean; // 날짜 변경 확인 다이얼로그 표시
  pendingDateChange: string | null; // 대기 중인 날짜 변경
  showIncompleteTasksModal: boolean; // 미완성 업무 모달 표시

  // Actions
  setSelectedDate: (date: string) => void;
  safeSetSelectedDate: (date: string) => Promise<boolean>; // 안전한 날짜 변경
  confirmDateChange: () => void; // 날짜 변경 확인
  cancelDateChange: () => void; // 날짜 변경 취소
  loadDailyReport: (date: string) => Promise<void>;
  createOrUpdateReport: (reportData: any) => Promise<void>;
  addTask: (taskData: any) => Promise<void>;
  updateTask: (taskId: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addPhoneCall: (callData: any) => Promise<void>;
  updateReflection: (reflectionData: any) => Promise<void>;
  carryOverIncompleteTasks: (date: string) => Promise<void>;
  executeCarryOver: (date: string) => Promise<void>;
  clearCarriedOverTasks: () => void;
  resetCarryOverStatus: () => void;
  setIsAddingTask: (isAdding: boolean) => void; // 업무 추가 상태 설정
  loadIncompleteTasks: (date: string) => Promise<void>; // 미완성 업무 로드
  addIncompleteTasksToToday: (taskIds: string[]) => Promise<void>; // 선택된 미완성 업무를 오늘에 추가
  setShowIncompleteTasksModal: (show: boolean) => void; // 미완성 업무 모달 표시 설정
}

const dailyReportService = new DailyReportService();

export const useDailyReportStore = create<DailyReportState>((set, get) => ({
  currentReport: null,
  selectedDate: format(new Date(), "yyyy-MM-dd"),
  isLoading: false,
  isSaving: false,
  carriedOverTasks: [],
  incompleteContinuousTasks: [],
  incompleteShortTermTasks: [],
  isAddingTask: false,
  showDateChangeConfirm: false,
  pendingDateChange: null,
  showIncompleteTasksModal: false,

  setSelectedDate: async (date: string) => {
    const { selectedDate } = get();

    // 같은 날짜면 변경하지 않음
    if (selectedDate === date) {
      return;
    }

    // 날짜가 변경되면 carry-over 상태 초기화
    get().resetCarryOverStatus();

    set({ selectedDate: date });
    await get().loadDailyReport(date);
  },

  // 안전한 날짜 변경 함수
  safeSetSelectedDate: async (date: string): Promise<boolean> => {
    const { isAddingTask, selectedDate } = get();

    // 업무 추가 중이고 날짜가 변경되는 경우
    if (isAddingTask && date !== selectedDate) {
      // 대기 중인 날짜 변경 저장
      set({
        showDateChangeConfirm: true,
        pendingDateChange: date,
      });
      return false; // 사용자 확인 대기
    }

    // 날짜 변경 실행
    await get().setSelectedDate(date);
    return true;
  },

  // 날짜 변경 확인
  confirmDateChange: async () => {
    const { pendingDateChange } = get();
    if (pendingDateChange) {
      set({ isAddingTask: false }); // 업무 추가 상태 초기화
      await get().setSelectedDate(pendingDateChange);
    }
    set({ showDateChangeConfirm: false, pendingDateChange: null });
  },

  // 날짜 변경 취소
  cancelDateChange: () => {
    set({ showDateChangeConfirm: false, pendingDateChange: null });
  },

  // 업무 추가 상태 설정
  setIsAddingTask: (isAdding: boolean) => {
    set({ isAddingTask: isAdding });
  },

  loadDailyReport: async (date: string) => {
    set({ isLoading: true });
    try {
      const report = await dailyReportService.getDailyReport(date);
      set({ currentReport: report, isLoading: false });

      // 오늘 날짜인 경우 미완성 업무도 함께 로드
      const today = format(new Date(), "yyyy-MM-dd");
      if (date === today) {
        await get().loadIncompleteTasks(date);
      }
    } catch (error) {
      console.error("Failed to load daily report:", error);
      set({ isLoading: false });
    }
  },

  carryOverIncompleteTasks: async (date: string) => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");

      // 오늘 날짜가 아니면 확인하지 않음
      if (date !== today) {
        return;
      }

      // 이미 처리된 상태인지 확인
      const { carriedOverTasks } = get();
      const lastProcessedDate = localStorage.getItem("lastCarryOverDate");

      // 이미 오늘 처리되었고 carriedOverTasks가 있으면 중복 확인 방지
      if (lastProcessedDate === today && carriedOverTasks.length > 0) {
        return;
      }

      // 이미 오늘 처리되었고 carriedOverTasks가 없으면 다시 확인하지 않음
      if (lastProcessedDate === today && carriedOverTasks.length === 0) {
        return;
      }

      // 어제 미완료 업무 확인
      const incompleteTasks =
        await dailyReportService.getIncompleteTasksFromPreviousDay(date);

      if (incompleteTasks.length > 0) {
        // 넘겨진 업무 목록 저장
        set({ carriedOverTasks: incompleteTasks });
        // 처리 완료 표시하지 않음 (사용자가 결정할 때까지)
      } else {
        // 미완료 업무가 없으면 처리 완료로 표시
        localStorage.setItem("lastCarryOverDate", today);
        set({ carriedOverTasks: [] });
      }
    } catch (error) {
      console.error("Failed to carry over incomplete tasks:", error);
    }
  },

  // 실제 넘기기 실행 함수
  executeCarryOver: async (date: string) => {
    try {
      const { carriedOverTasks } = get();
      if (carriedOverTasks.length === 0) return;

      // 오늘 보고서 생성
      const newReport = await dailyReportService.createDailyReport({
        report_date: date,
      });

      // 미완료 업무 복사 (진행률 0%로 초기화)
      const carriedOverTaskIds: string[] = [];
      for (const task of carriedOverTasks) {
        const addedTask = await dailyReportService.addTask(newReport.id, {
          title: task.title,
          category: task.category,
          description: task.description ?? undefined,
          estimated_time_minutes: task.estimated_time_minutes ?? undefined,
          priority: task.priority ?? undefined,
          goal_id: task.goal_id ?? undefined,
        });

        // 진행률 0%로 초기화하고 상태를 'planned'로 설정
        await dailyReportService.updateTask(addedTask.id, {
          progress_rate: 0,
          status: "planned",
        });

        carriedOverTaskIds.push(addedTask.id);
      }

      // 새로고침
      await get().loadDailyReport(date);

      // 넘겨진 업무 목록 초기화
      set({ carriedOverTasks: [] });

      // 처리 완료 표시
      localStorage.setItem("lastCarryOverDate", date);

      // 성공 메시지
      console.log(
        `${carriedOverTasks.length}개의 업무가 성공적으로 넘겨졌습니다.`
      );
    } catch (error) {
      console.error("Failed to execute carry over:", error);
      throw error;
    }
  },

  clearCarriedOverTasks: () => {
    set({ carriedOverTasks: [] });
    // 처리 완료 표시 (건너뛰기한 경우도 오늘은 더 이상 확인하지 않음)
    const today = format(new Date(), "yyyy-MM-dd");
    localStorage.setItem("lastCarryOverDate", today);
  },

  // 날짜 변경 시 처리 완료 상태 초기화
  resetCarryOverStatus: () => {
    const lastProcessedDate = localStorage.getItem("lastCarryOverDate");
    const today = format(new Date(), "yyyy-MM-dd");

    // 날짜가 바뀌었을 때만 초기화
    if (lastProcessedDate && lastProcessedDate !== today) {
      localStorage.removeItem("lastCarryOverDate");
      set({ carriedOverTasks: [] });
    }
  },

  createOrUpdateReport: async (reportData) => {
    set({ isSaving: true });
    try {
      const { currentReport } = get();

      let report;
      if (currentReport) {
        report = await dailyReportService.updateDailyReport(
          currentReport.id,
          reportData
        );
      } else {
        report = await dailyReportService.createDailyReport(reportData);
      }

      // Reload the full report with relations
      await get().loadDailyReport(reportData.report_date);
      set({ isSaving: false });

      // 피드백 제공
      const feedbackStore = useFeedbackStore.getState();

      // 새로운 보고서 생성 시
      if (!currentReport) {
        feedbackStore.addToast({
          type: "success",
          title: "오늘의 계획 생성 완료! 📝",
          message: "새로운 하루를 시작해보세요!",
          duration: 4000,
        });
      } else {
        // 보고서 업데이트 시
        feedbackStore.addToast({
          type: "success",
          title: "계획 저장 완료! 💾",
          message: "오늘의 계획이 성공적으로 저장되었습니다.",
          duration: 3000,
        });
      }

      // 일일 목표 달성 체크 (새로 로드된 데이터 사용)
      const updatedReport = get().currentReport;
      if (updatedReport?.tasks && updatedReport.tasks.length > 0) {
        const completedTasks = updatedReport.tasks.filter(
          (task: Task) => task.progress_rate === 100
        );
        const completionRate =
          (completedTasks.length / updatedReport.tasks.length) * 100;

        // 모든 작업 완료 시 축하
        if (completionRate === 100 && updatedReport.tasks.length > 0) {
          feedbackStore.addAchievement({
            type: "daily_complete",
            title: "완벽한 하루! 🌟",
            description: "오늘의 모든 계획을 완료했습니다!",
            icon: "🎯",
          });

          feedbackStore.addToast({
            type: "success",
            title: "완벽한 하루! 🎉",
            message: "오늘의 모든 계획을 완료하셨습니다! 정말 대단해요!",
            duration: 6000,
          });
        }
        // 80% 이상 완료 시 격려
        else if (completionRate >= 80) {
          feedbackStore.addToast({
            type: "info",
            title: "거의 완료! 💪",
            message: `오늘의 계획 ${completionRate.toFixed(
              0
            )}% 완료! 마지막까지 화이팅!`,
            duration: 4000,
          });
        }
      }
    } catch (error) {
      console.error("Failed to save daily report:", error);
      set({ isSaving: false });

      // 에러 피드백
      const feedbackStore = useFeedbackStore.getState();
      feedbackStore.addToast({
        type: "error",
        title: "저장 실패",
        message: "계획 저장 중 오류가 발생했습니다. 다시 시도해주세요.",
        duration: 5000,
      });

      throw error;
    }
  },

  addTask: async (taskData) => {
    const { currentReport } = get();
    if (!currentReport) throw new Error("No current report");

    try {
      const newTask = await dailyReportService.addTask(
        currentReport.id,
        taskData
      );
      set({
        currentReport: {
          ...currentReport,
          tasks: [...currentReport.tasks, newTask],
        },
      });
    } catch (error) {
      console.error("Failed to add task:", error);
      throw error;
    }
  },

  updateTask: async (taskId: string, taskData: Partial<Task>) => {
    const { currentReport } = get();
    if (!currentReport) return;

    try {
      // 이전 진행률 저장
      const previousTask = currentReport.tasks.find(
        (task) => task.id === taskId
      );
      const previousProgress = previousTask?.progress_rate || 0;

      const updatedTask = await dailyReportService.updateTask(taskId, taskData);
      set({
        currentReport: {
          ...currentReport,
          tasks: currentReport.tasks.map((task) =>
            task.id === taskId ? updatedTask : task
          ),
        },
      });

      // 피드백 제공
      const feedbackStore = useFeedbackStore.getState();

      // 작업 완료 시 축하 메시지
      if (taskData.progress_rate === 100 && previousProgress < 100) {
        feedbackStore.addToast({
          type: "success",
          title: "작업 완료! 🎉",
          message: `${updatedTask.title} 작업을 완료하셨습니다!`,
          duration: 5000,
        });

        // 성취 추가
        feedbackStore.addAchievement({
          type: "task_completed",
          title: "작업 완료",
          description: `${updatedTask.title} 작업을 완료했습니다!`,
          icon: "✅",
        });

        // 목표와 연결된 작업인 경우 목표 진행률 업데이트
        if (updatedTask.goal_id) {
          const goal = await import("./goal-store").then((m) =>
            m.useGoalStore
              .getState()
              .goals.find((g) => g.id === updatedTask.goal_id)
          );
          if (goal) {
            feedbackStore.addToast({
              type: "info",
              title: "목표 진행률 업데이트",
              message: `${goal.title} 목표에 한 걸음 더 가까워졌습니다!`,
              duration: 4000,
            });
          }
        }
      }

      // 진행률 변경 시 피드백
      else if (
        taskData.progress_rate &&
        taskData.progress_rate > previousProgress
      ) {
        const progressIncrease = taskData.progress_rate - previousProgress;
        feedbackStore.addToast({
          type: "success",
          title: "진행률 업데이트",
          message: `${updatedTask.title} 진행률이 ${progressIncrease}% 증가했습니다!`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  },

  deleteTask: async (taskId: string) => {
    const { currentReport } = get();
    if (!currentReport) return;

    try {
      await dailyReportService.deleteTask(taskId);
      set({
        currentReport: {
          ...currentReport,
          tasks: currentReport.tasks.filter((task) => task.id !== taskId),
        },
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      throw error;
    }
  },

  addPhoneCall: async (callData) => {
    const { currentReport } = get();
    if (!currentReport) throw new Error("No current report");

    try {
      const newCall = await dailyReportService.addPhoneCall(
        currentReport.id,
        callData
      );
      set({
        currentReport: {
          ...currentReport,
          phone_calls: [...currentReport.phone_calls, newCall],
        },
      });
    } catch (error) {
      console.error("Failed to add phone call:", error);
      throw error;
    }
  },

  updateReflection: async (reflectionData) => {
    const { currentReport } = get();
    if (!currentReport) throw new Error("No current report");

    try {
      const updatedReflection = await dailyReportService.updateReflection(
        currentReport.id,
        reflectionData
      );
      set({
        currentReport: {
          ...currentReport,
          reflections: updatedReflection,
        },
      });
    } catch (error) {
      console.error("Failed to update reflection:", error);
      throw error;
    }
  },

  loadIncompleteTasks: async (date: string) => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");

      // 오늘 날짜가 아니면 미완성 업무를 로드하지 않음
      if (date !== today) {
        console.log("Not today, clearing incomplete tasks");
        set({ incompleteContinuousTasks: [], incompleteShortTermTasks: [] });
        return;
      }

      console.log("Loading incomplete tasks for date:", date);

      // 데이터베이스에서 직접 이전 날짜의 미완성 업무 조회
      const [continuousTasks, shortTermTasks] = await Promise.all([
        dailyReportService.getIncompleteContinuousTasks(date),
        dailyReportService.getIncompleteShortTermTasks(date),
      ]);

      console.log("Found incomplete tasks:", {
        continuous: continuousTasks.length,
        shortTerm: shortTermTasks.length,
      });

      set({
        incompleteContinuousTasks: continuousTasks,
        incompleteShortTermTasks: shortTermTasks,
      });
    } catch (error) {
      console.error("Failed to load incomplete tasks:", error);
      set({ incompleteContinuousTasks: [], incompleteShortTermTasks: [] });
    }
  },

  addIncompleteTasksToToday: async (taskIds: string[]) => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");

      // 미완성 업무를 오늘 날짜로 이동 (새 레코드 생성하지 않음)
      await dailyReportService.moveIncompleteTasksToToday(taskIds, today);

      // 현재 보고서 새로고침
      await get().loadDailyReport(today);

      // 미완성 업무 모달 닫기
      set({ showIncompleteTasksModal: false });

      // 피드백 제공
      const feedbackStore = useFeedbackStore.getState();
      feedbackStore.addToast({
        type: "success",
        title: "미완성 업무 이동 완료! 📝",
        message: `${taskIds.length}개의 미완성 업무가 오늘의 계획으로 이동되었습니다.`,
        duration: 4000,
      });

      // 미완성 업무 목록 새로고침
      await get().loadIncompleteTasks(today);
    } catch (error) {
      console.error("Failed to move incomplete tasks to today:", error);
      throw error;
    }
  },

  setShowIncompleteTasksModal: (show: boolean) => {
    set({ showIncompleteTasksModal: show });
  },
}));
