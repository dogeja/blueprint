"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { Clock, CheckCircle, X } from "lucide-react";

interface CarryOverNotificationProps {
  onClose: () => void;
}

export function CarryOverNotification({ onClose }: CarryOverNotificationProps) {
  const { carriedOverTasks, executeCarryOver, clearCarriedOverTasks } =
    useDailyReportStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCarryOver = async () => {
    setIsProcessing(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await executeCarryOver(today);
      onClose();
    } catch (error) {
      console.error("Failed to carry over tasks:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    clearCarriedOverTasks();
    onClose();
  };

  if (carriedOverTasks.length === 0) return null;

  return (
    <Card className='border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Clock className='w-5 h-5 text-orange-600 dark:text-orange-400' />
            <CardTitle className='text-lg text-orange-800 dark:text-orange-200'>
              어제 미완료 업무
            </CardTitle>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={onClose}
            className='h-8 w-8 p-0 text-orange-600 hover:text-orange-800'
          >
            <X className='w-4 h-4' />
          </Button>
        </div>
        <p className='text-sm text-orange-700 dark:text-orange-300'>
          {carriedOverTasks.length}개의 업무가 완료되지 않았습니다.
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* 미완료 업무 목록 */}
        <div className='space-y-2 max-h-40 overflow-y-auto'>
          {carriedOverTasks.map((task) => (
            <div
              key={task.id}
              className='flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800'
            >
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>
                  {task.title}
                </p>
                <div className='flex items-center gap-2 mt-1'>
                  <Badge variant='outline' className='text-xs'>
                    {task.category === "continuous" ? "지속업무" : "단기업무"}
                  </Badge>
                  <span className='text-xs text-gray-500 dark:text-gray-400'>
                    진행률: {task.progress_rate}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 액션 버튼 */}
        <div className='flex gap-2'>
          <Button
            onClick={handleCarryOver}
            disabled={isProcessing}
            className='flex-1 bg-orange-600 hover:bg-orange-700 text-white'
          >
            {isProcessing ? (
              "처리중..."
            ) : (
              <>
                <CheckCircle className='w-4 h-4 mr-2' />
                오늘로 넘기기
              </>
            )}
          </Button>
          <Button
            variant='outline'
            onClick={handleSkip}
            disabled={isProcessing}
            className='flex-1'
          >
            건너뛰기
          </Button>
        </div>

        <p className='text-xs text-orange-600 dark:text-orange-400 text-center'>
          넘겨진 업무는 진행률이 0%로 초기화됩니다.
        </p>
      </CardContent>
    </Card>
  );
}
