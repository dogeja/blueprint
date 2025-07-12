import { createClient } from "@/lib/supabase";
import type {
  DailyReport,
  DailyReportWithTasks,
  Task,
  PhoneCall,
  Reflection,
} from "@/types";

export class DailyReportService {
  private supabase = createClient();

  async getDailyReport(date: string): Promise<DailyReportWithTasks | null> {
    const { data: report, error } = await this.supabase
      .from("daily_reports")
      .select(
        `
        *,
        tasks(*),
        phone_calls(*),
        reflections(*)
      `
      )
      .eq("report_date", date)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return report as DailyReportWithTasks | null;
  }

  async createDailyReport(reportData: {
    report_date: string;
    condition_score?: number;
    yesterday_end_time?: string;
    today_start_time?: string;
    work_location?: string;
  }): Promise<DailyReport> {
    const { data: user } = await this.supabase.auth.getUser();
    if (!user.user) throw new Error("Not authenticated");

    const { data, error } = await this.supabase
      .from("daily_reports")
      .insert([{ ...reportData, user_id: user.user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDailyReport(
    id: string,
    reportData: Partial<DailyReport>
  ): Promise<DailyReport> {
    const { data, error } = await this.supabase
      .from("daily_reports")
      .update(reportData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addTask(
    dailyReportId: string,
    taskData: {
      title: string;
      category: "continuous" | "short_term";
      description?: string;
      estimated_time_minutes?: number;
      priority?: number;
      goal_id?: string;
    }
  ): Promise<Task> {
    const { data, error } = await this.supabase
      .from("tasks")
      .insert([{ ...taskData, daily_report_id: dailyReportId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    const { data, error } = await this.supabase
      .from("tasks")
      .update(taskData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await this.supabase.from("tasks").delete().eq("id", id);

    if (error) throw error;
  }

  async addPhoneCall(
    dailyReportId: string,
    callData: {
      call_time: string;
      caller_name?: string;
      caller_phone?: string;
      caller_organization?: string;
      content: string;
      status?: "completed" | "transferred" | "callback_needed";
      notes?: string;
    }
  ): Promise<PhoneCall> {
    const { data, error } = await this.supabase
      .from("phone_calls")
      .insert([{ ...callData, daily_report_id: dailyReportId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateReflection(
    dailyReportId: string,
    reflectionData: {
      what_went_well?: string;
      challenges?: string;
      lessons_learned?: string;
      tomorrow_priorities?: string;
      energy_level?: number;
      satisfaction_score?: number;
    }
  ): Promise<Reflection> {
    // Upsert operation (insert or update)
    const { data, error } = await this.supabase
      .from("reflections")
      .upsert([{ ...reflectionData, daily_report_id: dailyReportId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getIncompleteTasksFromPreviousDay(date: string): Promise<Task[]> {
    // date는 yyyy-MM-dd 형식, 하루 전 날짜 계산
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().slice(0, 10);
    const { data: report, error } = await this.supabase
      .from("daily_reports")
      .select("id, tasks(*)")
      .eq("report_date", prevDateStr)
      .single();
    if (error || !report) return [];
    // 100% 미만만 필터링
    return (report.tasks || []).filter((t: any) => t.progress_rate < 100);
  }

  // 최근 일일보고 히스토리 가져오기
  async getRecentReports(limit: number = 7): Promise<DailyReport[]> {
    const { data, error } = await this.supabase
      .from("daily_reports")
      .select("*")
      .order("report_date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // 특정 날짜의 일일보고 가져오기 (tasks 포함)
  async getReportWithTasks(date: string): Promise<DailyReportWithTasks | null> {
    const { data: report, error } = await this.supabase
      .from("daily_reports")
      .select(
        `
        *,
        tasks(*)
      `
      )
      .eq("report_date", date)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return report as DailyReportWithTasks | null;
  }
}
