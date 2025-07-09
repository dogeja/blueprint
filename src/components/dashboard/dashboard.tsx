// src/components/dashboard/dashboard.tsx
"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Calendar,
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StatsCards } from "./stats-cards";
import { RecentActivity } from "./recent-activity";
import { QuickActions } from "./quick-actions";
import { TodayOverview } from "./today-overview";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { useGoalStore } from "@/lib/stores/goal-store"; // 한 번만 import
import { formatDate, getConditionEmoji } from "@/lib/utils";

export function Dashboard() {
  const { currentReport, selectedDate, loadDailyReport } =
    useDailyReportStore();
  const { loadGoals } = useGoalStore();

  useEffect(() => {
    // 오늘 날짜로 일일보고서 로드
    const today = format(new Date(), "yyyy-MM-dd");
    loadDailyReport(today);
    loadGoals();
  }, [loadDailyReport, loadGoals]);

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>대시보드</h1>
          <p className='text-gray-600'>
            {formatDate(selectedDate)} -
            {currentReport?.condition_score && (
              <span className='ml-1'>
                컨디션 {currentReport.condition_score}/10{" "}
                {getConditionEmoji(currentReport.condition_score)}
              </span>
            )}
          </p>
        </div>
        <div className='mt-4 sm:mt-0 flex gap-2'>
          <Link href='/daily-report'>
            <Button className='flex items-center gap-2'>
              <Plus className='w-4 h-4' />
              일일보고 작성
            </Button>
          </Link>
        </div>
      </div>

      {/* 통계 카드 */}
      <StatsCards />

      {/* 메인 콘텐츠 그리드 */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* 왼쪽 컬럼 - 오늘 개요 */}
        <div className='lg:col-span-2 space-y-6'>
          <TodayOverview />
          <RecentActivity />
        </div>

        {/* 오른쪽 컬럼 - 사이드바 */}
        <div className='space-y-6'>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
