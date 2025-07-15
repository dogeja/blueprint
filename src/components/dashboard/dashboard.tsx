// src/components/dashboard/dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { format, addDays, subDays } from "date-fns";
import Link from "next/link";
import { motion, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StatsCards } from "./stats-cards";
import { RecentActivity } from "./recent-activity";
import { QuickActions } from "./quick-actions";
import { TodayOverview } from "./today-overview";
import { RecentPages } from "./recent-pages";
import { MotivationFeedback } from "./motivation-feedback";
import { SmartReminder } from "./smart-reminder";
import { CalendarIntegration } from "./calendar-integration";
import { AISuggestions } from "./ai-suggestions";
import { WidgetWrapper } from "./widget-wrapper";
import { WidgetEditorModal } from "./widget-editor-modal";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { useGoalStore } from "@/lib/stores/goal-store";
import { useWidgetStore } from "@/lib/stores/widget-store";
import { formatDate, getConditionEmoji } from "@/lib/utils";
import {
  Plus,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";

// 애니메이션 variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function Dashboard() {
  const { currentReport, selectedDate, loadDailyReport, setSelectedDate } =
    useDailyReportStore();
  const { loadGoals } = useGoalStore();
  const {
    widgets,
    isEditMode,
    getWidgetsByPosition,
    initializeWidgets,
    updateWidgetOrder,
  } = useWidgetStore();
  const [isWidgetEditorOpen, setIsWidgetEditorOpen] = useState(false);

  useEffect(() => {
    // 오늘 날짜로 일일보고서 로드
    const today = format(new Date(), "yyyy-MM-dd");
    loadDailyReport(today);
    loadGoals();
    initializeWidgets();
  }, [loadDailyReport, loadGoals, initializeWidgets]);

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

  // 위젯 렌더링 함수
  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "motivation-feedback":
        return <MotivationFeedback />;
      case "ai-suggestions":
        return <AISuggestions />;
      case "smart-reminder":
        return <SmartReminder />;
      case "recent-pages":
        return <RecentPages />;
      case "stats-cards":
        return <StatsCards />;
      case "today-overview":
        return <TodayOverview />;
      case "recent-activity":
        return <RecentActivity />;
      case "quick-actions":
        return <QuickActions />;
      case "calendar-integration":
        return <CalendarIntegration />;
      default:
        return null;
    }
  };

  // 위젯 크기에 따른 그리드 클래스
  const getWidgetGridClass = (widget: any) => {
    const sizeClass =
      widget.size === "large" ? "xl:col-span-2" : "xl:col-span-1";
    return sizeClass;
  };

  // 전체 위젯 목록 (편집 모드용)
  const fullWidthWidgets = getWidgetsByPosition("full");
  const leftColumnWidgets = getWidgetsByPosition("left");
  const rightColumnWidgets = getWidgetsByPosition("right");

  return (
    <motion.div
      className='space-y-8'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      {/* 위젯 편집 모달 */}
      <WidgetEditorModal
        isOpen={isWidgetEditorOpen}
        onClose={() => setIsWidgetEditorOpen(false)}
      />

      {/* 헤더 섹션 */}
      <motion.div
        className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'
        variants={itemVariants}
      >
        <div className='space-y-2'>
          <motion.div
            className='flex items-center gap-3'
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className='w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <TrendingUp className='w-6 h-6 text-primary-foreground' />
            </motion.div>
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
          </motion.div>

          {/* 날짜 네비게이션 */}
          <motion.div
            className='flex items-center gap-2'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
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
          </motion.div>
        </div>

        <motion.div
          className='flex flex-col sm:flex-row gap-3'
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* 위젯 편집 버튼 */}
          <Button
            variant='outline'
            onClick={() => setIsWidgetEditorOpen(true)}
            className='flex items-center gap-2'
          >
            <Settings className='w-4 h-4' />
            위젯 설정
          </Button>

          <Link href='/daily-report'>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className='flex items-center gap-2 px-6 py-3 h-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg'>
                <Plus className='w-5 h-5' />
                <span className='font-medium'>일일보고 작성</span>
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>

      {/* 전체 너비 위젯들 */}
      {isEditMode ? (
        <Reorder.Group
          axis='y'
          values={fullWidthWidgets}
          onReorder={(newOrder) => {
            newOrder.forEach((widget, index) => {
              updateWidgetOrder(widget.id, index + 1);
            });
          }}
          className='grid grid-cols-1 xl:grid-cols-3 gap-6'
        >
          {fullWidthWidgets.map((widget) => (
            <WidgetWrapper
              key={widget.id}
              widget={widget}
              className={getWidgetGridClass(widget)}
            >
              {renderWidget(widget.id)}
            </WidgetWrapper>
          ))}
        </Reorder.Group>
      ) : (
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
          {fullWidthWidgets.map((widget) => (
            <WidgetWrapper
              key={widget.id}
              widget={widget}
              className={getWidgetGridClass(widget)}
            >
              {renderWidget(widget.id)}
            </WidgetWrapper>
          ))}
        </div>
      )}

      {/* 메인 콘텐츠 그리드 */}
      <motion.div
        className='grid grid-cols-1 xl:grid-cols-3 gap-8'
        variants={itemVariants}
      >
        {/* 왼쪽 컬럼 */}
        <div className='xl:col-span-2'>
          {isEditMode ? (
            <Reorder.Group
              axis='y'
              values={leftColumnWidgets}
              onReorder={(newOrder) => {
                newOrder.forEach((widget, index) => {
                  updateWidgetOrder(widget.id, index + 1);
                });
              }}
              className='grid grid-cols-1 xl:grid-cols-2 gap-8'
            >
              {leftColumnWidgets.map((widget) => (
                <WidgetWrapper
                  key={widget.id}
                  widget={widget}
                  className={getWidgetGridClass(widget)}
                >
                  {renderWidget(widget.id)}
                </WidgetWrapper>
              ))}
            </Reorder.Group>
          ) : (
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
              {leftColumnWidgets.map((widget) => (
                <WidgetWrapper
                  key={widget.id}
                  widget={widget}
                  className={getWidgetGridClass(widget)}
                >
                  {renderWidget(widget.id)}
                </WidgetWrapper>
              ))}
            </div>
          )}
        </div>

        {/* 오른쪽 컬럼 - 사이드바 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          {isEditMode ? (
            <Reorder.Group
              axis='y'
              values={rightColumnWidgets}
              onReorder={(newOrder) => {
                newOrder.forEach((widget, index) => {
                  updateWidgetOrder(widget.id, index + 1);
                });
              }}
              className='space-y-8'
            >
              {rightColumnWidgets.map((widget) => (
                <WidgetWrapper key={widget.id} widget={widget}>
                  {renderWidget(widget.id)}
                </WidgetWrapper>
              ))}
            </Reorder.Group>
          ) : (
            <div className='space-y-8'>
              {rightColumnWidgets.map((widget) => (
                <WidgetWrapper key={widget.id} widget={widget}>
                  {renderWidget(widget.id)}
                </WidgetWrapper>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
