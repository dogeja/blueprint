import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { format } from "date-fns";

export function RecentActivity() {
  const { currentReport } = useDailyReportStore();

  // 실제 작업 데이터 사용
  const activities = currentReport?.tasks?.slice(0, 5) || [];

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>최근 활동</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-center py-4'>
            오늘 등록된 작업이 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg font-semibold'>최근 활동</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className='space-y-2'>
          {activities.map((task) => (
            <li
              key={task.id}
              className='flex items-center justify-between border-b border-border pb-1 last:border-b-0'
            >
              <div>
                <span className='font-medium text-foreground'>
                  {task.title}
                </span>
                <span className='ml-2 text-xs text-muted-foreground'>
                  [{task.category}]
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-muted-foreground'>
                  {task.progress_rate}%
                </span>
                {task.actual_time_minutes && (
                  <span className='text-xs text-muted-foreground'>
                    {task.actual_time_minutes}분
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
