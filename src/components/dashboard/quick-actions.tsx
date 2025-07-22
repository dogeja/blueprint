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

        {/* 미완성 목표 확인 버튼 */}
        <Button
          variant='outline'
          size='sm'
          onClick={() => setShowIncompleteTasksModal(true)}
          className='flex items-center gap-2'
        >
          <Clock className='w-4 h-4' />
          미완성 목표 확인
        </Button>

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
