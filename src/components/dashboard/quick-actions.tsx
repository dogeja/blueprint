import React from "react";
import { Plus, Target, Calendar, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg font-semibold'>빠른 액션</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <Link href='/daily-report'>
          <Button className='flex items-center gap-2 w-full'>
            <Plus className='w-4 h-4' /> 오늘 할 일 추가
          </Button>
        </Link>
        <Link href='/goals'>
          <Button
            variant='secondary'
            className='flex items-center gap-2 w-full'
          >
            <Target className='w-4 h-4' /> 목표 생성
          </Button>
        </Link>
        <Link href='/calendar'>
          <Button variant='outline' className='flex items-center gap-2 w-full'>
            <Calendar className='w-4 h-4' /> 캘린더 보기
          </Button>
        </Link>
        <Link href='/settings'>
          <Button variant='ghost' className='flex items-center gap-2 w-full'>
            <Settings className='w-4 h-4' /> 설정
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
