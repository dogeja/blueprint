import { create } from "zustand";
import { DailyReportService } from "@/lib/database/daily-reports";
import type { DailyReportWithTasks, Task, PhoneCall } from "@/types";
import { format } from "date-fns";

interface DailyReportState {
  currentReport: DailyReportWithTasks | null;
  selectedDate: string;
  isLoading: boolean;
  isSaving: boolean;

  // Actions
  setSelectedDate: (date: string) => void;
  loadDailyReport: (date: string) => Promise<void>;
  createOrUpdateReport: (reportData: any) => Promise<void>;
  addTask: (taskData: any) => Promise<void>;
  updateTask: (taskId: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addPhoneCall: (callData: any) => Promise<void>;
  updateReflection: (reflectionData: any) => Promise<void>;
}

const dailyReportService = new DailyReportService();

export const useDailyReportStore = create<DailyReportState>((set, get) => ({
  currentReport: null,
  selectedDate: format(new Date(), "yyyy-MM-dd"),
  isLoading: false,
  isSaving: false,

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    get().loadDailyReport(date);
  },

  loadDailyReport: async (date: string) => {
    set({ isLoading: true });
    try {
      const report = await dailyReportService.getDailyReport(date);
      set({ currentReport: report, isLoading: false });
    } catch (error) {
      console.error("Failed to load daily report:", error);
      set({ isLoading: false });
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
