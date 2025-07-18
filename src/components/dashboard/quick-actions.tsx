"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Calendar,
  Target,
  Clock,
  TrendingUp,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";

export function QuickActions() {
  const {
    incompleteContinuousTasks,
    incompleteShortTermTasks,
    setShowIncompleteTasksModal,
  } = useDailyReportStore();

  const totalIncompleteTasks =
    incompleteContinuousTasks.length + incompleteShortTermTasks.length;

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base font-semibold'>빠른 액션</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <Link href='/daily-report'>
          <Button className='w-full justify-start gap-2 h-12'>
            <Plus className='w-4 h-4' />
            오늘의 계획 작성
          </Button>
        </Link>

        {/* 미완성 업무 확인 버튼 */}
        {totalIncompleteTasks > 0 && (
          <Button
            variant='outline'
            className='w-full justify-start gap-2 h-12 border-orange-200 bg-orange-50 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950 dark:hover:bg-orange-900'
            onClick={() => setShowIncompleteTasksModal(true)}
          >
            <Clock className='w-4 h-4 text-orange-600' />
            미완성 업무 확인
            <Badge variant='secondary' className='ml-auto text-xs'>
              {totalIncompleteTasks}개
            </Badge>
          </Button>
        )}

        <Link href='/goals'>
          <Button variant='outline' className='w-full justify-start gap-2 h-12'>
            <Target className='w-4 h-4' />
            목표 관리
          </Button>
        </Link>

        <Link href='/reports'>
          <Button variant='outline' className='w-full justify-start gap-2 h-12'>
            <TrendingUp className='w-4 h-4' />
            보고서 보기
          </Button>
        </Link>

        <Link href='/settings'>
          <Button variant='outline' className='w-full justify-start gap-2 h-12'>
            <Settings className='w-4 h-4' />
            설정
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
