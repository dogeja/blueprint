"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ExternalLink, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGoalStore } from "@/lib/stores/goal-store";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import {
  generateWeeklySchedule,
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  type CalendarEvent,
} from "@/lib/utils/calendar-utils";

export function CalendarIntegration() {
  const { goals } = useGoalStore();
  const { currentReport } = useDailyReportStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // 주간 일정 생성
  const weeklyEvents = generateWeeklySchedule(
    goals.filter((g) => g.status === "active"),
    currentReport ? [currentReport] : [],
    currentReport?.tasks || []
  );

  // 이벤트 타입별 개수
  const eventCounts = {
    goals: weeklyEvents.filter((e) => e.type === "goal").length,
    reports: weeklyEvents.filter((e) => e.type === "daily-report").length,
    tasks: weeklyEvents.filter((e) => e.type === "task").length,
  };

  const handleGoogleCalendar = () => {
    // 첫 번째 이벤트를 Google Calendar에 추가
    if (weeklyEvents.length > 0) {
      const url = generateGoogleCalendarUrl(weeklyEvents[0]);
      window.open(url, "_blank");
    }
  };

  const handleOutlookCalendar = () => {
    // 첫 번째 이벤트를 Outlook Calendar에 추가
    if (weeklyEvents.length > 0) {
      const url = generateOutlookCalendarUrl(weeklyEvents[0]);
      window.open(url, "_blank");
    }
  };

  const handleExportICS = () => {
    // ICS 파일 다운로드 (향후 구현)
    console.log("ICS export 기능은 향후 구현 예정");
  };

  if (weeklyEvents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className='border-dashed border-2 border-muted-foreground/20'>
          <CardContent className='p-6 text-center'>
            <Calendar className='w-8 h-8 text-muted-foreground mx-auto mb-2' />
            <p className='text-sm text-muted-foreground'>
              아직 캘린더에 추가할 일정이 없어요
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              목표나 일일보고를 작성하면 여기에 표시됩니다
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Calendar className='w-5 h-5' />
              캘린더 연동
            </CardTitle>
            <div className='flex gap-2'>
              <Badge variant='secondary' className='text-xs'>
                {weeklyEvents.length}개 일정
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* 일정 요약 */}
          <div className='grid grid-cols-3 gap-2 text-center'>
            <div className='bg-blue-50 rounded-lg p-2'>
              <div className='text-lg font-bold text-blue-600'>
                {eventCounts.goals}
              </div>
              <div className='text-xs text-blue-500'>목표</div>
            </div>
            <div className='bg-green-50 rounded-lg p-2'>
              <div className='text-lg font-bold text-green-600'>
                {eventCounts.reports}
              </div>
              <div className='text-xs text-green-500'>보고</div>
            </div>
            <div className='bg-orange-50 rounded-lg p-2'>
              <div className='text-lg font-bold text-orange-600'>
                {eventCounts.tasks}
              </div>
              <div className='text-xs text-orange-500'>목표</div>
            </div>
          </div>

          {/* 캘린더 연동 버튼들 */}
          <div className='space-y-2'>
            <Button
              onClick={handleGoogleCalendar}
              variant='outline'
              size='sm'
              className='w-full justify-start'
            >
              <ExternalLink className='w-4 h-4 mr-2' />
              Google Calendar에 추가
            </Button>
            <Button
              onClick={handleOutlookCalendar}
              variant='outline'
              size='sm'
              className='w-full justify-start'
            >
              <ExternalLink className='w-4 h-4 mr-2' />
              Outlook Calendar에 추가
            </Button>
            <Button
              onClick={handleExportICS}
              variant='outline'
              size='sm'
              className='w-full justify-start'
            >
              <Download className='w-4 h-4 mr-2' />
              ICS 파일 다운로드
            </Button>
          </div>

          {/* 상세 일정 (접을 수 있음) */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className='space-y-2 pt-2 border-t'
            >
              <h4 className='text-sm font-medium text-muted-foreground'>
                이번 주 일정
              </h4>
              {weeklyEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className='flex items-center gap-2 p-2 bg-muted/50 rounded text-sm'
                >
                  <div
                    className={`
                    w-2 h-2 rounded-full
                    ${
                      event.type === "goal"
                        ? "bg-blue-500"
                        : event.type === "daily-report"
                        ? "bg-green-500"
                        : "bg-orange-500"
                    }
                  `}
                  />
                  <span className='flex-1 truncate'>{event.title}</span>
                  <Badge variant='outline' className='text-xs'>
                    {event.startDate}
                  </Badge>
                </div>
              ))}
              {weeklyEvents.length > 5 && (
                <p className='text-xs text-muted-foreground text-center'>
                  +{weeklyEvents.length - 5}개 더...
                </p>
              )}
            </motion.div>
          )}

          {/* 확장/축소 버튼 */}
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant='ghost'
            size='sm'
            className='w-full text-xs'
          >
            {isExpanded ? "간단히 보기" : "상세 보기"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
