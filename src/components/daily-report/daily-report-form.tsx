"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import { ko } from "date-fns/locale";
import { Plus, Clock, User, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TaskSection } from "./task-section";
import { PhoneCallSection } from "./phone-call-section";
import { ReflectionSection } from "./reflection-section";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { formatDate, getConditionEmoji } from "@/lib/utils";
import { GoalConnectionSection } from "./goal-connection-section";

export function DailyReportForm() {
  const {
    currentReport,
    selectedDate,
    safeSetSelectedDate,
    createOrUpdateReport,
    isSaving,
    carriedOverTasks,
    carryOverIncompleteTasks,
  } = useDailyReportStore();

  const { addNotification } = useUIStore();

  const [formData, setFormData] = useState({
    report_date: selectedDate,
    condition_score: currentReport?.condition_score || 7,
    yesterday_end_time: currentReport?.yesterday_end_time || "18:00",
    today_start_time: currentReport?.today_start_time || "08:40",
    work_location: currentReport?.work_location || "사무실",
  });

  // 페이지 로드 시 어제 미완료 업무 확인 (한 번만)
  useEffect(() => {
    const checkIncompleteTasks = async () => {
      const today = format(new Date(), "yyyy-MM-dd");

      // 오늘 날짜일 때만 확인
      if (selectedDate === today) {
        await carryOverIncompleteTasks(today);
      }
    };

    checkIncompleteTasks();
  }, []); // 의존성 배열을 비워서 한 번만 실행

  // 미완료 업무가 있으면 간단한 알림 표시
  useEffect(() => {
    if (carriedOverTasks.length > 0) {
      // 이미 알림이 표시되었는지 확인
      const notificationKey = `carryOverNotification_${format(
        new Date(),
        "yyyy-MM-dd"
      )}`;
      const hasShownNotification = localStorage.getItem(notificationKey);

      if (!hasShownNotification) {
        addNotification({
          type: "info",
          message: `어제 미완료 업무 ${carriedOverTasks.length}개`,
        });
        localStorage.setItem(notificationKey, "true");
      }
    }
  }, [carriedOverTasks, addNotification]);

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
      addNotification({
        type: "success",
        message: "기본 정보가 저장되었습니다.",
      });
    } catch (error) {
      addNotification({
        type: "error",
        message: "저장에 실패했습니다.",
      });
    }
  };

  return (
    <div className='space-y-6'>
      {/* 날짜 선택 및 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className='text-xl font-bold'>일일업무보고</CardTitle>
          <div className='text-sm text-muted-foreground'>
            {formatDate(selectedDate)}
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* 날짜 선택 */}
          <div className='space-y-3'>
            <label className='block text-sm font-medium text-foreground'>
              보고 날짜
            </label>

            {/* 날짜 입력 필드 (메인) */}
            <div className='flex items-center gap-3'>
              <Input
                type='date'
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className='flex-1 max-w-xs'
              />
              <span className='text-sm text-muted-foreground whitespace-nowrap'>
                직접 선택
              </span>
            </div>

            {/* 빠른 날짜 버튼들 (부가기능) */}
            <div className='flex flex-wrap gap-2'>
              <Button
                variant={selectedDate === yesterday ? "secondary" : "outline"}
                size='sm'
                onClick={handleYesterday}
                className='flex items-center gap-1 text-xs'
              >
                <Calendar className='w-3 h-3' />
                어제
              </Button>
              <Button
                variant={selectedDate === today ? "secondary" : "outline"}
                size='sm'
                onClick={handleToday}
                className='flex items-center gap-1 text-xs'
              >
                <Calendar className='w-3 h-3' />
                오늘
              </Button>
              <Button
                variant={selectedDate === tomorrow ? "secondary" : "outline"}
                size='sm'
                onClick={handleTomorrow}
                className='flex items-center gap-1 text-xs'
              >
                <Calendar className='w-3 h-3' />
                내일
              </Button>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* 컨디션 점수 */}
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>
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

      {/* 업무 섹션 */}
      {currentReport && <TaskSection />}

      {/* 목표 연결 섹션 */}
      {currentReport && <GoalConnectionSection />}

      {/* 전화 통화 섹션 */}
      {currentReport && <PhoneCallSection />}

      {/* 회고 섹션 */}
      {currentReport && <ReflectionSection />}
    </div>
  );
}
