// src/components/dashboard/dashboard.tsx
"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatsCards } from "./stats-cards";
import { RecentActivity } from "./recent-activity";
import { QuickActions } from "./quick-actions";
import { TodayOverview } from "./today-overview";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { useGoalStore } from "@/lib/stores/goal-store";
import { formatDate, getConditionEmoji } from "@/lib/utils";
import { Plus, TrendingUp } from "lucide-react";

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
    <div className='space-y-8'>
      {/* 헤더 섹션 */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg'>
              <TrendingUp className='w-6 h-6 text-primary-foreground' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-foreground'>대시보드</h1>
              <p className='text-muted-foreground'>
                {formatDate(selectedDate)} -
                {currentReport?.condition_score && (
                  <span className='ml-2 inline-flex items-center gap-1'>
                    컨디션 {currentReport.condition_score}/10{" "}
                    <span className='text-lg'>
                      {getConditionEmoji(currentReport.condition_score)}
                    </span>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-3'>
          <Link href='/daily-report'>
            <Button className='flex items-center gap-2 px-6 py-3 h-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg'>
              <Plus className='w-5 h-5' />
              <span className='font-medium'>일일보고 작성</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 통계 카드 섹션 */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <div className='w-1 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full'></div>
          <h2 className='text-xl font-semibold text-foreground'>오늘의 현황</h2>
        </div>
        <StatsCards />
      </div>

      {/* 메인 콘텐츠 그리드 */}
      <div className='grid grid-cols-1 xl:grid-cols-3 gap-8'>
        {/* 왼쪽 컬럼 - 오늘 개요 */}
        <div className='xl:col-span-2 space-y-8'>
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <div className='w-1 h-5 bg-gradient-to-b from-blue-500 to-blue-400 rounded-full'></div>
              <h2 className='text-lg font-semibold text-foreground'>
                오늘의 개요
              </h2>
            </div>
            <TodayOverview />
          </div>

          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <div className='w-1 h-5 bg-gradient-to-b from-green-500 to-green-400 rounded-full'></div>
              <h2 className='text-lg font-semibold text-foreground'>
                최근 활동
              </h2>
            </div>
            <RecentActivity />
          </div>
        </div>

        {/* 오른쪽 컬럼 - 사이드바 */}
        <div className='space-y-8'>
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <div className='w-1 h-5 bg-gradient-to-b from-purple-500 to-purple-400 rounded-full'></div>
              <h2 className='text-lg font-semibold text-foreground'>
                빠른 액션
              </h2>
            </div>
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
