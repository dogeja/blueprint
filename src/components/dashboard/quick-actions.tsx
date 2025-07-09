import React from "react";
import { Plus, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg font-semibold'>빠른 액션</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <Button className='flex items-center gap-2'>
          <Plus className='w-4 h-4' /> 오늘 할 일 추가
        </Button>
        <Button variant='secondary' className='flex items-center gap-2'>
          <Target className='w-4 h-4' /> 목표 생성
        </Button>
      </CardContent>
    </Card>
  );
}
