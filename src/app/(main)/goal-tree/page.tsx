"use client";

import { useGoalStore } from "@/lib/stores/goal-store";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { useEffect, useState } from "react";
import { Goal, Task } from "@/types";

function TaskListForGoal({ goalId }: { goalId: string }) {
  const { currentReport } = useDailyReportStore();
  const tasks = currentReport?.tasks.filter((t) => t.goal_id === goalId) || [];
  if (tasks.length === 0)
    return (
      <div className='text-xs text-muted-foreground mt-2'>
        연결된 오늘의 업무가 없습니다.
      </div>
    );
  return (
    <div className='mt-2 ml-2 space-y-1'>
      {tasks.map((task) => (
        <div
          key={task.id}
          className='px-2 py-1 rounded bg-muted flex items-center gap-2 text-sm'
        >
          <span className='font-medium'>{task.title}</span>
          <span className='text-xs text-muted-foreground'>
            ({task.progress_rate}%)
          </span>
        </div>
      ))}
    </div>
  );
}

export default function GoalTreePage() {
  const { goals, loadGoals } = useGoalStore();
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  useEffect(() => {
    loadGoals();
  }, [loadGoals]);
  const rootGoals = goals.filter((g) => !g.parent_goal_id);

  function renderGoalTree(goal: Goal, allGoals: Goal[], depth = 0) {
    const isSelected = goal.id === selectedGoalId;
    const children = allGoals.filter((g) => g.parent_goal_id === goal.id);
    return (
      <div
        key={goal.id}
        style={{ marginLeft: depth * 24 }}
        className={`mb-2 p-2 rounded transition-all cursor-pointer ${
          isSelected ? "bg-primary/10 border-primary border-2 shadow-lg" : ""
        } hover:bg-muted`}
        onClick={() => setSelectedGoalId(goal.id)}
      >
        <div className='font-bold text-sm flex items-center gap-2'>
          <span>{goal.title}</span>
          <span className='text-xs text-muted-foreground'>({goal.type})</span>
        </div>
        {children.map((child) => renderGoalTree(child, allGoals, depth + 1))}
        {isSelected && <TaskListForGoal goalId={goal.id} />}
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto py-8'>
      <h1 className='text-2xl font-bold mb-6'>목표 트리</h1>
      {rootGoals.length === 0 ? (
        <p className='text-muted-foreground'>등록된 목표가 없습니다.</p>
      ) : (
        rootGoals.map((goal) => renderGoalTree(goal, goals))
      )}
    </div>
  );
}
