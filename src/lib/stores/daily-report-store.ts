import { create } from "zustand";
import { DailyReportService } from "@/lib/database/daily-reports";
import type { DailyReportWithTasks, Task, PhoneCall } from "@/types";
import { format, subDays } from "date-fns";

interface DailyReportState {
  currentReport: DailyReportWithTasks | null;
  selectedDate: string;
  isLoading: boolean;
  isSaving: boolean;
  carriedOverTasks: Task[]; // 넘겨진 업무 목록
  isAddingTask: boolean; // 업무 추가 중 상태
  showDateChangeConfirm: boolean; // 날짜 변경 확인 다이얼로그 표시
  pendingDateChange: string | null; // 대기 중인 날짜 변경

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
}

const dailyReportService = new DailyReportService();

export const useDailyReportStore = create<DailyReportState>((set, get) => ({
  currentReport: null,
  selectedDate: format(new Date(), "yyyy-MM-dd"),
  isLoading: false,
  isSaving: false,
  carriedOverTasks: [],
  isAddingTask: false,
  showDateChangeConfirm: false,
  pendingDateChange: null,

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

      // 미완료 업무 확인은 일일보고서 페이지에서만 수행
      // (대시보드는 현황 확인용이므로 불필요)
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
    } catch (error) {
      console.error("Failed to save daily report:", error);
      set({ isSaving: false });
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
      const updatedTask = await dailyReportService.updateTask(taskId, taskData);
      set({
        currentReport: {
          ...currentReport,
          tasks: currentReport.tasks.map((task) =>
            task.id === taskId ? updatedTask : task
          ),
        },
      });
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
}));
