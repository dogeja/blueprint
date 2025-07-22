// src/components/dashboard/dashboard.tsx
"use client";

import { useEffect, useMemo } from "react";
import { format, addDays, subDays } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatsCards } from "./stats-cards";
import { RecentActivity } from "./recent-activity";
import { QuickActions } from "./quick-actions";
import { TodayOverview } from "./today-overview";
import {
  ProgressChart,
  ProductivityTrendChart,
  MetricCard,
} from "@/components/ui/charts";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { useGoalStore } from "@/lib/stores/goal-store";
import { formatDate, getConditionEmoji } from "@/lib/utils";
import {
  Plus,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Target,
  Activity,
  Clock,
  CheckCircle,
} from "lucide-react";
import { GoalProgressSection } from "./goal-progress-section";
import { useAuthStore } from "@/lib/stores/auth-store";

export function Dashboard() {
  const { user } = useAuthStore();
  const { currentReport, selectedDate, loadDailyReport, setSelectedDate } =
    useDailyReportStore();
  const { goals, loadGoals } = useGoalStore();

  useEffect(() => {
    // 오늘 날짜로 일일보고서 로드
    const today = format(new Date(), "yyyy-MM-dd");
    loadDailyReport(today);
    loadGoals();
  }, [loadDailyReport, loadGoals]);

  // 장기 목표 진행률 계산
  const overallGoalProgress = useMemo(() => {
    if (!goals.length || !currentReport?.tasks) return 0;

    const goalProgress = goals
      .map((goal) => {
        const connectedTasks = currentReport.tasks.filter(
          (task) => task.goal_id === goal.id
        );
        if (connectedTasks.length === 0) return 0;

        const completedTasks = connectedTasks.filter(
          (task) => task.progress_rate === 100
        ).length;
        return (completedTasks / connectedTasks.length) * 100;
      })
      .filter((progress) => progress > 0);

    if (goalProgress.length === 0) return 0;
    return (
      goalProgress.reduce((sum, progress) => sum + progress, 0) /
      goalProgress.length
    );
  }, [goals, currentReport?.tasks]);

  // 차트 데이터 생성
  const progressChartData = useMemo(() => {
    // 최근 7일간의 데이터 생성 (실제로는 API에서 가져와야 함)
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      const completed = Math.floor(Math.random() * 8) + 2; // 2-9개
      const total = completed + Math.floor(Math.random() * 5) + 1; // 3-14개
      data.push({
        date,
        completed,
        total,
        progress: Math.round((completed / total) * 100),
      });
    }
    return data;
  }, []);

  const productivityChartData = useMemo(() => {
    // 최근 7일간의 생산성 데이터
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      const tasksCompleted = Math.floor(Math.random() * 8) + 2;
      const timeSpent = Math.floor(Math.random() * 300) + 120; // 2-7시간
      const efficiency = Math.floor(Math.random() * 40) + 60; // 60-100%
      data.push({
        date,
        tasksCompleted,
        timeSpent,
        efficiency,
      });
    }
    return data;
  }, []);

  // 오늘의 성과 지표
  const todayMetrics = useMemo(() => {
    if (!currentReport?.tasks) return null;

    const totalTasks = currentReport.tasks.length;
    const completedTasks = currentReport.tasks.filter(
      (t) => t.progress_rate === 100
    ).length;
    const totalTime = currentReport.tasks.reduce(
      (sum, t) => sum + (t.estimated_time_minutes || 0),
      0
    );
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      totalTime,
      completionRate,
    };
  }, [currentReport?.tasks]);

  // 날짜 네비게이션 핸들러들
  const handlePreviousDay = () => {
    const prevDate = format(subDays(new Date(selectedDate), 1), "yyyy-MM-dd");
    setSelectedDate(prevDate);
  };

  const handleNextDay = () => {
    const nextDate = format(addDays(new Date(selectedDate), 1), "yyyy-MM-dd");
    setSelectedDate(nextDate);
  };

  const handleToday = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    setSelectedDate(today);
  };

  const isToday = selectedDate === format(new Date(), "yyyy-MM-dd");

  return (
    <div className='space-y-6' data-onboarding='dashboard'>
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
                {overallGoalProgress > 0 && (
                  <span className='ml-2 inline-flex items-center gap-1'>
                    • 장기 목표 진행률{" "}
                    <span className='font-semibold text-primary'>
                      {overallGoalProgress.toFixed(0)}%
                    </span>
                    <Target className='w-4 h-4 text-primary' />
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* 날짜 네비게이션 */}
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handlePreviousDay}
              className='flex items-center gap-1'
            >
              <ChevronLeft className='w-4 h-4' />
              어제
            </Button>
            <Button
              variant={isToday ? "default" : "outline"}
              size='sm'
              onClick={handleToday}
              className='flex items-center gap-1'
            >
              <Calendar className='w-4 h-4' />
              오늘
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleNextDay}
              className='flex items-center gap-1'
            >
              내일
              <ChevronRight className='w-4 h-4' />
            </Button>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-3'>
          <Link href='/daily-report'>
            <Button className='flex items-center gap-2 px-6 py-3 h-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg'>
              <Plus className='w-5 h-5' />
              <span className='font-medium'>오늘의 계획 작성</span>
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

      {/* 오늘의 성과 지표 */}
      {todayMetrics && (
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <div className='w-1 h-6 bg-gradient-to-b from-green-500 to-green-400 rounded-full'></div>
            <h2 className='text-xl font-semibold text-foreground'>
              오늘의 성과
            </h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <MetricCard
              title='총 작업 수'
              value={todayMetrics.totalTasks}
              icon={<Activity className='w-6 h-6' />}
            />
            <MetricCard
              title='완료된 작업'
              value={todayMetrics.completedTasks}
              icon={<CheckCircle className='w-6 h-6' />}
            />
            <MetricCard
              title='예상 소요시간'
              value={`${Math.round(todayMetrics.totalTime / 60)}시간`}
              icon={<Clock className='w-6 h-6' />}
            />
            <MetricCard
              title='완료율'
              value={`${todayMetrics.completionRate}%`}
              change={5}
              changeType='increase'
              icon={<TrendingUp className='w-6 h-6' />}
            />
          </div>
        </div>
      )}

      {/* 데이터 시각화 섹션 */}
      <div className='space-y-8'>
        <div className='flex items-center gap-2'>
          <div className='w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-400 rounded-full'></div>
          <h2 className='text-xl font-semibold text-foreground'>데이터 분석</h2>
        </div>

        <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
          <ProgressChart data={progressChartData} title='주간 진행률 추이' />
          <ProductivityTrendChart data={productivityChartData} />
        </div>
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
          <GoalProgressSection />
        </div>
      </div>
    </div>
  );
}
