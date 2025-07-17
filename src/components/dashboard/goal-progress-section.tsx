"use client";

import { useMemo } from "react";
import { Target, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGoalStore } from "@/lib/stores/goal-store";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function GoalProgressSection() {
  const { goals } = useGoalStore();
  const { currentReport } = useDailyReportStore();

  // 장기 목표별 진행률 계산
  const goalProgress = useMemo(() => {
    if (!goals.length || !currentReport?.tasks) return [];

    return goals
      .map((goal) => {
        const connectedTasks = currentReport.tasks.filter(
          (task) => task.goal_id === goal.id
        );

        if (connectedTasks.length === 0) return null;

        const totalTasks = connectedTasks.length;
        const completedTasks = connectedTasks.filter(
          (task) => task.progress_rate === 100
        ).length;
        const overallProgress =
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        return {
          goal,
          totalTasks,
          completedTasks,
          overallProgress,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.overallProgress - a.overallProgress); // 진행률 높은 순으로 정렬
  }, [goals, currentReport?.tasks]);

  // 전체 목표 진행률
  const overallGoalProgress = useMemo(() => {
    if (!goalProgress.length) return 0;
    const totalProgress = goalProgress.reduce(
      (sum, item) => sum + item.overallProgress,
      0
    );
    return totalProgress / goalProgress.length;
  }, [goalProgress]);

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <div className='w-1 h-5 bg-gradient-to-b from-orange-500 to-orange-400 rounded-full'></div>
        <h2 className='text-lg font-semibold text-foreground'>
          장기 목표 진행률
        </h2>
      </div>

      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base font-semibold flex items-center gap-2'>
              <Target className='w-4 h-4' />
              전체 목표 달성도
            </CardTitle>
            <Badge variant='outline' className='text-sm'>
              {goalProgress.length}개 목표
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* 전체 진행률 */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span>전체 진행률</span>
              <span className='font-bold text-lg text-primary'>
                {overallGoalProgress.toFixed(0)}%
              </span>
            </div>
            <Progress value={overallGoalProgress} className='h-3' />
          </div>

          {/* 개별 목표 진행률 */}
          {goalProgress.length > 0 ? (
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>
                개별 목표 진행률
              </h4>
              {goalProgress
                .slice(0, 3)
                .map(
                  ({ goal, totalTasks, completedTasks, overallProgress }) => (
                    <div key={goal.id} className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant={
                              goal.type === "yearly" ? "default" : "secondary"
                            }
                            className='text-xs'
                          >
                            {goal.type === "yearly" ? "연간" : "월간"}
                          </Badge>
                          <span className='text-sm font-medium truncate max-w-32'>
                            {goal.title}
                          </span>
                        </div>
                        <span className='text-sm font-semibold text-primary'>
                          {overallProgress.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={overallProgress} className='h-2' />
                      <div className='text-xs text-muted-foreground'>
                        {completedTasks}/{totalTasks}개 완료
                      </div>
                    </div>
                  )
                )}

              {goalProgress.length > 3 && (
                <div className='text-center pt-2'>
                  <Link href='/goals'>
                    <Button variant='outline' size='sm' className='text-xs'>
                      모든 목표 보기 ({goalProgress.length - 3}개 더)
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className='text-center py-6 text-muted-foreground'>
              <Target className='w-8 h-8 mx-auto mb-2 opacity-50' />
              <div className='text-sm'>연결된 장기 목표가 없습니다</div>
              <div className='text-xs mt-1'>
                오늘의 계획에서 목표를 연결해보세요
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
