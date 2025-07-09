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
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "완료율",
      value: `${completionRate}%`,
      subtitle: `${inProgressTasks}개 진행중`,
      icon: TrendingUp,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "예상 소요시간",
      value: `${Math.floor(totalEstimatedTime / 60)}h ${
        totalEstimatedTime % 60
      }m`,
      subtitle: "오늘 계획",
      icon: Clock,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "활성 목표",
      value: activeGoals,
      subtitle: "진행중인 목표",
      icon: Target,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
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
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    },
  ];

  return (
    <div className='grid grid-cols-2 lg:grid-cols-5 gap-4'>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  {stat.title}
                </p>
                <p className='text-2xl font-bold text-foreground'>
                  {stat.value}
                </p>
                <p className='text-xs text-muted-foreground'>{stat.subtitle}</p>
              </div>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TodayOverview() {
  // 예시 더미 데이터
  const conditionScore = 7;
  const mainGoal = "주간 프로젝트 마감";
  const progress = 65;

  return (
    <Card>
      <CardContent className='p-4 flex flex-col gap-2'>
        <h2 className='text-lg font-semibold mb-2 text-foreground'>
          오늘의 개요
        </h2>
        <div className='flex items-center gap-4'>
          <span className='text-sm text-muted-foreground'>
            컨디션 점수: <b className='text-foreground'>{conditionScore}/10</b>
          </span>
          <span className='text-sm text-muted-foreground'>
            주요 목표: <b className='text-foreground'>{mainGoal}</b>
          </span>
          <span className='text-sm text-muted-foreground'>
            진행률: <b className='text-foreground'>{progress}%</b>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
