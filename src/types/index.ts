import { Database } from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type DailyReport = Database["public"]["Tables"]["daily_reports"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type PhoneCall = Database["public"]["Tables"]["phone_calls"]["Row"];
export type Reflection = Database["public"]["Tables"]["reflections"]["Row"];
export type AdditionalReport =
  Database["public"]["Tables"]["additional_reports"]["Row"];
export type Template = Database["public"]["Tables"]["templates"]["Row"];

// 확장된 타입들
export interface DailyReportWithTasks extends DailyReport {
  tasks: Task[];
  phone_calls: PhoneCall[];
  reflections: Reflection | null;
  additional_reports?: AdditionalReport[];
}

export interface TaskWithGoal extends Task {
  goal?: Goal | null;
}

export interface GoalWithChildren extends Goal {
  children?: Goal[];
  tasks?: Task[];
}

// UI 관련 타입들
export interface DashboardStats {
  todayTasksCount: number;
  todayCompletedTasks: number;
  weeklyProgress: number;
  monthlyProgress: number;
  conditionScore: number | null;
}

export interface AnalyticsData {
  dailyProductivity: Array<{
    date: string;
    taskCount: number;
    completionRate: number;
    conditionScore: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    timeSpent: number;
    taskCount: number;
  }>;
  goalProgress: Array<{
    goalTitle: string;
    progress: number;
    type: string;
  }>;
}

// Form 타입들
export interface DailyReportForm {
  report_date: string;
  condition_score: number;
  yesterday_end_time: string;
  today_start_time: string;
  work_location: string;
  tasks: Array<{
    title: string;
    category: "continuous" | "short_term";
    description?: string;
    estimated_time_minutes?: number;
    priority: number;
    goal_id?: string;
  }>;
  phone_calls: Array<{
    call_time: string;
    caller_name?: string;
    caller_phone?: string;
    caller_organization?: string;
    content: string;
    status: "completed" | "transferred" | "callback_needed";
    notes?: string;
  }>;
  reflection: {
    what_went_well?: string;
    challenges?: string;
    lessons_learned?: string;
    tomorrow_priorities?: string;
    energy_level?: number;
    satisfaction_score?: number;
  };
}

export interface GoalForm {
  title: string;
  description?: string;
  type: "yearly" | "monthly" | "weekly" | "daily";
  parent_goal_id?: string;
  target_date?: string;
}

export interface TaskForm {
  title: string;
  category: "continuous" | "short_term";
  description?: string;
  estimated_time_minutes?: number;
  priority: number;
  goal_id?: string;
}

// Database export for direct use
export { Database };
