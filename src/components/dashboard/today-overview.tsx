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
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "완료율",
      value: `${completionRate}%`,
      subtitle: `${inProgressTasks}개 진행중`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "예상 소요시간",
      value: `${Math.floor(totalEstimatedTime / 60)}h ${
        totalEstimatedTime % 60
      }m`,
      subtitle: "오늘 계획",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "활성 목표",
      value: activeGoals,
      subtitle: "진행중인 목표",
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
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
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <div className='grid grid-cols-2 lg:grid-cols-5 gap-4'>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  {stat.title}
                </p>
                <p className='text-2xl font-bold text-gray-900'>{stat.value}</p>
                <p className='text-xs text-gray-500'>{stat.subtitle}</p>
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
    <div className='bg-white rounded-lg shadow p-4 flex flex-col gap-2'>
      <h2 className='text-lg font-semibold mb-2'>오늘의 개요</h2>
      <div className='flex items-center gap-4'>
        <span className='text-sm'>
          컨디션 점수: <b>{conditionScore}/10</b>
        </span>
        <span className='text-sm'>
          주요 목표: <b>{mainGoal}</b>
        </span>
        <span className='text-sm'>
          진행률: <b>{progress}%</b>
        </span>
      </div>
    </div>
  );
}
