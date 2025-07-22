"use client";

import { useState, useRef } from "react";
import { GripVertical, Target, Link, Unlink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  getDragItemStyle,
  getDropZoneStyle,
  getDragAccessibilityProps,
  handleKeyboardDrag,
} from "@/lib/drag-and-drop";
import type { Task, Goal } from "@/types";

interface DraggableTaskProps {
  task: Task;
  index: number;
  goals: Goal[];
  isDragging: boolean;
  isOver: boolean;
  isOverIndex: boolean;
  onDragStart: (e: React.DragEvent, task: Task, index: number) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onProgressUpdate: (taskId: string, progress: number) => void;
  onConnectToGoal: (taskId: string, goalId: string) => void;
  onDisconnectGoal: (taskId: string) => void;
}

export function DraggableTask({
  task,
  index,
  goals,
  isDragging,
  isOver,
  isOverIndex,
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
  onDragLeave,
  onEdit,
  onDelete,
  onProgressUpdate,
  onConnectToGoal,
  onDisconnectGoal,
}: DraggableTaskProps) {
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const taskRef = useRef<HTMLDivElement>(null);

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "text-red-600 dark:text-red-400";
      case 2:
        return "text-orange-600 dark:text-orange-400";
      case 3:
        return "text-yellow-600 dark:text-yellow-400";
      case 4:
        return "text-blue-600 dark:text-blue-400";
      case 5:
        return "text-gray-600 dark:text-gray-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 1:
        return "매우 중요";
      case 2:
        return "중요";
      case 3:
        return "보통";
      case 4:
        return "낮음";
      case 5:
        return "매우 낮음";
      default:
        return "보통";
    }
  };

  const connectedGoal = goals.find((g) => g.id === task.goal_id);

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(e, task, index);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    handleKeyboardDrag(
      e,
      { id: task.id, type: "task", index, data: task },
      () => {
        // 키보드 드래그 시작 로직
      }
    );
  };

  return (
    <>
      {/* 드롭 인디케이터 */}
      {isOverIndex && (
        <div style={getDropZoneStyle(true, true)} className='mb-2' />
      )}

      <Card
        ref={taskRef}
        draggable
        style={getDragItemStyle(isDragging, isOver, isOverIndex)}
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        onDrop={(e) => onDrop(e, index)}
        onDragOver={(e) => onDragOver(e, index)}
        onDragLeave={onDragLeave}
        onKeyDown={handleKeyDown}
        {...getDragAccessibilityProps(isDragging, task.title)}
        className='relative group cursor-grab active:cursor-grabbing'
      >
        <CardContent className='p-4'>
          <div className='flex items-start gap-3'>
            {/* 드래그 핸들 */}
            <div className='flex-shrink-0 mt-1'>
              <GripVertical className='w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity' />
            </div>

            {/* 작업 내용 */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-start justify-between gap-2'>
                <div className='flex-1 min-w-0'>
                  <h4 className='font-medium text-foreground truncate'>
                    {task.title}
                  </h4>

                  {/* 연결된 목표 */}
                  {connectedGoal && (
                    <div className='flex items-center gap-1 mt-1'>
                      <Target className='w-3 h-3 text-primary' />
                      <span className='text-xs text-muted-foreground'>
                        {connectedGoal.title}
                      </span>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-4 w-4 p-0 text-muted-foreground hover:text-destructive'
                        onClick={() => onDisconnectGoal(task.id)}
                      >
                        <Unlink className='w-3 h-3' />
                      </Button>
                    </div>
                  )}

                  {/* 우선순위 */}
                  <div className='flex items-center gap-2 mt-2'>
                    <Badge
                      variant='outline'
                      className={`text-xs ${getPriorityColor(task.priority)}`}
                    >
                      {getPriorityText(task.priority)}
                    </Badge>

                    {task.estimated_time_minutes && (
                      <Badge variant='secondary' className='text-xs'>
                        {task.estimated_time_minutes}분
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 진행률 */}
                <div className='flex-shrink-0 text-right'>
                  <div className='text-sm font-medium text-foreground'>
                    {task.progress_rate}%
                  </div>
                  <Progress
                    value={task.progress_rate}
                    className='w-16 h-2 mt-1'
                  />
                </div>
              </div>

              {/* 상세 설명 */}
              {task.description && (
                <div className='mt-2'>
                  <p className='text-sm text-muted-foreground line-clamp-2'>
                    {task.description}
                  </p>
                </div>
              )}

              {/* 액션 버튼들 */}
              <div className='flex items-center justify-between mt-3'>
                <div className='flex items-center gap-2'>
                  {/* 목표 연결 버튼 */}
                  {!connectedGoal && (
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-7 text-xs'
                      onClick={() => setShowGoalSelector(!showGoalSelector)}
                    >
                      <Link className='w-3 h-3 mr-1' />
                      목표 연결
                    </Button>
                  )}

                  {/* 진행률 슬라이더 */}
                  <input
                    type='range'
                    min='0'
                    max='100'
                    value={task.progress_rate}
                    onChange={(e) =>
                      onProgressUpdate(task.id, parseInt(e.target.value))
                    }
                    className='w-20 h-2 bg-muted rounded-lg appearance-none cursor-pointer'
                  />
                </div>

                <div className='flex items-center gap-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 w-7 p-0'
                    onClick={() => onEdit(task)}
                  >
                    편집
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 w-7 p-0 text-destructive hover:text-destructive'
                    onClick={() => onDelete(task.id)}
                  >
                    삭제
                  </Button>
                </div>
              </div>

              {/* 목표 선택기 */}
              {showGoalSelector && (
                <div className='mt-3 p-3 border border-border rounded-lg bg-muted/50'>
                  <h5 className='text-sm font-medium mb-2'>목표 선택</h5>
                  <div className='space-y-1 max-h-32 overflow-y-auto'>
                    {goals.map((goal) => (
                      <button
                        key={goal.id}
                        className='w-full text-left p-2 text-sm hover:bg-background rounded transition-colors'
                        onClick={() => {
                          onConnectToGoal(task.id, goal.id);
                          setShowGoalSelector(false);
                        }}
                      >
                        <div className='flex items-center gap-2'>
                          <Target className='w-3 h-3 text-primary' />
                          <span>{goal.title}</span>
                          <Badge variant='outline' className='text-xs'>
                            {goal.type}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='mt-2 text-xs'
                    onClick={() => setShowGoalSelector(false)}
                  >
                    취소
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
