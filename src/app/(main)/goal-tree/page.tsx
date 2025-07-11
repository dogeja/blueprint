"use client";

import { useGoalStore } from "@/lib/stores/goal-store";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Goal, Task } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Target,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  BarChart3,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

function GoalTreeNode({
  goal,
  allGoals,
  depth = 0,
  selectedGoalId,
  onGoalSelect,
  goalStats,
}: {
  goal: Goal;
  allGoals: Goal[];
  depth?: number;
  selectedGoalId: string | null;
  onGoalSelect: (goalId: string) => void;
  goalStats: Record<
    string,
    { total: number; completed: number; progress: number }
  >;
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // 처음 2단계는 기본 확장
  const children = allGoals.filter((g) => g.parent_goal_id === goal.id);
  const isSelected = goal.id === selectedGoalId;
  const stats = goalStats[goal.id] || { total: 0, completed: 0, progress: 0 };

  return (
    <motion.div
      className='mb-3'
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: depth * 0.1,
        duration: 0.3,
        ease: "easeOut",
      }}
    >
      {/* 목표 노드 */}
      <motion.div
        className={`
          relative p-4 rounded-lg border transition-all cursor-pointer
          ${
            isSelected
              ? "bg-primary/10 border-primary shadow-lg"
              : "bg-card hover:bg-accent/50 border-border"
          }
        `}
        onClick={() => onGoalSelect(goal.id)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        {/* 연결선 (자식이 있을 때) */}
        {children.length > 0 && (
          <motion.div
            className='absolute left-6 top-full w-px bg-border'
            style={{ height: `${children.length * 80}px` }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          />
        )}

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3 flex-1'>
            {/* 확장/축소 버튼 */}
            {children.length > 0 && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className='h-6 w-6 p-0'
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className='h-4 w-4' />
                  </motion.div>
                </Button>
              </motion.div>
            )}

            {/* 목표 아이콘 */}
            <div className='flex items-center gap-2'>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Target className='h-5 w-5 text-primary' />
              </motion.div>
              <div>
                <h3 className='font-semibold text-base'>{goal.title}</h3>
                <div className='flex items-center gap-2 mt-1'>
                  <Badge
                    variant={goal.type === "yearly" ? "default" : "secondary"}
                  >
                    {goal.type === "yearly" ? "연간" : "월간"}
                  </Badge>
                  {stats.total > 0 && (
                    <span className='text-xs text-muted-foreground'>
                      {stats.completed}/{stats.total} 완료
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 진행률 */}
          {stats.total > 0 && (
            <div className='flex items-center gap-2 min-w-[120px]'>
              <Progress value={stats.progress} className='h-2 flex-1' />
              <span className='text-sm font-medium min-w-[40px]'>
                {stats.progress.toFixed(0)}%
              </span>
            </div>
          )}
        </div>

        {/* 목표 설명 */}
        {goal.description && (
          <motion.p
            className='text-sm text-muted-foreground mt-2 ml-8'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {goal.description}
          </motion.p>
        )}
      </motion.div>

      {/* 자식 목표들 */}
      <AnimatePresence>
        {isExpanded && children.length > 0 && (
          <motion.div
            className='ml-8 mt-2'
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children.map((child) => (
              <GoalTreeNode
                key={child.id}
                goal={child}
                allGoals={allGoals}
                depth={depth + 1}
                selectedGoalId={selectedGoalId}
                onGoalSelect={onGoalSelect}
                goalStats={goalStats}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function GoalDetailPanel({
  goal,
  allGoals,
  connectedTasks,
}: {
  goal: Goal | null;
  allGoals: Goal[];
  connectedTasks: Task[];
}) {
  if (!goal) return null;

  // 목표 경로 계산
  const getGoalPath = (goalId: string): Goal[] => {
    const path: Goal[] = [];
    let current = allGoals.find((g) => g.id === goalId);
    while (current) {
      path.unshift(current);
      current = allGoals.find((g) => g.id === current!.parent_goal_id);
    }
    return path;
  };

  const goalPath = getGoalPath(goal.id);
  const children = allGoals.filter((g) => g.parent_goal_id === goal.id);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className='h-fit'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Target className='h-5 w-5' />
            목표 상세
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* 목표 경로 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h4 className='text-sm font-medium mb-2'>목표 경로</h4>
            <div className='flex items-center gap-1 text-sm'>
              {goalPath.map((g, idx) => (
                <span key={g.id}>
                  <span className='text-muted-foreground'>{g.title}</span>
                  {idx < goalPath.length - 1 && (
                    <ChevronRight className='h-4 w-4 inline mx-1 text-muted-foreground' />
                  )}
                </span>
              ))}
            </div>
          </motion.div>

          {/* 목표 정보 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4 className='text-sm font-medium mb-2'>목표 정보</h4>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>유형:</span>
                <Badge
                  variant={goal.type === "yearly" ? "default" : "secondary"}
                >
                  {goal.type === "yearly" ? "연간 목표" : "월간 목표"}
                </Badge>
              </div>
              {goal.description && (
                <div>
                  <span className='text-muted-foreground'>설명:</span>
                  <p className='mt-1'>{goal.description}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* 하위 목표 */}
          {children.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className='text-sm font-medium mb-2'>하위 목표</h4>
              <div className='space-y-1'>
                {children.map((child, index) => (
                  <motion.div
                    key={child.id}
                    className='flex items-center justify-between text-sm p-2 bg-muted/50 rounded'
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <span>{child.title}</span>
                    <Badge variant='outline' className='text-xs'>
                      {child.type === "yearly" ? "연간" : "월간"}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 연결된 업무 */}
          {connectedTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h4 className='text-sm font-medium mb-2'>연결된 업무</h4>
              <div className='space-y-2'>
                {connectedTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    className='flex items-center justify-between text-sm p-2 bg-muted/50 rounded'
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <span className='truncate'>{task.title}</span>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant={
                          task.progress_rate === 100 ? "default" : "secondary"
                        }
                        className='text-xs'
                      >
                        {task.progress_rate}%
                      </Badge>
                      {task.progress_rate === 100 && (
                        <CheckCircle className='h-4 w-4 text-green-500' />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function GoalTreePage() {
  const { goals, loadGoals } = useGoalStore();
  const { currentReport } = useDailyReportStore();
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // 목표별 통계 계산
  const goalStats = goals.reduce((acc, goal) => {
    const connectedTasks =
      currentReport?.tasks.filter((task) => task.goal_id === goal.id) || [];

    const total = connectedTasks.length;
    const completed = connectedTasks.filter(
      (task) => task.progress_rate === 100
    ).length;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    acc[goal.id] = { total, completed, progress };
    return acc;
  }, {} as Record<string, { total: number; completed: number; progress: number }>);

  const rootGoals = goals.filter((g) => !g.parent_goal_id);
  const selectedGoal = goals.find((g) => g.id === selectedGoalId) || null;
  const connectedTasks =
    currentReport?.tasks.filter((task) => task.goal_id === selectedGoalId) ||
    [];

  return (
    <motion.div
      className='max-w-7xl mx-auto py-6'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className='mb-6'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className='text-3xl font-bold mb-2'>목표 트리</h1>
        <p className='text-muted-foreground'>
          목표 간의 계층 구조와 진행 상황을 한눈에 확인하세요
        </p>
      </motion.div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* 목표 트리 */}
        <motion.div
          className='lg:col-span-2'
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BarChart3 className='h-5 w-5' />
                목표 계층 구조
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rootGoals.length === 0 ? (
                <motion.div
                  className='text-center py-12 text-muted-foreground'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Target className='h-12 w-12 mx-auto mb-4 opacity-50' />
                  <p>등록된 목표가 없습니다.</p>
                  <p className='text-sm mt-1'>새로운 목표를 추가해보세요.</p>
                </motion.div>
              ) : (
                <div className='space-y-2'>
                  {rootGoals.map((goal, index) => (
                    <GoalTreeNode
                      key={goal.id}
                      goal={goal}
                      allGoals={goals}
                      selectedGoalId={selectedGoalId}
                      onGoalSelect={setSelectedGoalId}
                      goalStats={goalStats}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 상세 패널 */}
        <motion.div
          className='lg:col-span-1'
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {selectedGoal ? (
            <GoalDetailPanel
              goal={selectedGoal}
              allGoals={goals}
              connectedTasks={connectedTasks}
            />
          ) : (
            <Card>
              <CardContent className='text-center py-12 text-muted-foreground'>
                <Target className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>목표를 선택하여 상세 정보를 확인하세요</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
