import { createClient } from "@/lib/supabase";
import type { Goal, GoalWithChildren } from "@/types";

export class GoalService {
  private supabase = createClient();

  async getGoals(
    type?: "yearly" | "monthly" | "weekly" | "daily"
  ): Promise<GoalWithChildren[]> {
    let query = this.supabase
      .from("goals")
      .select(
        `
        *,
        children:goals!parent_goal_id(*)
      `
      )
      .eq("status", "active");

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query.order("created_at", {
      ascending: true,
    });

    if (error) throw error;
    return data as GoalWithChildren[];
  }

  async createGoal(goalData: {
    title: string;
    description?: string;
    type: "yearly" | "monthly" | "weekly" | "daily";
    parent_goal_id?: string;
    target_date?: string;
  }): Promise<Goal> {
    const { data: user } = await this.supabase.auth.getUser();
    if (!user.user) throw new Error("Not authenticated");

    const { data, error } = await this.supabase
      .from("goals")
      .insert([{ ...goalData, user_id: user.user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateGoal(id: string, goalData: Partial<Goal>): Promise<Goal> {
    const { data, error } = await this.supabase
      .from("goals")
      .update(goalData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteGoal(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("goals")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (error) throw error;
  }

  async getGoalProgress(goalId: string): Promise<number> {
    // 하위 목표들의 진행률을 기반으로 상위 목표 진행률 계산
    const { data: childGoals, error } = await this.supabase
      .from("goals")
      .select("progress_rate")
      .eq("parent_goal_id", goalId)
      .eq("status", "active");

    if (error) throw error;

    if (childGoals && childGoals.length > 0) {
      const totalProgress = childGoals.reduce(
        (sum, goal) => sum + goal.progress_rate,
        0
      );
      return Math.round(totalProgress / childGoals.length);
    }

    return 0;
  }

  async updateGoalProgress(goalId: string): Promise<void> {
    const progress = await this.getGoalProgress(goalId);
    await this.updateGoal(goalId, { progress_rate: progress });
  }

  async getGoalHierarchy(): Promise<GoalWithChildren[]> {
    const { data, error } = await this.supabase
      .from("goals")
      .select(
        `
        *,
        children:goals!parent_goal_id(
          *,
          children:goals!parent_goal_id(
            *,
            children:goals!parent_goal_id(*)
          )
        )
      `
      )
      .is("parent_goal_id", null)
      .eq("status", "active")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data as GoalWithChildren[];
  }

  async searchGoals(searchTerm: string): Promise<GoalWithChildren[]> {
    const { data, error } = await this.supabase
      .from("goals")
      .select(
        `
        *,
        children:goals!parent_goal_id(*)
      `
      )
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as GoalWithChildren[];
  }

  async getGoalsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<GoalWithChildren[]> {
    const { data, error } = await this.supabase
      .from("goals")
      .select(
        `
        *,
        children:goals!parent_goal_id(*)
      `
      )
      .gte("target_date", startDate)
      .lte("target_date", endDate)
      .eq("status", "active")
      .order("target_date", { ascending: true });

    if (error) throw error;
    return data as GoalWithChildren[];
  }

  async completeGoal(goalId: string): Promise<Goal> {
    const { data, error } = await this.supabase
      .from("goals")
      .update({
        status: "completed",
        progress_rate: 100,
        updated_at: new Date().toISOString(),
      })
      .eq("id", goalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async pauseGoal(goalId: string): Promise<Goal> {
    const { data, error } = await this.supabase
      .from("goals")
      .update({
        status: "paused",
        updated_at: new Date().toISOString(),
      })
      .eq("id", goalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async resumeGoal(goalId: string): Promise<Goal> {
    const { data, error } = await this.supabase
      .from("goals")
      .update({
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", goalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
