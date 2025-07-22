"use client";

import { useEffect, useState } from "react";
import { Plus, Target, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useGoalStore } from "@/lib/stores/goal-store";
import type { Goal } from "@/types";
import { toast } from "@/components/ui/toast";

export default function GoalsPage() {
  const {
    goals,
    yearlyGoals,
    monthlyGoals,
    weeklyGoals,
    loadGoals,
    createGoal,
    updateGoal,
    deleteGoal,
  } = useGoalStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    type: "monthly" as "yearly" | "monthly" | "weekly" | "daily",
    target_date: "",
    parent_goal_id: "",
  });

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const resetForm = () => {
    setGoalForm({
      title: "",
      description: "",
      type: "monthly",
      target_date: "",
      parent_goal_id: "",
    });
    setEditingGoal(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const goalData = {
        ...goalForm,
        target_date: goalForm.target_date || null,
        parent_goal_id: goalForm.parent_goal_id || null,
      };

      if (editingGoal) {
        await updateGoal(editingGoal.id, goalData);
        toast.success("목표가 수정되었습니다.");
      } else {
        await createGoal(goalData);
        toast.success("목표가 추가되었습니다.");
      }

      resetForm();
    } catch (error) {
      toast.error("목표 저장에 실패했습니다.");
    }
  };

  const handleEdit = (goal: Goal) => {
    setGoalForm({
      title: goal.title,
      description: goal.description || "",
      type: goal.type,
      target_date: goal.target_date || "",
      parent_goal_id: goal.parent_goal_id || "",
    });
    setEditingGoal(goal);
    setShowAddForm(true);
  };

  const handleDelete = async (goalId: string) => {
    if (confirm("이 목표를 삭제하시겠습니까?")) {
      try {
        await deleteGoal(goalId);
        toast.success("목표가 삭제되었습니다.");
      } catch (error) {
        toast.error("목표 삭제에 실패했습니다.");
      }
    }
  };

  const handleProgressUpdate = async (goalId: string, progress: number) => {
    try {
      await updateGoal(goalId, { progress_rate: progress });
      toast.success("진행률이 업데이트되었습니다.");
    } catch (error) {
      toast.error("진행률 업데이트에 실패했습니다.");
    }
  };

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>목표 관리</h1>
          <p className='text-gray-600'>
            장기 목표부터 일일 목표까지 체계적으로 관리하세요
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className='flex items-center gap-2'
        >
          <Plus className='w-4 h-4' />
          목표 추가
        </Button>
      </div>

      {/* 목표 추가/편집 폼 */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingGoal ? "목표 수정" : "새 목표 추가"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    목표명
                  </label>
                  <Input
                    value={goalForm.title}
                    onChange={(e) =>
                      setGoalForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder='목표명을 입력하세요'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>
                    목표 유형
                  </label>
                  <Select
                    value={goalForm.type}
                    onChange={(e) =>
                      setGoalForm((prev) => ({
                        ...prev,
                        type: e.target.value as
                          | "yearly"
                          | "monthly"
                          | "weekly"
                          | "daily",
                      }))
                    }
                  >
                    <option value='yearly'>연간 목표</option>
                    <option value='monthly'>월간 목표</option>
                    <option value='weekly'>주간 목표</option>
                    <option value='daily'>일일 목표</option>
                  </Select>
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>
                    목표 날짜
                  </label>
                  <Input
                    type='date'
                    value={goalForm.target_date}
                    onChange={(e) =>
                      setGoalForm((prev) => ({
                        ...prev,
                        target_date: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>
                    상위 목표
                  </label>
                  <Select
                    value={goalForm.parent_goal_id}
                    onChange={(e) =>
                      setGoalForm((prev) => ({
                        ...prev,
                        parent_goal_id: e.target.value,
                      }))
                    }
                  >
                    <option value=''>상위 목표 선택 (선택사항)</option>
                    {goals
                      .filter(
                        (g) =>
                          g.type !== goalForm.type && g.id !== editingGoal?.id
                      )
                      .map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.title} ({goal.type})
                        </option>
                      ))}
                  </Select>
                </div>

                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium mb-1'>
                    상세 설명
                  </label>
                  <Textarea
                    value={goalForm.description}
                    onChange={(e) =>
                      setGoalForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder='목표에 대한 상세 설명'
                    rows={3}
                  />
                </div>
              </div>

              <div className='flex gap-2'>
                <Button type='submit'>
                  {editingGoal ? "수정 완료" : "목표 추가"}
                </Button>
                <Button type='button' variant='outline' onClick={resetForm}>
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 목표 목록 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* 연간 목표 */}
        <GoalSection
          title='연간 목표'
          goals={yearlyGoals}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onProgressUpdate={handleProgressUpdate}
        />

        {/* 월간 목표 */}
        <GoalSection
          title='월간 목표'
          goals={monthlyGoals}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onProgressUpdate={handleProgressUpdate}
        />

        {/* 주간 목표 */}
        <GoalSection
          title='주간 목표'
          goals={weeklyGoals}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onProgressUpdate={handleProgressUpdate}
        />
      </div>
    </div>
  );
}

function GoalSection({
  title,
  goals,
  onEdit,
  onDelete,
  onProgressUpdate,
}: {
  title: string;
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onProgressUpdate: (goalId: string, progress: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Target className='w-5 h-5' />
          {title}
          <Badge variant='outline' className='ml-auto'>
            {goals.length}개
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            <Target className='w-12 h-12 mx-auto mb-2 opacity-50' />
            <p>설정된 {title.slice(0, 2)} 목표가 없습니다.</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {goals.map((goal) => (
              <div key={goal.id} className='p-4 border rounded-lg'>
                <div className='flex items-start justify-between mb-2'>
                  <div className='flex-1'>
                    <h4 className='font-medium text-gray-900'>{goal.title}</h4>
                    {goal.description && (
                      <p className='text-sm text-gray-600 mt-1'>
                        {goal.description}
                      </p>
                    )}
                    {goal.target_date && (
                      <p className='text-xs text-gray-500 mt-1'>
                        목표일:{" "}
                        {new Date(goal.target_date).toLocaleDateString("ko-KR")}
                      </p>
                    )}
                  </div>
                  <div className='flex items-center gap-2 ml-4'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onEdit(goal)}
                    >
                      <Edit2 className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onDelete(goal.id)}
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span>진행률</span>
                    <span>{goal.progress_rate}%</span>
                  </div>
                  <Progress value={goal.progress_rate} className='h-2' />
                  <div className='flex gap-2'>
                    {[0, 25, 50, 75, 100].map((progress) => (
                      <Button
                        key={progress}
                        variant='outline'
                        size='sm'
                        onClick={() => onProgressUpdate(goal.id, progress)}
                        className={`text-xs ${
                          goal.progress_rate === progress ? "bg-blue-100" : ""
                        }`}
                      >
                        {progress}%
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
