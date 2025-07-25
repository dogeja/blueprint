"use client";

import React from "react";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { useGoalStore } from "@/lib/stores/goal-store";

export function StatsCards() {
  const { currentReport } = useDailyReportStore();
  const { goals } = useGoalStore();

  // 실제 데이터 기반 통계 계산
  const totalTasks = currentReport?.tasks?.length || 0;
  const completedTasks =
    currentReport?.tasks?.filter((t) => t.progress_rate === 100).length || 0;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 활성 목표 수
  const activeGoals = goals.filter((g) => g.status === "active").length;

  // 평균 컨디션 점수 (최근 7일)
  const averageCondition = currentReport?.condition_score || 0;

  const stats = [
    {
      label: "컨디션",
      value:
        averageCondition > 0
          ? `${averageCondition}/10`
          : "오늘의 컨디션을 알려주세요.",
    },
    {
      label: "목표 달성률",
      value: `${completionRate}%`,
    },
    {
      label: "활성 목표",
      value: `${activeGoals}개`,
    },
  ];

  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
      {stats.map((s, i) => (
        <div
          key={i}
          className='bg-card text-card-foreground rounded-lg shadow p-4 flex flex-col items-center min-w-0'
        >
          <span className='text-muted-foreground text-sm mb-1'>{s.label}</span>
          <span className='text-2xl font-bold'>{s.value}</span>
        </div>
      ))}
    </div>
  );
}
