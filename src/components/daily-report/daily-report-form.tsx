"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Plus, Clock, User, MapPin } from "lucide-react";
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

export function DailyReportForm() {
  const {
    currentReport,
    selectedDate,
    setSelectedDate,
    createOrUpdateReport,
    isSaving,
  } = useDailyReportStore();

  const { addNotification } = useUIStore();

  const [formData, setFormData] = useState({
    report_date: selectedDate,
    condition_score: currentReport?.condition_score || 7,
    yesterday_end_time: currentReport?.yesterday_end_time || "18:00",
    today_start_time: currentReport?.today_start_time || "08:40",
    work_location: currentReport?.work_location || "사무실",
  });

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

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setFormData((prev) => ({ ...prev, report_date: date }));
  };

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
          <div>
            <label className='block text-sm font-medium text-foreground mb-2'>
              보고 날짜
            </label>
            <Input
              type='date'
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className='w-full sm:w-auto'
            />
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

      {/* 전화 통화 섹션 */}
      {currentReport && <PhoneCallSection />}

      {/* 회고 섹션 */}
      {currentReport && <ReflectionSection />}
    </div>
  );
}
