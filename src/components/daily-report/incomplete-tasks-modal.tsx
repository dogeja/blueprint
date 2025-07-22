"use client";

import { useState } from "react";
import { X, Clock, Target, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { Task } from "@/types";

interface IncompleteTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IncompleteTasksModal() {
  const {
    incompleteContinuousTasks,
    incompleteShortTermTasks,
    showIncompleteTasksModal,
    setShowIncompleteTasksModal,
    addIncompleteTasksToToday,
  } = useDailyReportStore();

  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  // 미완성 목표가 없으면 모달을 표시하지 않음
  const hasIncompleteTasks =
    incompleteContinuousTasks.length > 0 || incompleteShortTermTasks.length > 0;

  if (!showIncompleteTasksModal || !hasIncompleteTasks) {
    return null;
  }

  const handleTaskToggle = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = () => {
    const allTaskIds = [
      ...incompleteContinuousTasks.map((t) => t.id),
      ...incompleteShortTermTasks.map((t) => t.id),
    ];
    setSelectedTasks(new Set(allTaskIds));
  };

  const handleDeselectAll = () => {
    setSelectedTasks(new Set());
  };

  const handleMoveToToday = async () => {
    if (selectedTasks.size === 0) return;

    try {
      await addIncompleteTasksToToday(Array.from(selectedTasks));
      setSelectedTasks(new Set());
    } catch (error) {
      console.error("Failed to move incomplete tasks:", error);
    }
  };

  const handleClose = () => {
    setShowIncompleteTasksModal(false);
    setSelectedTasks(new Set());
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden'>
        <div className='p-6 border-b'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-semibold'>미완성 목표</h2>
              <p className='text-sm text-muted-foreground mt-1'>
                이전 날짜에 완료하지 못한 목표들을 오늘의 계획으로 이동하세요
              </p>
            </div>
            <Button variant='ghost' size='sm' onClick={handleClose}>
              <X className='w-4 h-4' />
            </Button>
          </div>
        </div>

        <div className='p-6 overflow-y-auto max-h-[60vh]'>
          {/* 선택 도구 */}
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleSelectAll}
                disabled={
                  selectedTasks.size ===
                  incompleteContinuousTasks.length +
                    incompleteShortTermTasks.length
                }
              >
                전체 선택
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={handleDeselectAll}
                disabled={selectedTasks.size === 0}
              >
                전체 해제
              </Button>
            </div>
            <span className='text-sm text-muted-foreground'>
              {selectedTasks.size}개 선택됨
            </span>
          </div>

          {/* 지속적 목표 */}
          {incompleteContinuousTasks.length > 0 && (
            <div className='mb-6'>
              <h3 className='font-medium text-lg mb-3 flex items-center gap-2'>
                <Badge variant='secondary'>지속적 목표</Badge>
                <span className='text-sm text-muted-foreground'>
                  ({incompleteContinuousTasks.length}건)
                </span>
              </h3>
              <div className='space-y-2'>
                {incompleteContinuousTasks.map((task) => (
                  <div
                    key={task.id}
                    className='flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50'
                  >
                    <input
                      type='checkbox'
                      checked={selectedTasks.has(task.id)}
                      onChange={() => handleTaskToggle(task.id)}
                      className='rounded'
                    />
                    <div className='flex-1 min-w-0'>
                      <h4 className='font-medium truncate'>{task.title}</h4>
                      <div className='flex items-center gap-2 mt-1'>
                        <Badge variant='outline' className='text-xs'>
                          {task.category === "continuous"
                            ? "지속목표"
                            : "단기목표"}
                        </Badge>
                        <span className='text-xs text-muted-foreground'>
                          진행률: {task.progress_rate}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 단기 목표 */}
          {incompleteShortTermTasks.length > 0 && (
            <div className='mb-6'>
              <h3 className='font-medium text-lg mb-3 flex items-center gap-2'>
                <Badge variant='secondary'>단기 목표</Badge>
                <span className='text-sm text-muted-foreground'>
                  ({incompleteShortTermTasks.length}건)
                </span>
              </h3>
              <div className='space-y-2'>
                {incompleteShortTermTasks.map((task) => (
                  <div
                    key={task.id}
                    className='flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50'
                  >
                    <input
                      type='checkbox'
                      checked={selectedTasks.has(task.id)}
                      onChange={() => handleTaskToggle(task.id)}
                      className='rounded'
                    />
                    <div className='flex-1 min-w-0'>
                      <h4 className='font-medium truncate'>{task.title}</h4>
                      <div className='flex items-center gap-2 mt-1'>
                        <Badge variant='outline' className='text-xs'>
                          {task.category === "continuous"
                            ? "지속목표"
                            : "단기목표"}
                        </Badge>
                        <span className='text-xs text-muted-foreground'>
                          진행률: {task.progress_rate}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='p-6 border-t bg-muted/30'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>
              선택한 {selectedTasks.size}개의 목표를 오늘의 계획으로 이동합니다
            </p>
            <div className='flex gap-2'>
              <Button variant='outline' onClick={handleClose}>
                취소
              </Button>
              <Button
                onClick={handleMoveToToday}
                disabled={selectedTasks.size === 0}
              >
                선택한 목표 이동
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onToggle: () => void;
}

function TaskCard({ task, isSelected, onToggle }: TaskCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
      onClick={onToggle}
    >
      <CardContent className='p-4'>
        <div className='flex items-start gap-3'>
          <div className='flex-shrink-0 mt-1'>
            <input
              type='checkbox'
              checked={isSelected}
              onChange={onToggle}
              className='w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary'
            />
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-2'>
              <h4 className='font-medium text-sm truncate'>{task.title}</h4>
              <Badge
                variant={
                  task.category === "continuous" ? "default" : "secondary"
                }
                className='text-xs'
              >
                {task.category === "continuous" ? "지속적" : "단기"}
              </Badge>
            </div>

            {task.description && (
              <p className='text-sm text-muted-foreground mb-2 line-clamp-2'>
                {task.description}
              </p>
            )}

            <div className='space-y-2'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-muted-foreground'>진행률</span>
                <span className='font-medium'>{task.progress_rate}%</span>
              </div>
              <Progress value={task.progress_rate} className='h-2' />
            </div>

            {task.estimated_time_minutes && (
              <div className='flex items-center gap-1 mt-2 text-xs text-muted-foreground'>
                <Clock className='w-3 h-3' />
                <span>예상 {task.estimated_time_minutes}분</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
