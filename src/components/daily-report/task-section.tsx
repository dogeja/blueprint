"use client";

import { useState } from "react";
import { Plus, Target, CheckCircle } from "lucide-react";
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
import { GoalTree } from "./goal-tree";
import type { Goal } from "@/types";
import { useRef } from "react";
import { MoreVertical, ChevronDown, ChevronUp } from "lucide-react";

export function TaskSection() {
  const { currentReport, addTask, updateTask, deleteTask, setIsAddingTask } =
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
    setIsAddingTask(false); // 업무 추가 상태 해제
  };

  const handleShowAddForm = () => {
    setShowAddForm(true);
    setIsAddingTask(true); // 업무 추가 상태 설정
  };

  const handleCancel = () => {
    resetForm();
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
            onClick={handleShowAddForm}
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
                onClick={handleCancel}
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
            <>
              {/* 미완료 업무 */}
              <div className='space-y-3'>
                {continuousTasks.filter((task) => task.progress_rate < 100)
                  .length === 0 ? (
                  <p className='text-muted-foreground text-sm py-2'>
                    모든 계속업무가 완료되었습니다.
                  </p>
                ) : (
                  continuousTasks
                    .filter((task) => task.progress_rate < 100)
                    .map((task) => (
                      <TaskAccordion
                        key={task.id}
                        task={task}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onProgressUpdate={handleProgressUpdate}
                      />
                    ))
                )}
              </div>
              {/* 완료 업무(접힘) */}
              {continuousTasks.filter((task) => task.progress_rate === 100)
                .length > 0 && (
                <details className='mt-4'>
                  <summary className='cursor-pointer text-sm text-green-600 dark:text-green-400 font-semibold select-none'>
                    완료된 계속업무 (
                    {
                      continuousTasks.filter((t) => t.progress_rate === 100)
                        .length
                    }
                    건)
                  </summary>
                  <div className='space-y-3 mt-2'>
                    {continuousTasks
                      .filter((task) => task.progress_rate === 100)
                      .map((task) => (
                        <TaskAccordion
                          key={task.id}
                          task={task}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onProgressUpdate={handleProgressUpdate}
                        />
                      ))}
                  </div>
                </details>
              )}
            </>
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
            <>
              {/* 미완료 업무 */}
              <div className='space-y-3'>
                {shortTermTasks.filter((task) => task.progress_rate < 100)
                  .length === 0 ? (
                  <p className='text-muted-foreground text-sm py-2'>
                    모든 단기업무가 완료되었습니다.
                  </p>
                ) : (
                  shortTermTasks
                    .filter((task) => task.progress_rate < 100)
                    .map((task) => (
                      <TaskAccordion
                        key={task.id}
                        task={task}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onProgressUpdate={handleProgressUpdate}
                      />
                    ))
                )}
              </div>
              {/* 완료 업무(접힘) */}
              {shortTermTasks.filter((task) => task.progress_rate === 100)
                .length > 0 && (
                <details className='mt-4'>
                  <summary className='cursor-pointer text-sm text-green-600 dark:text-green-400 font-semibold select-none'>
                    완료된 단기업무 (
                    {
                      shortTermTasks.filter((t) => t.progress_rate === 100)
                        .length
                    }
                    건)
                  </summary>
                  <div className='space-y-3 mt-2'>
                    {shortTermTasks
                      .filter((task) => task.progress_rate === 100)
                      .map((task) => (
                        <TaskAccordion
                          key={task.id}
                          task={task}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onProgressUpdate={handleProgressUpdate}
                        />
                      ))}
                  </div>
                </details>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// TaskAccordion: 확장형 업무 카드 컴포넌트 (신규)
function TaskAccordion({
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
  const [open, setOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useUIStore();
  const { goals } = useGoalStore();

  // 목표 경로
  function getGoalPath(goalId: string | null): Goal[] {
    if (!goalId) return [];
    const path: Goal[] = [];
    let current = goals.find((g) => g.id === goalId) || null;
    while (current !== null) {
      path.unshift(current!);
      if (!current!.parent_goal_id) break;
      current = goals.find((g) => g.id === current!.parent_goal_id) || null;
    }
    return path;
  }
  const goalPath = getGoalPath(task.goal_id ?? null);

  // 우선순위 컬러/텍스트
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

  // 진행률 슬라이더
  const [progress, setProgress] = useState(task.progress_rate);
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setProgress(value);
  };
  const handleSliderCommit = () => {
    if (progress === 100 && task.progress_rate !== 100) {
      addNotification({ type: "success", message: "업무가 완료되었습니다!" });
    }
    onProgressUpdate(task.id, progress);
  };

  // 메뉴 외부 클릭 닫기
  // ... (생략: 필요시 useEffect로 구현)

  return (
    <div
      className={`border rounded-lg bg-card min-w-0 mb-3 flex flex-col transition-shadow ${
        progress === 100
          ? "border-green-500 bg-green-50 dark:bg-green-900/10"
          : "border-border"
      }`}
    >
      {/* 상단: 업무명/진행률/상태/메뉴 */}
      <div
        className='flex items-center justify-between gap-2 p-3 cursor-pointer'
        onClick={() => setOpen((v) => !v)}
      >
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 min-w-0'>
            <h4 className='font-bold text-base sm:text-lg truncate'>
              {task.title}
            </h4>
            {progress === 100 && (
              <Badge variant='outline' className='flex items-center gap-1'>
                <CheckCircle className='w-4 h-4' /> 완료
              </Badge>
            )}
          </div>
          <div className='flex items-center gap-2 mt-1'>
            <Badge
              variant='outline'
              className={getPriorityColor(task.priority)}
            >
              {getPriorityText(task.priority)}
            </Badge>
            {task.goal_id && (
              <Badge variant='outline'>
                <Target className='w-3 h-3 mr-1' /> 목표
              </Badge>
            )}
          </div>
        </div>
        <div className='flex items-center gap-1 ml-2'>
          <span className='text-sm text-foreground font-semibold mr-2'>
            {progress}%
          </span>
          {open ? (
            <ChevronUp className='w-5 h-5' />
          ) : (
            <ChevronDown className='w-5 h-5' />
          )}
          <div
            className='relative'
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((v) => !v);
            }}
          >
            <Button variant='ghost' size='icon'>
              <MoreVertical className='w-5 h-5' />
            </Button>
            {showMenu && (
              <div
                ref={menuRef}
                className='absolute right-0 mt-2 w-28 bg-popover border rounded shadow z-10'
              >
                <button
                  className='w-full px-3 py-2 text-left hover:bg-accent'
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(task);
                  }}
                >
                  수정
                </button>
                <button
                  className='w-full px-3 py-2 text-left hover:bg-accent'
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(task.id);
                  }}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 하단: 상세(펼침) */}
      {open && (
        <div className='px-4 pb-4 space-y-3'>
          {/* 목표 경로 */}
          {goalPath.length > 0 && (
            <div className='flex flex-wrap items-center gap-1 text-xs'>
              {goalPath.map((g, idx) => (
                <span
                  key={g.id}
                  className={`px-2 py-0.5 rounded font-semibold ${
                    idx === goalPath.length - 1
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                  title={g.title}
                >
                  {g.title.length > 10 ? g.title.slice(0, 10) + "..." : g.title}
                  {idx < goalPath.length - 1 && <span className='mx-1'>→</span>}
                </span>
              ))}
            </div>
          )}
          {/* 예상시간/설명 */}
          <div className='flex flex-wrap items-center gap-2 text-xs'>
            {task.estimated_time_minutes && (
              <span className='text-muted-foreground'>
                예상 {task.estimated_time_minutes}분
              </span>
            )}
            {task.description && (
              <span className='text-muted-foreground'>{task.description}</span>
            )}
          </div>
          {/* 진행률 슬라이더 */}
          <div className='flex flex-col gap-2 mt-2'>
            <label className='text-sm text-foreground mb-1'>진행률</label>
            <input
              type='range'
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={handleSliderChange}
              onMouseUp={handleSliderCommit}
              onTouchEnd={handleSliderCommit}
              className='w-full accent-primary h-2 rounded-lg'
            />
            <Progress value={progress} className='h-3 sm:h-4' />
          </div>
        </div>
      )}
    </div>
  );
}
