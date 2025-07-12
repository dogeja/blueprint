"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Activity,
  PieChart,
  LineChart,
  Award,
  Zap,
  Target as TargetIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useGoalStore } from "@/lib/stores/goal-store";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import type { Goal, Task } from "@/types";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { ko } from "date-fns/locale";

// 간단한 차트 컴포넌트 (실제로는 recharts 라이브러리 사용 권장)
function SimpleBarChart({
  data,
  title,
}: {
  data: { label: string; value: number }[];
  title: string;
}) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className='space-y-2'>
      <h4 className='text-sm font-medium'>{title}</h4>
      <div className='space-y-2'>
        {data.map((item, index) => (
          <motion.div
            key={index}
            className='flex items-center gap-2'
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className='text-xs w-16 truncate'>{item.label}</span>
            <div className='flex-1 bg-muted rounded-full h-2'>
              <motion.div
                className='bg-primary h-2 rounded-full'
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
              />
            </div>
            <span className='text-xs w-8 text-right'>{item.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SimplePieChart({
  data,
  title,
}: {
  data: { label: string; value: number; color: string }[];
  title: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className='space-y-2'>
      <h4 className='text-sm font-medium'>{title}</h4>
      <div className='space-y-1'>
        {data.map((item, index) => (
          <motion.div
            key={index}
            className='flex items-center justify-between text-xs'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className='flex items-center gap-2'>
              <div
                className='w-3 h-3 rounded-full'
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </div>
            <span>
              {total > 0 ? Math.round((item.value / total) * 100) : 0}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function GoalProgressCard({ goal, tasks }: { goal: Goal; tasks: Task[] }) {
  const completedTasks = tasks.filter((t) => t.progress_rate === 100).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card className='hover:shadow-md transition-shadow'>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center gap-2'>
              <TargetIcon className='h-4 w-4 text-primary' />
              <h3 className='font-medium text-sm truncate'>{goal.title}</h3>
            </div>
            <Badge
              variant={goal.type === "yearly" ? "default" : "secondary"}
              className='text-xs'
            >
              {goal.type === "yearly" ? "연간" : "월간"}
            </Badge>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between text-xs'>
              <span>진행률</span>
              <span className='font-medium'>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className='h-2' />
            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span>완료된 업무</span>
              <span>
                {completedTasks}/{totalTasks}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function WeeklyTrendChart({ tasks }: { tasks: Task[] }) {
  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date()),
  });

  const dailyStats = weekDays.map((day) => {
    const dayTasks = tasks.filter((task) => {
      // 실제로는 task.created_at과 비교해야 함
      return true; // 임시로 모든 업무 포함
    });

    const completed = dayTasks.filter((t) => t.progress_rate === 100).length;
    const total = dayTasks.length;

    return {
      day: format(day, "EEE", { locale: ko }),
      completed,
      total,
      rate: total > 0 ? (completed / total) * 100 : 0,
    };
  });

  return (
    <div className='space-y-2'>
      <h4 className='text-sm font-medium'>주간 완료율 추이</h4>
      <div className='flex items-end justify-between h-24'>
        {dailyStats.map((stat, index) => (
          <motion.div
            key={index}
            className='flex flex-col items-center gap-1'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div
              className='bg-primary rounded-t w-6'
              initial={{ height: 0 }}
              animate={{ height: `${(stat.rate / 100) * 60}px` }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
            />
            <span className='text-xs text-muted-foreground'>{stat.day}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { goals, loadGoals } = useGoalStore();
  const { currentReport } = useDailyReportStore();
  const [timeRange, setTimeRange] = useState("week");

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // 목표별 통계 계산
  const goalStats = useMemo(() => {
    return goals
      .map((goal) => {
        const connectedTasks =
          currentReport?.tasks.filter((task) => task.goal_id === goal.id) || [];

        const total = connectedTasks.length;
        const completed = connectedTasks.filter(
          (t) => t.progress_rate === 100
        ).length;
        const progress = total > 0 ? (completed / total) * 100 : 0;

        return {
          goal,
          tasks: connectedTasks,
          total,
          completed,
          progress,
        };
      })
      .filter((stat) => stat.total > 0);
  }, [goals, currentReport]);

  // 전체 통계
  const overallStats = useMemo(() => {
    const allTasks = currentReport?.tasks || [];
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      (t) => t.progress_rate === 100
    ).length;
    const connectedTasks = allTasks.filter((t) => t.goal_id).length;
    const unconnectedTasks = totalTasks - connectedTasks;

    return {
      totalTasks,
      completedTasks,
      connectedTasks,
      unconnectedTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      connectionRate: totalTasks > 0 ? (connectedTasks / totalTasks) * 100 : 0,
    };
  }, [currentReport]);

  // 카테고리별 통계
  const categoryStats = useMemo(() => {
    const allTasks = currentReport?.tasks || [];
    const continuous = allTasks.filter((t) => t.category === "continuous");
    const shortTerm = allTasks.filter((t) => t.category === "short_term");

    return [
      {
        label: "계속업무",
        value: continuous.length,
        completed: continuous.filter((t) => t.progress_rate === 100).length,
      },
      {
        label: "단기업무",
        value: shortTerm.length,
        completed: shortTerm.filter((t) => t.progress_rate === 100).length,
      },
    ];
  }, [currentReport]);

  // 우선순위별 통계
  const priorityStats = useMemo(() => {
    const allTasks = currentReport?.tasks || [];
    const priorityGroups = [1, 2, 3, 4, 5].map((priority) => ({
      priority,
      tasks: allTasks.filter((t) => t.priority === priority),
      label: `${priority}순위`,
    }));

    return priorityGroups
      .map((group) => ({
        label: group.label,
        value: group.tasks.length,
        completed: group.tasks.filter((t) => t.progress_rate === 100).length,
      }))
      .filter((stat) => stat.value > 0);
  }, [currentReport]);

  return (
    <motion.div
      className='max-w-7xl mx-auto py-6 space-y-6'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 헤더 */}
      <motion.div
        className='flex items-center justify-between'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div>
          <h1 className='text-3xl font-bold mb-2'>분석 대시보드</h1>
          <p className='text-muted-foreground'>
            목표와 일일보고의 관계성을 분석하여 인사이트를 얻어보세요
          </p>
        </div>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className='w-32'
        >
          <option value='week'>이번 주</option>
          <option value='month'>이번 달</option>
          <option value='quarter'>이번 분기</option>
        </Select>
      </motion.div>

      {/* 전체 통계 카드 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[
          {
            icon: Target,
            title: "전체 업무",
            value: overallStats.totalTasks,
            subtitle: `완료: ${overallStats.completedTasks}개`,
            color: "text-primary",
          },
          {
            icon: CheckCircle,
            title: "완료율",
            value: `${overallStats.completionRate.toFixed(1)}%`,
            progress: overallStats.completionRate,
            color: "text-green-500",
          },
          {
            icon: TrendingUp,
            title: "목표 연결율",
            value: `${overallStats.connectionRate.toFixed(1)}%`,
            subtitle: `${overallStats.connectedTasks}/${overallStats.totalTasks}개 연결됨`,
            color: "text-blue-500",
          },
          {
            icon: Activity,
            title: "활성 목표",
            value: goalStats.length,
            subtitle: "진행 중인 목표",
            color: "text-purple-500",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center gap-2 mb-2'>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className='text-sm font-medium'>{stat.title}</span>
                </div>
                <div className='text-2xl font-bold'>{stat.value}</div>
                {stat.progress !== undefined ? (
                  <Progress value={stat.progress} className='h-2 mt-2' />
                ) : (
                  <div className='text-xs text-muted-foreground mt-1'>
                    {stat.subtitle}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* 목표별 진행률 */}
        <motion.div
          className='lg:col-span-2'
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BarChart3 className='h-5 w-5' />
                목표별 진행률
              </CardTitle>
            </CardHeader>
            <CardContent>
              {goalStats.length === 0 ? (
                <motion.div
                  className='text-center py-12 text-muted-foreground'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Target className='h-12 w-12 mx-auto mb-4 opacity-50' />
                  <p>연결된 목표가 없습니다.</p>
                  <p className='text-sm mt-1'>
                    업무 작성 시 목표를 선택해보세요.
                  </p>
                </motion.div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {goalStats.map(({ goal, tasks, progress }, index) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      <GoalProgressCard goal={goal} tasks={tasks} />
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 차트 섹션 */}
        <motion.div
          className='space-y-6'
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          {/* 카테고리별 분포 */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>업무 분류</CardTitle>
            </CardHeader>
            <CardContent>
              <SimplePieChart
                data={[
                  {
                    label: "계속업무",
                    value: categoryStats[0]?.value || 0,
                    color: "#3b82f6",
                  },
                  {
                    label: "단기업무",
                    value: categoryStats[1]?.value || 0,
                    color: "#10b981",
                  },
                ]}
                title=''
              />
            </CardContent>
          </Card>

          {/* 우선순위별 분포 */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>우선순위별</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={priorityStats} title='' />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 주간 트렌드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <LineChart className='h-5 w-5' />
              주간 트렌드
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyTrendChart tasks={currentReport?.tasks || []} />
          </CardContent>
        </Card>
      </motion.div>

      {/* 인사이트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Award className='h-5 w-5' />
              인사이트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <motion.div
                className='space-y-4'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >
                <h4 className='font-medium flex items-center gap-2'>
                  <Zap className='h-4 w-4 text-yellow-500' />
                  성과 분석
                </h4>
                <div className='space-y-2 text-sm'>
                  {overallStats.completionRate > 80 ? (
                    <p className='text-green-600'>
                      🎉 완료율이 80%를 넘어 훌륭한 성과를 보이고 있습니다!
                    </p>
                  ) : overallStats.completionRate > 60 ? (
                    <p className='text-blue-600'>
                      👍 꾸준한 진행으로 목표 달성에 가까워지고 있습니다.
                    </p>
                  ) : (
                    <p className='text-orange-600'>
                      ⚠️ 완료율이 낮습니다. 우선순위를 재검토해보세요.
                    </p>
                  )}

                  {overallStats.connectionRate < 50 && (
                    <p className='text-red-600'>
                      💡 업무의 절반 이상이 목표와 연결되지 않았습니다. 장기
                      목표와의 연관성을 고려해보세요.
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div
                className='space-y-4'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
              >
                <h4 className='font-medium flex items-center gap-2'>
                  <Target className='h-4 w-4 text-primary' />
                  개선 제안
                </h4>
                <div className='space-y-2 text-sm'>
                  {goalStats.length === 0 && (
                    <p className='text-muted-foreground'>
                      📝 업무 작성 시 목표를 선택하여 진행 상황을 추적해보세요.
                    </p>
                  )}
                  {priorityStats.some(
                    (stat) => stat.label.includes("1") && stat.value > 0
                  ) && (
                    <p className='text-muted-foreground'>
                      🎯 1순위 업무에 집중하여 중요한 일부터 처리하세요.
                    </p>
                  )}
                  <p className='text-muted-foreground'>
                    📊 정기적으로 분석을 확인하여 목표 달성 방향을 점검하세요.
                  </p>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
