"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { Clock, CheckCircle, X } from "lucide-react";
import { format } from "date-fns";

interface CarryOverNotificationProps {
  onClose: () => void;
}

export function CarryOverNotification() {
  const { carriedOverTasks, executeCarryOver, clearCarriedOverTasks } =
    useDailyReportStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCarryOver = async () => {
    setIsProcessing(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      await executeCarryOver(today);
    } catch (error) {
      console.error("Failed to carry over tasks:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    clearCarriedOverTasks();
  };

  if (carriedOverTasks.length === 0) return null;

  return (
    <div className='bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6'>
      <div className='flex items-start gap-3'>
        <div className='flex-shrink-0'>
          <div className='w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center'>
            <Clock className='w-5 h-5 text-white' />
          </div>
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-2'>
            <h3 className='font-semibold text-foreground'>어제 미완료 목표</h3>
            <Badge
              variant='outline'
              className='text-orange-600 dark:text-orange-400'
            >
              {carriedOverTasks.length}개
            </Badge>
          </div>

          <p className='text-sm text-muted-foreground mb-3'>
            {carriedOverTasks.length}개의 목표가 완료되지 않았습니다.
          </p>

          {/* 미완료 목표 목록 */}
          <div className='space-y-2 mb-4'>
            {carriedOverTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className='flex items-center gap-2 text-sm bg-white dark:bg-gray-800 rounded px-3 py-2'
              >
                <div className='w-2 h-2 bg-orange-400 rounded-full flex-shrink-0' />
                <span className='truncate'>{task.title}</span>
                <Badge variant='outline' className='text-xs ml-auto'>
                  {task.category === "continuous" ? "지속목표" : "단기목표"}
                </Badge>
              </div>
            ))}
            {carriedOverTasks.length > 3 && (
              <div className='text-xs text-muted-foreground text-center'>
                외 {carriedOverTasks.length - 3}개 더...
              </div>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <Button
              onClick={handleCarryOver}
              size='sm'
              className='bg-orange-500 hover:bg-orange-600 text-white'
            >
              오늘로 이동
            </Button>
            <Button variant='outline' size='sm' onClick={handleSkip}>
              건너뛰기
            </Button>
          </div>

          <p className='text-xs text-muted-foreground mt-2'>
            넘겨진 목표는 진행률이 0%로 초기화됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
