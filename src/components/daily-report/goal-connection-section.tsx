"use client";

import { useMemo } from "react";
import { Target, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { useGoalStore } from "@/lib/stores/goal-store";
import type { Goal, Task } from "@/types";

export function GoalConnectionSection() {
  const { currentReport } = useDailyReportStore();
  const { goals } = useGoalStore();

  // 목표별 업무 그룹화 및 진행률 계산
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

        // 전체 진행률 계산 (완료된 업무 비율)
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

  // 목표가 연결된 업무가 있는지 확인
  const hasGoalConnections = goalConnections.length > 0;

  // 목표가 연결되지 않은 업무
  const unconnectedTasks =
    currentReport?.tasks.filter((task) => !task.goal_id) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg font-semibold flex items-center gap-2'>
          <Target className='w-5 h-5' />
          목표 연결 현황
        </CardTitle>
        <div className='text-sm text-muted-foreground'>
          이 날의 목표가 어떤 장기 목표와 연결되어 있는지 확인하세요
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {!hasGoalConnections ? (
          <div className='text-center py-6 text-muted-foreground'>
            <Target className='w-8 h-8 mx-auto mb-2 opacity-50' />
            <div className='text-sm'>연결된 목표가 없습니다</div>
            <div className='text-xs mt-1'>
              업무 작성 시 목표를 선택하여 진행 상황을 추적하세요
            </div>
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
                <div
                  key={goal.id}
                  className='p-4 border border-border rounded-lg'
                >
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant={
                          goal.type === "yearly" ? "default" : "secondary"
                        }
                      >
                        {goal.type === "yearly" ? "연간" : "월간"}
                      </Badge>
                      <span className='font-medium'>{goal.title}</span>
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      {totalTasks}개 목표
                    </div>
                  </div>

                  {/* 진행률 바 */}
                  <div className='mb-3'>
                    <div className='flex items-center justify-between text-sm mb-1'>
                      <span>전체 진행률</span>
                      <span className='font-medium'>
                        {overallProgress.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={overallProgress} className='h-2' />
                  </div>

                  {/* 업무 상태 요약 */}
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

                  {/* 연결된 목표 목록 */}
                  <details className='mt-3'>
                    <summary className='cursor-pointer text-sm text-muted-foreground hover:text-foreground'>
                      연결된 목표 보기 ({totalTasks}개)
                    </summary>
                    <div className='mt-2 space-y-1'>
                      {tasks.map((task: Task) => (
                        <div
                          key={task.id}
                          className='flex items-center justify-between text-sm p-2 bg-muted/50 rounded'
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

        {/* 목표가 연결되지 않은 업무 */}
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
