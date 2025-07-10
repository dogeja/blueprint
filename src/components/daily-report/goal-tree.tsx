import { Goal } from "@/types";

interface GoalTreeProps {
  goal: Goal | null;
  getParentGoal: (parentId: string | null) => Goal | null;
}

export function GoalTree({ goal, getParentGoal }: GoalTreeProps) {
  if (!goal) return null;
  const parent = getParentGoal(goal.parent_goal_id);

  return (
    <div className='flex items-center gap-1 text-xs text-muted-foreground'>
      {parent && (
        <>
          <GoalTree goal={parent} getParentGoal={getParentGoal} />
          <span>→</span>
        </>
      )}
      <span className='font-bold'>{goal.title}</span>
    </div>
  );
}
