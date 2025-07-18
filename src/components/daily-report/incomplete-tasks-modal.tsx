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

export function IncompleteTasksModal({
  isOpen,
  onClose,
}: IncompleteTasksModalProps) {
  const {
    incompleteContinuousTasks,
    incompleteShortTermTasks,
    addIncompleteTasksToToday,
  } = useDailyReportStore();

  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  const allTasks = [...incompleteContinuousTasks, ...incompleteShortTermTasks];
  const hasIncompleteTasks = allTasks.length > 0;

  // 미완성 업무가 없으면 모달을 표시하지 않음
  if (!isOpen || !hasIncompleteTasks) return null;

  const handleTaskToggle = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = (tasks: Task[]) => {
    const allTaskIds = tasks.map((task) => task.id);
    setSelectedTasks(new Set(allTaskIds));
  };

  const handleDeselectAll = () => {
    setSelectedTasks(new Set());
  };

  const handleAddSelected = async () => {
    if (selectedTasks.size === 0) return;

    try {
      await addIncompleteTasksToToday(Array.from(selectedTasks));
      setSelectedTasks(new Set());
      onClose();
    } catch (error) {
      console.error("Failed to add incomplete tasks:", error);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-background rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden'>
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center'>
              <Clock className='w-5 h-5 text-white' />
            </div>
            <div>
              <h2 className='text-xl font-semibold'>미완성 업무</h2>
              <p className='text-sm text-muted-foreground'>
                이전 날짜에 완료하지 못한 업무들을 오늘의 계획으로 이동하세요
              </p>
            </div>
          </div>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='w-4 h-4' />
          </Button>
        </div>

        <div className='p-6 overflow-y-auto max-h-[60vh]'>
          <div className='space-y-6'>
            {/* 선택 액션 */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>
                  {selectedTasks.size}개 선택됨
                </span>
                {selectedTasks.size > 0 && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleDeselectAll}
                  >
                    선택 해제
                  </Button>
                )}
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleSelectAll(incompleteContinuousTasks)}
                  disabled={incompleteContinuousTasks.length === 0}
                >
                  지속적 목표 전체 선택
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleSelectAll(incompleteShortTermTasks)}
                  disabled={incompleteShortTermTasks.length === 0}
                >
                  단기 목표 전체 선택
                </Button>
              </div>
            </div>

            {/* 지속적 목표 섹션 */}
            {incompleteContinuousTasks.length > 0 && (
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Target className='w-4 h-4 text-blue-500' />
                  <h3 className='font-semibold'>지속적 목표</h3>
                  <Badge variant='secondary' className='text-xs'>
                    {incompleteContinuousTasks.length}개
                  </Badge>
                </div>
                <div className='space-y-2'>
                  {incompleteContinuousTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isSelected={selectedTasks.has(task.id)}
                      onToggle={() => handleTaskToggle(task.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 단기 목표 섹션 */}
            {incompleteShortTermTasks.length > 0 && (
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Clock className='w-4 h-4 text-green-500' />
                  <h3 className='font-semibold'>단기 목표</h3>
                  <Badge variant='secondary' className='text-xs'>
                    {incompleteShortTermTasks.length}개
                  </Badge>
                </div>
                <div className='space-y-2'>
                  {incompleteShortTermTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isSelected={selectedTasks.has(task.id)}
                      onToggle={() => handleTaskToggle(task.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='flex items-center justify-between p-6 border-t bg-muted/50'>
          <div className='text-sm text-muted-foreground'>
            선택한 {selectedTasks.size}개의 업무를 오늘의 계획으로 이동합니다
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={onClose}>
              취소
            </Button>
            <Button
              onClick={handleAddSelected}
              disabled={selectedTasks.size === 0}
              className='flex items-center gap-2'
            >
              <ArrowRight className='w-4 h-4' />
              선택한 업무 이동
            </Button>
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
