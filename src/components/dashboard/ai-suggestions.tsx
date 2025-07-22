"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays } from "date-fns";
import Link from "next/link";
import { useGoalStore } from "@/lib/stores/goal-store";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { DailyReportService } from "@/lib/database/daily-reports";
import {
  analyzeUserPatterns,
  generateGoalSuggestions,
  generateDailyReportSuggestions,
  type SuggestionItem,
  type UserPatterns,
} from "@/lib/utils/ai-suggestions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  Target,
  FileText,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";

export function AISuggestions() {
  const { goals, loadGoals } = useGoalStore();
  const { currentReport } = useDailyReportStore();
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [patterns, setPatterns] = useState<UserPatterns | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function loadSuggestions() {
      try {
        setIsLoading(true);
        const dailyReportService = new DailyReportService();

        // 최근 데이터 로드
        const recentReports = await dailyReportService.getRecentReports(30);
        const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
        const yesterdayReport = await dailyReportService.getReportWithTasks(
          yesterday
        );

        // 모든 목표 수집 (현재 보고서와 어제 보고서만)
        const allTasks = [
          ...(currentReport?.tasks || []),
          ...(yesterdayReport?.tasks || []),
        ];

        // 패턴 분석
        const userPatterns = analyzeUserPatterns(
          goals,
          recentReports,
          allTasks
        );
        setPatterns(userPatterns);

        // 제안 생성
        const goalSuggestions = generateGoalSuggestions(
          userPatterns,
          goals,
          currentReport?.tasks || []
        );

        const reportSuggestions = generateDailyReportSuggestions(
          userPatterns,
          yesterdayReport,
          goals
        );

        // 제안 합치기 및 정렬
        const allSuggestions = [...goalSuggestions, ...reportSuggestions]
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 3); // 상위 3개만 표시

        setSuggestions(allSuggestions);
      } catch (error) {
        console.error("Failed to load AI suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadSuggestions();
  }, [goals, currentReport]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className='p-6'>
            <div className='space-y-3'>
              <div className='h-4 bg-muted animate-pulse rounded'></div>
              <div className='h-3 bg-muted animate-pulse rounded w-3/4'></div>
              <div className='h-3 bg-muted animate-pulse rounded w-1/2'></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (suggestions.length === 0 || !isVisible) {
    return null;
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "goal":
        return Target;
      case "task":
        return FileText;
      case "category":
        return TrendingUp;
      case "timing":
        return Clock;
      case "pattern":
        return Sparkles;
      default:
        return Lightbulb;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-blue-100 text-blue-800";
    return "bg-yellow-100 text-yellow-800";
  };

  return (
    <AnimatePresence>
      <motion.div
        className='space-y-4'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Lightbulb className='w-5 h-5 text-yellow-600' />
            <h2 className='text-lg font-semibold text-foreground'>AI 제안</h2>
            <Badge variant='secondary' className='text-xs'>
              {suggestions.length}개 제안
            </Badge>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsVisible(false)}
            className='text-muted-foreground hover:text-foreground'
          >
            <X className='w-4 h-4' />
          </Button>
        </div>

        <div className='space-y-3'>
          {suggestions.map((suggestion, index) => {
            const IconComponent = getSuggestionIcon(suggestion.type);

            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className='bg-card border shadow rounded-lg'>
                  <CardContent className='p-4'>
                    <div className='flex items-start gap-3'>
                      <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
                        <IconComponent className='w-5 h-5 text-primary' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h3 className='font-semibold text-sm text-foreground'>
                            {suggestion.title}
                          </h3>
                          <Badge variant='secondary' className={`text-xs`}>
                            {Math.round(suggestion.confidence * 100)}% 신뢰도
                          </Badge>
                        </div>
                        <p className='text-sm text-muted-foreground mb-3'>
                          {suggestion.message}
                        </p>
                        {suggestion.actionUrl && suggestion.actionText && (
                          <Link href={suggestion.actionUrl}>
                            <Button
                              size='sm'
                              variant='default'
                              className='ml-auto'
                            >
                              {suggestion.actionText}
                              <ArrowRight className='w-4 h-4 ml-1' />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* 패턴 요약 (선택적) */}
        {patterns && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className='bg-muted/30'>
              <CardContent className='p-3'>
                <div className='text-xs text-muted-foreground'>
                  <span className='font-medium'>분석 결과:</span>
                  {patterns.frequentCategories.length > 0 && (
                    <span>
                      {" "}
                      자주 사용하는 카테고리:{" "}
                      {patterns.frequentCategories.slice(0, 2).join(", ")}
                    </span>
                  )}
                  {patterns.commonKeywords.length > 0 && (
                    <span>
                      {" "}
                      • 관심 키워드:{" "}
                      {patterns.commonKeywords.slice(0, 2).join(", ")}
                    </span>
                  )}
                  <span>
                    {" "}
                    • 목표 달성률: {Math.round(patterns.goalCompletionRate)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
