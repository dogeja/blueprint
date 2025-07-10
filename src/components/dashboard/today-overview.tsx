"use client";

import { CheckCircle, Clock, Target, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { useGoalStore } from "@/lib/stores/goal-store";
import { getConditionEmoji } from "@/lib/utils";
import React from "react";

export function StatsCards() {
  const { currentReport } = useDailyReportStore();
  const { goals } = useGoalStore();

  // 통계 계산
  const totalTasks = currentReport?.tasks.length || 0;
  const completedTasks =
    currentReport?.tasks.filter((t) => t.progress_rate === 100).length || 0;
  const inProgressTasks =
    currentReport?.tasks.filter(
      (t) => t.progress_rate > 0 && t.progress_rate < 100
    ).length || 0;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeGoals = goals.filter((g) => g.status === "active").length;

  const totalEstimatedTime =
    currentReport?.tasks.reduce(
      (sum, task) => sum + (task.estimated_time_minutes || 0),
      0
    ) || 0;

  const stats = [
    {
      title: "오늘 업무",
      value: totalTasks,
      subtitle: `${completedTasks}개 완료`,
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      darkBgGradient: "from-green-900/20 to-emerald-900/20",
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "완료율",
      value: `${completionRate}%`,
      subtitle: `${inProgressTasks}개 진행중`,
      icon: TrendingUp,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
      darkBgGradient: "from-blue-900/20 to-indigo-900/20",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "예상 소요시간",
      value: `${Math.floor(totalEstimatedTime / 60)}h ${
        totalEstimatedTime % 60
      }m`,
      subtitle: "오늘 계획",
      icon: Clock,
      gradient: "from-orange-500 to-amber-600",
      bgGradient: "from-orange-50 to-amber-50",
      darkBgGradient: "from-orange-900/20 to-amber-900/20",
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "활성 목표",
      value: activeGoals,
      subtitle: "진행중인 목표",
      icon: Target,
      gradient: "from-purple-500 to-violet-600",
      bgGradient: "from-purple-50 to-violet-50",
      darkBgGradient: "from-purple-900/20 to-violet-900/20",
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "컨디션",
      value: currentReport?.condition_score
        ? `${currentReport.condition_score}/10`
        : "N/A",
      subtitle: currentReport?.condition_score
        ? getConditionEmoji(currentReport.condition_score)
        : "미입력",
      icon: Zap,
      gradient: "from-yellow-500 to-orange-600",
      bgGradient: "from-yellow-50 to-orange-50",
      darkBgGradient: "from-yellow-900/20 to-orange-900/20",
      color: "text-yellow-600 dark:text-yellow-400",
    },
  ];

  return (
    <div className='grid grid-cols-2 lg:grid-cols-5 gap-4'>
      {stats.map((stat, index) => (
        <Card
          key={index}
          className='group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm'
        >
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div className='space-y-2'>
                <p className='text-sm font-medium text-muted-foreground'>
                  {stat.title}
                </p>
                <p className='text-2xl font-bold text-foreground'>
                  {stat.value}
                </p>
                <p className='text-xs text-muted-foreground'>{stat.subtitle}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
              >
                <stat.icon className={`w-6 h-6 text-white`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TodayOverview() {
  const { currentReport } = useDailyReportStore();
  const { goals } = useGoalStore();

  // 실제 데이터 기반 계산
  const conditionScore = currentReport?.condition_score || 0;

  // 가장 높은 우선순위의 활성 목표 찾기
  const mainGoal = goals
    .filter((g) => g.status === "active")
    .sort((a, b) => (b.progress_rate || 0) - (a.progress_rate || 0))[0];

  // 전체 진행률 계산 (모든 활성 목표의 평균)
  const activeGoals = goals.filter((g) => g.status === "active");
  const totalProgress = activeGoals.reduce(
    (sum, goal) => sum + (goal.progress_rate || 0),
    0
  );
  const averageProgress =
    activeGoals.length > 0 ? Math.round(totalProgress / activeGoals.length) : 0;

  return (
    <Card className='border-0 shadow-sm hover:shadow-lg transition-all duration-300'>
      <CardContent className='p-6'>
        <div className='space-y-4'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg'>
              <Target className='w-5 h-5 text-white' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-foreground'>
                오늘의 개요
              </h3>
              <p className='text-sm text-muted-foreground'>
                전체적인 진행 상황
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pt-2'>
            <div className='flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'>
              <div className='w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>
                  {conditionScore}
                </span>
              </div>
              <div>
                <p className='text-sm font-medium text-foreground'>
                  컨디션 점수
                </p>
                <p className='text-xs text-muted-foreground'>10점 만점</p>
              </div>
            </div>

            <div className='flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'>
              <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center'>
                <Target className='w-4 h-4 text-white' />
              </div>
              <div>
                <p className='text-sm font-medium text-foreground'>주요 목표</p>
                <p className='text-xs text-muted-foreground truncate'>
                  {mainGoal?.title || "목표 없음"}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20'>
              <div className='w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>
                  {averageProgress}%
                </span>
              </div>
              <div>
                <p className='text-sm font-medium text-foreground'>
                  전체 진행률
                </p>
                <p className='text-xs text-muted-foreground'>목표 대비</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
