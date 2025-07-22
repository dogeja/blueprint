"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import { ko } from "date-fns/locale";
import { Plus, Clock, User, MapPin, Calendar, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TaskSection } from "./task-section";
import { PhoneCallSection } from "./phone-call-section";
import { ReflectionSection } from "./reflection-section";
import { ErrorDisplay } from "@/components/ui/error-display";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { formatDate, getConditionEmoji } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

export function DailyReportForm() {
  const {
    currentReport,
    selectedDate,
    safeSetSelectedDate,
    createOrUpdateReport,
    isSaving,
    carriedOverTasks,
    carryOverIncompleteTasks,
    currentError,
    isRetrying,
    retryCount,
    retryLastOperation,
    clearError,
  } = useDailyReportStore();

  const [formData, setFormData] = useState({
    report_date: selectedDate,
    condition_score: currentReport?.condition_score || 7,
    yesterday_end_time: currentReport?.yesterday_end_time || "18:00",
    today_start_time: currentReport?.today_start_time || "08:40",
    work_location: currentReport?.work_location || "사무실",
  });

  // 페이지 로드 시 어제 미완료 목표 확인 (한 번만)
  useEffect(() => {
    const checkIncompleteTasks = async () => {
      try {
        await carryOverIncompleteTasks(selectedDate);
      } catch (error) {
        console.error("Failed to check incomplete tasks:", error);
      }
    };

    checkIncompleteTasks();
  }, []);

  // 미완료 목표가 있으면 간단한 알림 표시
  useEffect(() => {
    if (carriedOverTasks.length > 0) {
      toast.info(`어제 미완료 목표 ${carriedOverTasks.length}개`);
    }
  }, [carriedOverTasks]);

  useEffect(() => {
    if (currentReport) {
      setFormData({
        report_date: currentReport.report_date,
        condition_score: currentReport.condition_score || 7,
        yesterday_end_time: currentReport.yesterday_end_time || "18:00",
        today_start_time: currentReport.today_start_time || "08:40",
        work_location: currentReport.work_location || "사무실",
      });
    }
  }, [currentReport]);

  const handleDateChange = async (date: string) => {
    const success = await safeSetSelectedDate(date);
    if (success) {
      setFormData((prev) => ({ ...prev, report_date: date }));
    }
  };

  // 날짜 버튼 핸들러들
  const handleToday = async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    await handleDateChange(today);
  };

  const handleYesterday = async () => {
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    await handleDateChange(yesterday);
  };

  const handleTomorrow = async () => {
    const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
    await handleDateChange(tomorrow);
  };

  // 현재 선택된 날짜 확인
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const handleSaveBasicInfo = async () => {
    try {
      await createOrUpdateReport(formData);
      toast.success("기본 정보가 저장되었습니다.");
    } catch (error) {
      toast.error("저장에 실패했습니다.");
    }
  };

  return (
    <div className='space-y-6'>
      {/* 에러 표시 */}
      {currentError && (
        <ErrorDisplay
          error={currentError}
          onRetry={retryLastOperation}
          onDismiss={clearError}
          showDetails={false}
        />
      )}

      {/* 재시도 중 로딩 표시 */}
      {isRetrying && (
        <Card className='border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
              <div>
                <h4 className='font-semibold text-blue-800 dark:text-blue-200'>
                  재시도 중...
                </h4>
                <p className='text-sm text-blue-700 dark:text-blue-300'>
                  {retryCount}번째 시도 중입니다. 잠시만 기다려주세요.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 날짜 선택 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>날짜 선택</CardTitle>
          <div className='text-sm text-muted-foreground'>
            보고서를 작성할 날짜를 선택하세요
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-2'>
            <Button
              variant='outline'
              onClick={handleYesterday}
              className='flex items-center gap-2'
            >
              <Calendar className='w-4 h-4' />
              어제
            </Button>
            <Button
              variant='default'
              onClick={handleToday}
              className='flex items-center gap-2'
            >
              <Calendar className='w-4 h-4' />
              오늘
            </Button>
            <Button
              variant='outline'
              onClick={handleTomorrow}
              className='flex items-center gap-2'
            >
              <Calendar className='w-4 h-4' />
              내일
            </Button>
          </div>
          <div className='mt-4 text-sm text-muted-foreground'>
            선택된 날짜: {formatDate(selectedDate)}
          </div>
        </CardContent>
      </Card>

      {/* 기본 정보 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>기본 정보</CardTitle>
          <div className='text-sm text-muted-foreground'>
            컨디션, 근무 시간, 장소 등을 기록하세요
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* 컨디션 점수 */}
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>
                <User className='w-4 h-4 inline mr-1' />
                컨디션 점수 {getConditionEmoji(formData.condition_score)}
              </label>
              <Select
                value={formData.condition_score.toString()}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    condition_score: parseInt(e.target.value),
                  }))
                }
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                  <option key={score} value={score}>
                    {score}점 {getConditionEmoji(score)}
                  </option>
                ))}
              </Select>
            </div>

            {/* 전일 퇴근시간 */}
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>
                <Clock className='w-4 h-4 inline mr-1' />
                전일 퇴근시간
              </label>
              <Input
                type='time'
                value={formData.yesterday_end_time}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    yesterday_end_time: e.target.value,
                  }))
                }
              />
            </div>

            {/* 금일 출근시간 */}
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>
                <Clock className='w-4 h-4 inline mr-1' />
                금일 출근시간
              </label>
              <Input
                type='time'
                value={formData.today_start_time}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    today_start_time: e.target.value,
                  }))
                }
              />
            </div>

            {/* 근무 장소 */}
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>
                <MapPin className='w-4 h-4 inline mr-1' />
                근무 장소
              </label>
              <Input
                value={formData.work_location}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    work_location: e.target.value,
                  }))
                }
                placeholder='근무 장소'
              />
            </div>
          </div>

          <Button
            onClick={handleSaveBasicInfo}
            disabled={isSaving}
            className='w-full sm:w-auto'
          >
            {isSaving ? "저장 중..." : "기본 정보 저장"}
          </Button>
        </CardContent>
      </Card>

      {/* 목표 섹션 */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold'>오늘의 목표</h3>
            <p className='text-sm text-muted-foreground'>
              이 날의 목표가 어떤 장기 목표와 연결되는지 확인하세요
            </p>
          </div>
        </div>

        <div className='bg-muted/50 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Target className='w-4 h-4 text-primary' />
            <span className='text-sm font-medium'>목표 연결</span>
          </div>
          <p className='text-sm text-muted-foreground'>
            목표 작성 시 목표를 선택하여 진행 상황을 추적할 수 있습니다
          </p>
        </div>

        <TaskSection />
      </div>

      {/* 목표 연결 섹션 (향후 구현) */}
      {currentReport && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg font-semibold'>목표 연결</CardTitle>
            <div className='text-sm text-muted-foreground'>
              이 날의 업무가 어떤 장기 목표와 연결되는지 확인하세요
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8 text-muted-foreground'>
              <div className='text-sm'>
                🎯 장기 목표와의 연결 기능이 준비 중입니다
              </div>
              <div className='text-xs mt-2'>
                업무 작성 시 목표를 선택하여 진행 상황을 추적할 수 있습니다
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 전화 통화 섹션 */}
      {currentReport && <PhoneCallSection />}

      {/* 회고 섹션 */}
      {currentReport && <ReflectionSection />}
    </div>
  );
}
