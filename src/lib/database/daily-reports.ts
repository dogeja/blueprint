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

  // 지속적 목표의 미완성 업무 가져오기 (최근 7일 내, 오늘 제외)
  async getIncompleteContinuousTasks(date: string): Promise<Task[]> {
    const { data: user } = await this.supabase.auth.getUser();
    if (!user.user) throw new Error("Not authenticated");

    // 최근 7일 내의 지속적 목표 미완성 업무 조회 (오늘 제외)
    const sevenDaysAgo = new Date(date);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

    const { data: reports, error } = await this.supabase
      .from("daily_reports")
      .select(
        `
        id,
        report_date,
        tasks(*)
      `
      )
      .eq("user_id", user.user.id)
      .gte("report_date", sevenDaysAgoStr)
      .lt("report_date", date) // 오늘 날짜 미만 (오늘 제외)
      .order("report_date", { ascending: false });

    if (error) throw error;

    const incompleteTasks: Task[] = [];
    const processedTaskTitles = new Set<string>(); // 중복 방지

    reports?.forEach((report: any) => {
      const continuousTasks = (report.tasks || []).filter(
        (task: any) =>
          task.category === "continuous" && task.progress_rate < 100
      );

      continuousTasks.forEach((task: any) => {
        // 같은 제목의 업무가 이미 처리되었으면 건너뛰기
        if (!processedTaskTitles.has(task.title)) {
          processedTaskTitles.add(task.title);
          incompleteTasks.push({
            ...task,
            // 가장 최근 진행률 유지
            progress_rate: task.progress_rate,
            // 상태를 'planned'로 초기화
            status: "planned",
          });
        }
      });
    });

    return incompleteTasks;
  }

  // 단기 목표의 미완성 업무 가져오기 (최근 3일 내, 오늘 제외)
  async getIncompleteShortTermTasks(date: string): Promise<Task[]> {
    const { data: user } = await this.supabase.auth.getUser();
    if (!user.user) throw new Error("Not authenticated");

    // 최근 3일 내의 단기 목표 미완성 업무 조회 (오늘 제외)
    const threeDaysAgo = new Date(date);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toISOString().slice(0, 10);

    const { data: reports, error } = await this.supabase
      .from("daily_reports")
      .select(
        `
        id,
        report_date,
        tasks(*)
      `
      )
      .eq("user_id", user.user.id)
      .gte("report_date", threeDaysAgoStr)
      .lt("report_date", date) // 오늘 날짜 미만 (오늘 제외)
      .order("report_date", { ascending: false });

    if (error) throw error;

    const incompleteTasks: Task[] = [];
    const processedTaskTitles = new Set<string>(); // 중복 방지

    reports?.forEach((report: any) => {
      const shortTermTasks = (report.tasks || []).filter(
        (task: any) =>
          task.category === "short_term" && task.progress_rate < 100
      );

      shortTermTasks.forEach((task: any) => {
        // 같은 제목의 업무가 이미 처리되었으면 건너뛰기
        if (!processedTaskTitles.has(task.title)) {
          processedTaskTitles.add(task.title);
          incompleteTasks.push({
            ...task,
            // 진행률 유지
            progress_rate: task.progress_rate,
            // 상태를 'planned'로 초기화
            status: "planned",
          });
        }
      });
    });

    return incompleteTasks;
  }

  // 미완성 업무를 오늘 날짜로 이동
  async moveIncompleteTasksToToday(
    taskIds: string[],
    targetDate: string
  ): Promise<void> {
    const { data: user } = await this.supabase.auth.getUser();
    if (!user.user) throw new Error("Not authenticated");

    // 오늘의 일일보고서 ID 가져오기 (없으면 생성)
    let { data: todayReport, error: reportError } = await this.supabase
      .from("daily_reports")
      .select("id")
      .eq("user_id", user.user.id)
      .eq("report_date", targetDate)
      .single();

    if (reportError && reportError.code === "PGRST116") {
      // 보고서가 없으면 생성
      const { data: newReport, error: createError } = await this.supabase
        .from("daily_reports")
        .insert([{ report_date: targetDate, user_id: user.user.id }])
        .select("id")
        .single();

      if (createError) throw createError;
      todayReport = newReport;
    } else if (reportError) {
      throw reportError;
    }

    if (!todayReport) {
      throw new Error("Failed to create or get today's report");
    }

    // 선택된 업무들의 daily_report_id를 오늘 날짜로 업데이트
    const { error } = await this.supabase
      .from("tasks")
      .update({ daily_report_id: todayReport.id })
      .in("id", taskIds);

    if (error) throw error;
  }

  // 모든 미완성 업무 통합 조회 (지속적 + 단기)
  async getAllIncompleteTasks(date: string): Promise<{
    continuous: Task[];
    shortTerm: Task[];
    total: Task[];
  }> {
    const [continuousTasks, shortTermTasks] = await Promise.all([
      this.getIncompleteContinuousTasks(date),
      this.getIncompleteShortTermTasks(date),
    ]);

    return {
      continuous: continuousTasks,
      shortTerm: shortTermTasks,
      total: [...continuousTasks, ...shortTermTasks],
    };
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
