"use client";

import { useMemo } from "react";
import { Target, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { useGoalStore } from "@/lib/stores/goal-store";
import type { Goal, Task } from "@/types";

export function GoalConnectionSection() {
  const { currentReport } = useDailyReportStore();
  const { goals } = useGoalStore();

  // 목표별 목표 그룹화 및 진행률 계산
  const goalConnections = useMemo(() => {
    if (!currentReport?.tasks || !goals.length) return [];

    const connections = goals
      .map((goal) => {
        const connectedTasks = currentReport.tasks.filter(
          (task) => task.goal_id === goal.id
        );

        if (connectedTasks.length === 0) return null;

        const totalTasks = connectedTasks.length;
        const completedTasks = connectedTasks.filter(
          (task) => task.progress_rate === 100
        ).length;
        const inProgressTasks = connectedTasks.filter(
          (task) => task.progress_rate > 0 && task.progress_rate < 100
        ).length;
        const notStartedTasks = connectedTasks.filter(
          (task) => task.progress_rate === 0
        ).length;

        // 전체 진행률 계산 (완료된 목표 비율)
        const overallProgress =
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        return {
          goal,
          tasks: connectedTasks,
          totalTasks,
          completedTasks,
          inProgressTasks,
          notStartedTasks,
          overallProgress,
        };
      })
      .filter(
        (connection): connection is NonNullable<typeof connection> =>
          connection !== null
      );

    return connections;
  }, [currentReport?.tasks, goals]);

  // 목표가 연결된 목표가 있는지 확인
  const hasGoalConnections = goalConnections.length > 0;

  // 목표가 연결되지 않은 목표
  const unconnectedTasks =
    currentReport?.tasks.filter((task) => !task.goal_id) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Target className='w-5 h-5' />
          목표 연결 현황
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='bg-muted/50 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Target className='w-4 h-4 text-primary' />
            <span className='text-sm font-medium'>목표 연결</span>
          </div>
          <p className='text-sm text-muted-foreground'>
            목표 작성 시 목표를 선택하여 진행 상황을 추적하세요
          </p>
        </div>

        {!hasGoalConnections ? (
          <div className='text-center py-6 text-muted-foreground'>
            <Target className='w-8 h-8 mx-auto mb-2 opacity-50' />
            <p>연결된 목표가 없습니다.</p>
            <p className='text-sm'>
              목표를 작성할 때 장기 목표를 선택해보세요.
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {goalConnections.map(
              ({
                goal,
                tasks,
                totalTasks,
                completedTasks,
                inProgressTasks,
                notStartedTasks,
                overallProgress,
              }) => (
                <div key={goal.id} className='p-4 border rounded-lg space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-medium'>{goal.title}</h4>
                      <div className='text-sm text-muted-foreground'>
                        {totalTasks}개 목표
                      </div>
                    </div>
                    <Badge variant='outline'>{goal.type}</Badge>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span>전체 진행률</span>
                      <span className='font-medium'>
                        {overallProgress.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={overallProgress} className='h-2' />
                  </div>

                  {/* 목표 상태 요약 */}
                  <div className='grid grid-cols-3 gap-2 text-xs'>
                    <div className='text-center p-2 bg-green-50 dark:bg-green-950 rounded'>
                      <div className='font-medium text-green-700 dark:text-green-300'>
                        {completedTasks}
                      </div>
                      <div className='text-green-600 dark:text-green-400'>
                        완료
                      </div>
                    </div>
                    <div className='text-center p-2 bg-yellow-50 dark:bg-yellow-950 rounded'>
                      <div className='font-medium text-yellow-700 dark:text-yellow-300'>
                        {inProgressTasks}
                      </div>
                      <div className='text-yellow-600 dark:text-yellow-400'>
                        진행중
                      </div>
                    </div>
                    <div className='text-center p-2 bg-gray-50 dark:bg-gray-950 rounded'>
                      <div className='font-medium text-gray-700 dark:text-gray-300'>
                        {notStartedTasks}
                      </div>
                      <div className='text-gray-600 dark:text-gray-400'>
                        대기
                      </div>
                    </div>
                  </div>

                  <details className='mt-3'>
                    <summary className='cursor-pointer text-sm text-muted-foreground hover:text-foreground'>
                      연결된 목표 보기 ({totalTasks}개)
                    </summary>
                    <div className='mt-2 space-y-1'>
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className='flex items-center justify-between text-sm p-2 bg-muted/30 rounded'
                        >
                          <span className='truncate'>{task.title}</span>
                          <Badge
                            variant={
                              task.progress_rate === 100
                                ? "default"
                                : "secondary"
                            }
                            className='text-xs'
                          >
                            {task.progress_rate}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )
            )}
          </div>
        )}

        {/* 목표가 연결되지 않은 목표 */}
        {unconnectedTasks.length > 0 && (
          <div className='mt-4 p-3 border border-dashed border-border rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <Calendar className='w-4 h-4 text-muted-foreground' />
              <span className='text-sm font-medium'>목표 미연결</span>
              <Badge variant='outline' className='text-xs'>
                {unconnectedTasks.length}개
              </Badge>
            </div>
            <div className='text-xs text-muted-foreground'>
              목표 작성 시 장기 목표를 선택하여 목표 달성에 기여하는 계획으로
              관리하세요
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
