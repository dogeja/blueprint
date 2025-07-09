"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { useGoalStore } from "@/lib/stores/goal-store";
import { useUIStore } from "@/lib/stores/ui-store";
import type { Task } from "@/types";

export function TaskSection() {
  const { currentReport, addTask, updateTask, deleteTask } =
    useDailyReportStore();
  const { goals } = useGoalStore();
  const { addNotification } = useUIStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    category: "short_term" as "continuous" | "short_term",
    description: "",
    estimated_time_minutes: "",
    priority: 3,
    goal_id: "",
  });

  const resetForm = () => {
    setTaskForm({
      title: "",
      category: "short_term",
      description: "",
      estimated_time_minutes: "",
      priority: 3,
      goal_id: "",
    });
    setEditingTask(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const taskData = {
        ...taskForm,
        estimated_time_minutes: taskForm.estimated_time_minutes
          ? parseInt(taskForm.estimated_time_minutes)
          : null,
        goal_id: taskForm.goal_id || null,
      };

      if (editingTask) {
        await updateTask(editingTask.id, taskData);
        addNotification({
          type: "success",
          message: "업무가 수정되었습니다.",
        });
      } else {
        await addTask(taskData);
        addNotification({
          type: "success",
          message: "업무가 추가되었습니다.",
        });
      }

      resetForm();
    } catch (error) {
      addNotification({
        type: "error",
        message: "업무 저장에 실패했습니다.",
      });
    }
  };

  const handleEdit = (task: Task) => {
    setTaskForm({
      title: task.title,
      category: task.category,
      description: task.description || "",
      estimated_time_minutes: task.estimated_time_minutes?.toString() || "",
      priority: task.priority,
      goal_id: task.goal_id || "",
    });
    setEditingTask(task);
    setShowAddForm(true);
  };

  const handleDelete = async (taskId: string) => {
    if (confirm("이 업무를 삭제하시겠습니까?")) {
      try {
        await deleteTask(taskId);
        addNotification({
          type: "success",
          message: "업무가 삭제되었습니다.",
        });
      } catch (error) {
        addNotification({
          type: "error",
          message: "업무 삭제에 실패했습니다.",
        });
      }
    }
  };

  const handleProgressUpdate = async (taskId: string, progress: number) => {
    try {
      await updateTask(taskId, { progress_rate: progress });
    } catch (error) {
      addNotification({
        type: "error",
        message: "진행률 업데이트에 실패했습니다.",
      });
    }
  };

  const continuousTasks =
    currentReport?.tasks.filter((t) => t.category === "continuous") || [];
  const shortTermTasks =
    currentReport?.tasks.filter((t) => t.category === "short_term") || [];

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>금일업무사항</CardTitle>
          <Button
            onClick={() => setShowAddForm(true)}
            size='sm'
            className='flex items-center gap-2'
          >
            <Plus className='w-4 h-4' />
            업무 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* 업무 추가/편집 폼 */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className='p-4 border border-border rounded-lg bg-muted/50 space-y-4'
          >
            <div className='flex items-center justify-between'>
              <h3 className='font-medium text-foreground'>
                {editingTask ? "업무 수정" : "새 업무 추가"}
              </h3>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={resetForm}
              >
                취소
              </Button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-foreground mb-1'>
                  업무명
                </label>
                <Input
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder='업무명을 입력하세요'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-1'>
                  분류
                </label>
                <Select
                  value={taskForm.category}
                  onChange={(e) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      category: e.target.value as "continuous" | "short_term",
                    }))
                  }
                >
                  <option value='continuous'>계속업무</option>
                  <option value='short_term'>단기업무</option>
                </Select>
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-1'>
                  예상 소요시간 (분)
                </label>
                <Input
                  type='number'
                  value={taskForm.estimated_time_minutes}
                  onChange={(e) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      estimated_time_minutes: e.target.value,
                    }))
                  }
                  placeholder='예상 시간'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-1'>
                  우선순위
                </label>
                <Select
                  value={taskForm.priority.toString()}
                  onChange={(e) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      priority: parseInt(e.target.value),
                    }))
                  }
                >
                  <option value='1'>1 (매우 높음)</option>
                  <option value='2'>2 (높음)</option>
                  <option value='3'>3 (보통)</option>
                  <option value='4'>4 (낮음)</option>
                  <option value='5'>5 (매우 낮음)</option>
                </Select>
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-foreground mb-1'>
                  연결된 목표
                </label>
                <Select
                  value={taskForm.goal_id}
                  onChange={(e) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      goal_id: e.target.value,
                    }))
                  }
                >
                  <option value=''>목표 선택 (선택사항)</option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title} ({goal.type})
                    </option>
                  ))}
                </Select>
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-foreground mb-1'>
                  상세 설명
                </label>
                <Textarea
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder='업무 상세 설명'
                  rows={3}
                />
              </div>
            </div>

            <Button type='submit' className='w-full'>
              {editingTask ? "수정 완료" : "업무 추가"}
            </Button>
          </form>
        )}

        {/* 계속업무 */}
        <div>
          <h3 className='font-medium text-lg mb-3 flex items-center gap-2'>
            <Badge variant='secondary'>계속업무</Badge>
            <span className='text-sm text-muted-foreground'>
              ({continuousTasks.length}건)
            </span>
          </h3>

          {continuousTasks.length === 0 ? (
            <p className='text-muted-foreground text-sm py-4'>
              등록된 계속업무가 없습니다.
            </p>
          ) : (
            <div className='space-y-3'>
              {continuousTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onProgressUpdate={handleProgressUpdate}
                />
              ))}
            </div>
          )}
        </div>

        {/* 단기업무 */}
        <div>
          <h3 className='font-medium text-lg mb-3 flex items-center gap-2'>
            <Badge variant='outline'>단기업무</Badge>
            <span className='text-sm text-muted-foreground'>
              ({shortTermTasks.length}건)
            </span>
          </h3>

          {shortTermTasks.length === 0 ? (
            <p className='text-muted-foreground text-sm py-4'>
              등록된 단기업무가 없습니다.
            </p>
          ) : (
            <div className='space-y-3'>
              {shortTermTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onProgressUpdate={handleProgressUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 개별 업무 카드 컴포넌트
function TaskCard({
  task,
  onEdit,
  onDelete,
  onProgressUpdate,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onProgressUpdate: (taskId: string, progress: number) => void;
}) {
  const getPriorityColor = (priority: number) => {
    if (priority <= 2)
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    if (priority === 3)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
  };

  const getPriorityText = (priority: number) => {
    const texts = {
      1: "매우높음",
      2: "높음",
      3: "보통",
      4: "낮음",
      5: "매우낮음",
    };
    return texts[priority as keyof typeof texts] || "보통";
  };

  return (
    <div className='p-4 border border-border rounded-lg bg-card hover:shadow-sm transition-shadow'>
      <div className='flex items-start justify-between mb-2'>
        <div className='flex-1'>
          <h4 className='font-medium text-foreground'>{task.title}</h4>
          {task.description && (
            <p className='text-sm text-muted-foreground mt-1'>
              {task.description}
            </p>
          )}
        </div>
        <div className='flex items-center gap-2 ml-4'>
          <Button variant='ghost' size='sm' onClick={() => onEdit(task)}>
            <Edit2 className='w-4 h-4' />
          </Button>
          <Button variant='ghost' size='sm' onClick={() => onDelete(task.id)}>
            <Trash2 className='w-4 h-4' />
          </Button>
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-2 mb-3'>
        <Badge variant='outline' className={getPriorityColor(task.priority)}>
          {getPriorityText(task.priority)}
        </Badge>

        {task.estimated_time_minutes && (
          <Badge variant='outline'>예상 {task.estimated_time_minutes}분</Badge>
        )}

        {task.goal_id && (
          <Badge variant='outline'>
            <Target className='w-3 h-3 mr-1' />
            목표 연결됨
          </Badge>
        )}
      </div>

      <div className='space-y-2'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-foreground'>진행률</span>
          <span className='text-foreground'>{task.progress_rate}%</span>
        </div>
        <Progress value={task.progress_rate} className='h-2' />
        <div className='flex gap-2'>
          {[0, 25, 50, 75, 100].map((progress) => (
            <Button
              key={progress}
              variant='outline'
              size='sm'
              onClick={() => onProgressUpdate(task.id, progress)}
              className={`text-xs ${
                task.progress_rate === progress ? "bg-primary/10" : ""
              }`}
            >
              {progress}%
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
