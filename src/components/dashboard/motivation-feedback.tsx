"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useGoalStore } from "@/lib/stores/goal-store";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { DailyReportService } from "@/lib/database/daily-reports";
import {
  calculateReportStreak,
  calculateWeeklyGoalProgress,
  compareYesterdayToday,
  generateMotivationMessage,
} from "@/lib/utils/motivation-utils";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Target, Calendar } from "lucide-react";

interface MotivationData {
  greeting: string;
  motivation: string;
  badges: string[];
  weeklyProgress: number;
  streak: number;
}

export function MotivationFeedback() {
  const { profile } = useAuthStore();
  const { goals } = useGoalStore();
  const { currentReport } = useDailyReportStore();
  const [motivationData, setMotivationData] = useState<MotivationData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMotivationData() {
      try {
        setIsLoading(true);
        const dailyReportService = new DailyReportService();

        // 최근 7일 일일보고 히스토리 가져오기
        const recentReports = await dailyReportService.getRecentReports(7);

        // 어제 일일보고 가져오기
        const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
        const yesterdayReport = await dailyReportService.getReportWithTasks(
          yesterday
        );

        // 계산
        const streak = calculateReportStreak(recentReports);
        const weeklyProgress = calculateWeeklyGoalProgress(goals);
        const comparison = compareYesterdayToday(
          yesterdayReport?.tasks || [],
          currentReport?.tasks || []
        );

        // 동기부여 메시지 생성
        const { greeting, motivation, badges } = generateMotivationMessage(
          streak,
          weeklyProgress,
          comparison,
          profile?.name || "사용자"
        );

        setMotivationData({
          greeting,
          motivation,
          badges,
          weeklyProgress,
          streak,
        });
      } catch (error) {
        console.error("Failed to load motivation data:", error);
        // 기본 메시지 설정
        setMotivationData({
          greeting: `좋은 하루예요, ${profile?.name || "사용자"}님!`,
          motivation: "오늘도 목표를 향해 한 걸음씩 나아가요!",
          badges: [],
          weeklyProgress: 0,
          streak: 0,
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadMotivationData();
  }, [goals, currentReport, profile?.name]);

  if (isLoading) {
    return (
      <motion.div
        className='space-y-4'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className='h-8 bg-muted animate-pulse rounded'></div>
        <div className='h-6 bg-muted animate-pulse rounded w-3/4'></div>
      </motion.div>
    );
  }

  if (!motivationData) return null;

  return (
    <motion.div
      className='space-y-4'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* 인사말 */}
      <motion.div
        className='space-y-2'
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className='text-2xl font-bold text-primary'>
          {motivationData.greeting}
        </div>
        <div className='text-base text-muted-foreground'>
          {motivationData.motivation}
        </div>
      </motion.div>

      {/* 배지들 */}
      {motivationData.badges.length > 0 && (
        <motion.div
          className='flex flex-wrap gap-2'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {motivationData.badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Badge
                variant='secondary'
                className='text-sm font-medium bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300 hover:from-orange-200 hover:to-orange-300 transition-all duration-300'
              >
                {badge}
              </Badge>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* 통계 카드들 */}
      <motion.div
        className='grid grid-cols-1 sm:grid-cols-2 gap-4'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {/* 연속 작성일 */}
        <motion.div
          className='bg-muted border border-primary/20 rounded-lg p-4'
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center'>
              <Calendar className='w-5 h-5 text-white' />
            </div>
            <div>
              <div className='text-sm text-blue-600 font-medium'>
                연속 작성일
              </div>
              <div className='text-2xl font-bold text-blue-800'>
                {motivationData.streak}일
              </div>
            </div>
          </div>
        </motion.div>

        {/* 주간 목표 달성률 */}
        <motion.div
          className='bg-muted border border-primary/20 rounded-lg p-4'
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center'>
              <Target className='w-5 h-5 text-white' />
            </div>
            <div>
              <div className='text-sm text-green-600 font-medium'>
                주간 목표 달성률
              </div>
              <div className='text-2xl font-bold text-green-800'>
                {motivationData.weeklyProgress}%
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
