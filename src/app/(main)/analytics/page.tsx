"use client";

import { useEffect, useState } from "react";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  Clock,
  CheckCircle,
  Activity,
  Zap,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { useGoalStore } from "@/lib/stores/goal-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { createClient } from "@/lib/supabase";
import type { DailyReportWithTasks, Goal, Task } from "@/types";

interface AnalyticsData {
  period: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCondition: number;
  totalTimeSpent: number;
  categoryBreakdown: Array<{
    category: string;
    taskCount: number;
    timeSpent: number;
  }>;
  goalProgress: Array<{
    goalId: string;
    goalTitle: string;
    progress: number;
    taskCount: number;
  }>;
  dailyTrends: Array<{
    date: string;
    taskCount: number;
    completionRate: number;
    conditionScore: number;
  }>;
}

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const { goals } = useGoalStore();
  const supabase = createClient();

  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">(
    "week"
  );
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const data = await calculateAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Failed to load analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAnalytics = async (): Promise<AnalyticsData> => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let period: string;

    switch (timeRange) {
      case "week":
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        period = "이번 주";
        break;
      case "month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        period = "이번 달";
        break;
      case "quarter":
        // 분기 계산 (간단하게 3개월)
        startDate = new Date(
          now.getFullYear(),
          Math.floor(now.getMonth() / 3) * 3,
          1
        );
        endDate = new Date(
          now.getFullYear(),
          Math.floor(now.getMonth() / 3) * 3 + 3,
          0
        );
        period = "이번 분기";
        break;
    }

    // 일일 보고서 데이터 가져오기
    const { data: reports } = await supabase
      .from("daily_reports")
      .select(
        `
        *,
        tasks (*),
        reflections (*)
      `
      )
      .eq("user_id", user!.id)
      .gte("report_date", format(startDate, "yyyy-MM-dd"))
      .lte("report_date", format(endDate, "yyyy-MM-dd"))
      .order("report_date", { ascending: true });

    // 목표 데이터 가져오기
    const { data: goalData } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user!.id)
      .eq("status", "active");

    // 데이터 분석
    const allTasks = reports?.flatMap((report) => report.tasks || []) || [];
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      (task) => task.progress_rate === 100
    ).length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 평균 컨디션 점수
    const validReports =
      reports?.filter((report) => report.condition_score !== null) || [];
    const averageCondition =
      validReports.length > 0
        ? Math.round(
            validReports.reduce(
              (sum, report) => sum + report.condition_score!,
              0
            ) / validReports.length
          )
        : 0;

    // 총 소요 시간
    const totalTimeSpent = allTasks.reduce(
      (sum, task) => sum + (task.estimated_time_minutes || 0),
      0
    );

    // 카테고리별 분석
    const categoryBreakdown = analyzeCategories(allTasks);

    // 목표별 진행률
    const goalProgress = analyzeGoalProgress(allTasks, goalData || []);

    // 일별 트렌드
    const dailyTrends = analyzeDailyTrends(reports || []);

    return {
      period,
      totalTasks,
      completedTasks,
      completionRate,
      averageCondition,
      totalTimeSpent,
      categoryBreakdown,
      goalProgress,
      dailyTrends,
    };
  };

  const analyzeCategories = (tasks: Task[]) => {
    const categories = {
      continuous: { taskCount: 0, timeSpent: 0 },
      short_term: { taskCount: 0, timeSpent: 0 },
    };

    tasks.forEach((task) => {
      if (task.category === "continuous") {
        categories.continuous.taskCount++;
        categories.continuous.timeSpent += task.estimated_time_minutes || 0;
      } else {
        categories.short_term.taskCount++;
        categories.short_term.timeSpent += task.estimated_time_minutes || 0;
      }
    });

    return [
      {
        category: "지속 업무",
        taskCount: categories.continuous.taskCount,
        timeSpent: categories.continuous.timeSpent,
      },
      {
        category: "단기 업무",
        taskCount: categories.short_term.taskCount,
        timeSpent: categories.short_term.timeSpent,
      },
    ];
  };

  const analyzeGoalProgress = (tasks: Task[], goals: Goal[]) => {
    return goals.map((goal) => {
      const goalTasks = tasks.filter((task) => task.goal_id === goal.id);
      const completedTasks = goalTasks.filter(
        (task) => task.progress_rate === 100
      ).length;
      const progress =
        goalTasks.length > 0
          ? Math.round((completedTasks / goalTasks.length) * 100)
          : 0;

      return {
        goalId: goal.id,
        goalTitle: goal.title,
        progress,
        taskCount: goalTasks.length,
      };
    });
  };

  const analyzeDailyTrends = (reports: DailyReportWithTasks[]) => {
    return reports.map((report) => {
      const tasks = report.tasks || [];
      const taskCount = tasks.length;
      const completedCount = tasks.filter(
        (task) => task.progress_rate === 100
      ).length;
      const completionRate =
        taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

      return {
        date: report.report_date,
        taskCount,
        completionRate,
        conditionScore: report.condition_score || 0,
      };
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>생산성 분석</h1>
          <p className='text-gray-600'>
            데이터 기반으로 업무 패턴과 목표 진행 상황을 분석해보세요
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Filter className='w-4 h-4 text-gray-500' />
          <Select
            value={timeRange}
            onChange={(e) =>
              setTimeRange(e.target.value as "week" | "month" | "quarter")
            }
          >
            <option value='week'>이번 주</option>
            <option value='month'>이번 달</option>
            <option value='quarter'>이번 분기</option>
          </Select>
        </div>
      </div>

      {analyticsData && (
        <>
          {/* 주요 지표 */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      총 작업 수
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {analyticsData.totalTasks}개
                    </p>
                    <p className='text-xs text-gray-500'>
                      {analyticsData.period}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                    <Activity className='w-6 h-6 text-blue-600' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>완료율</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {analyticsData.completionRate}%
                    </p>
                    <p className='text-xs text-gray-500'>
                      {analyticsData.completedTasks}개 완료
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                    <CheckCircle className='w-6 h-6 text-green-600' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      평균 컨디션
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {analyticsData.averageCondition}/10
                    </p>
                    <p className='text-xs text-gray-500'>
                      {analyticsData.period}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center'>
                    <Zap className='w-6 h-6 text-yellow-600' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      총 소요 시간
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {formatTime(analyticsData.totalTimeSpent)}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {analyticsData.period}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                    <Clock className='w-6 h-6 text-purple-600' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 상세 분석 */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 카테고리별 분석 */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='w-5 h-5' />
                  카테고리별 분석
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {analyticsData.categoryBreakdown.map((category, index) => (
                    <div key={index} className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>
                          {category.category}
                        </span>
                        <span className='text-sm text-gray-500'>
                          {category.taskCount}개 작업
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-xs text-gray-500'>
                        <span>
                          예상 소요시간: {formatTime(category.timeSpent)}
                        </span>
                        <span>
                          {Math.round(
                            (category.taskCount / analyticsData.totalTasks) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          (category.taskCount / analyticsData.totalTasks) * 100
                        }
                        className='h-2'
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 목표별 진행률 */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Target className='w-5 h-5' />
                  목표별 진행률
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData.goalProgress.length === 0 ? (
                  <div className='text-center py-8 text-gray-500'>
                    <Target className='w-12 h-12 mx-auto mb-2 opacity-50' />
                    <p>연결된 목표가 없습니다.</p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {analyticsData.goalProgress.map((goal) => (
                      <div key={goal.goalId} className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium truncate'>
                            {goal.goalTitle}
                          </span>
                          <span className='text-sm text-gray-500'>
                            {goal.progress}%
                          </span>
                        </div>
                        <Progress value={goal.progress} className='h-2' />
                        <div className='text-xs text-gray-500'>
                          {goal.taskCount}개 작업 연결됨
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 일별 트렌드 */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='w-5 h-5' />
                일별 트렌드
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData.dailyTrends.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <Calendar className='w-12 h-12 mx-auto mb-2 opacity-50' />
                  <p>분석할 데이터가 없습니다.</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {analyticsData.dailyTrends.map((trend, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-4 border rounded-lg'
                    >
                      <div className='flex items-center gap-4'>
                        <div className='text-sm font-medium'>
                          {format(new Date(trend.date), "M월 d일")}
                        </div>
                        <div className='flex items-center gap-2'>
                          <Badge variant='outline'>
                            {trend.taskCount}개 작업
                          </Badge>
                          <Badge variant='outline'>
                            {trend.completionRate}% 완료
                          </Badge>
                          {trend.conditionScore > 0 && (
                            <Badge variant='outline'>
                              컨디션 {trend.conditionScore}/10
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className='w-24'>
                        <Progress
                          value={trend.completionRate}
                          className='h-2'
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
