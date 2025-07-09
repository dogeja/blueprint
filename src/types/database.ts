export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          department: string | null;
          position: string | null;
          work_start_time: string | null;
          work_end_time: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          name?: string | null;
          department?: string | null;
          position?: string | null;
          work_start_time?: string | null;
          work_end_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string | null;
          department?: string | null;
          position?: string | null;
          work_start_time?: string | null;
          work_end_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          type: "yearly" | "monthly" | "weekly" | "daily";
          parent_goal_id: string | null;
          target_date: string | null;
          status: "active" | "completed" | "paused" | "cancelled";
          progress_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          type: "yearly" | "monthly" | "weekly" | "daily";
          parent_goal_id?: string | null;
          target_date?: string | null;
          status?: "active" | "completed" | "paused" | "cancelled";
          progress_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          type?: "yearly" | "monthly" | "weekly" | "daily";
          parent_goal_id?: string | null;
          target_date?: string | null;
          status?: "active" | "completed" | "paused" | "cancelled";
          progress_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_reports: {
        Row: {
          id: string;
          user_id: string;
          report_date: string;
          condition_score: number | null;
          yesterday_end_time: string | null;
          today_start_time: string | null;
          work_location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          report_date: string;
          condition_score?: number | null;
          yesterday_end_time?: string | null;
          today_start_time?: string | null;
          work_location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          report_date?: string;
          condition_score?: number | null;
          yesterday_end_time?: string | null;
          today_start_time?: string | null;
          work_location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          daily_report_id: string;
          goal_id: string | null;
          title: string;
          description: string | null;
          category: "continuous" | "short_term";
          task_type: string | null;
          estimated_time_minutes: number | null;
          actual_time_minutes: number | null;
          progress_rate: number;
          priority: number;
          status: "planned" | "in_progress" | "completed" | "cancelled";
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          daily_report_id: string;
          goal_id?: string | null;
          title: string;
          description?: string | null;
          category: "continuous" | "short_term";
          task_type?: string | null;
          estimated_time_minutes?: number | null;
          actual_time_minutes?: number | null;
          progress_rate?: number;
          priority?: number;
          status?: "planned" | "in_progress" | "completed" | "cancelled";
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          daily_report_id?: string;
          goal_id?: string | null;
          title?: string;
          description?: string | null;
          category?: "continuous" | "short_term";
          task_type?: string | null;
          estimated_time_minutes?: number | null;
          actual_time_minutes?: number | null;
          progress_rate?: number;
          priority?: number;
          status?: "planned" | "in_progress" | "completed" | "cancelled";
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      phone_calls: {
        Row: {
          id: string;
          daily_report_id: string;
          call_time: string;
          caller_name: string | null;
          caller_phone: string | null;
          caller_organization: string | null;
          content: string;
          status: "completed" | "transferred" | "callback_needed";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          daily_report_id: string;
          call_time: string;
          caller_name?: string | null;
          caller_phone?: string | null;
          caller_organization?: string | null;
          content: string;
          status?: "completed" | "transferred" | "callback_needed";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          daily_report_id?: string;
          call_time?: string;
          caller_name?: string | null;
          caller_phone?: string | null;
          caller_organization?: string | null;
          content?: string;
          status?: "completed" | "transferred" | "callback_needed";
          notes?: string | null;
          created_at?: string;
        };
      };
      reflections: {
        Row: {
          id: string;
          daily_report_id: string;
          what_went_well: string | null;
          challenges: string | null;
          lessons_learned: string | null;
          tomorrow_priorities: string | null;
          energy_level: number | null;
          satisfaction_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          daily_report_id: string;
          what_went_well?: string | null;
          challenges?: string | null;
          lessons_learned?: string | null;
          tomorrow_priorities?: string | null;
          energy_level?: number | null;
          satisfaction_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          daily_report_id?: string;
          what_went_well?: string | null;
          challenges?: string | null;
          lessons_learned?: string | null;
          tomorrow_priorities?: string | null;
          energy_level?: number | null;
          satisfaction_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      additional_reports: {
        Row: {
          id: string;
          daily_report_id: string;
          type: "additional_info" | "instruction";
          content: string;
          priority: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          daily_report_id: string;
          type: "additional_info" | "instruction";
          content: string;
          priority?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          daily_report_id?: string;
          type?: "additional_info" | "instruction";
          content?: string;
          priority?: number;
          created_at?: string;
        };
      };
      templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          template_data: any;
          category: string | null;
          is_active: boolean;
          usage_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          template_data: any;
          category?: string | null;
          is_active?: boolean;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          template_data?: any;
          category?: string | null;
          is_active?: boolean;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
