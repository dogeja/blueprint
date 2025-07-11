"use client";

import React from "react";
import { motion } from "framer-motion";
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
      label: "평균 컨디션",
      value: averageCondition > 0 ? `${averageCondition}/10` : "N/A",
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
        <motion.div
          key={i}
          className='bg-card text-card-foreground rounded-lg shadow p-4 flex flex-col items-center min-w-0'
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: i * 0.1,
            duration: 0.5,
            ease: "easeOut",
          }}
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.2 },
          }}
        >
          <span className='text-muted-foreground text-sm mb-1'>{s.label}</span>
          <span className='text-2xl font-bold'>{s.value}</span>
        </motion.div>
      ))}
    </div>
  );
}
