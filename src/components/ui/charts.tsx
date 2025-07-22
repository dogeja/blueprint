"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Calendar, TrendingUp, Target, Activity } from "lucide-react";

// 진행률 차트 컴포넌트
interface ProgressChartProps {
  data: Array<{
    date: string;
    completed: number;
    total: number;
    progress: number;
  }>;
  title?: string;
  className?: string;
}

export function ProgressChart({
  data,
  title = "진행률 추이",
  className,
}: ProgressChartProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  const filteredData = data.slice(-getDaysFromRange(timeRange));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-background border border-border rounded-lg p-3 shadow-lg'>
          <p className='font-medium'>{label}</p>
          <p className='text-sm text-muted-foreground'>
            완료: {payload[0].value} / {payload[1].value}
          </p>
          <p className='text-sm text-primary'>
            진행률: {Math.round((payload[0].value / payload[1].value) * 100)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='w-5 h-5' />
            {title}
          </CardTitle>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
          >
            <option value='7d'>7일</option>
            <option value='30d'>30일</option>
            <option value='90d'>90일</option>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <ComposedChart data={filteredData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='date'
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatDate(value)}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey='total' fill='hsl(var(--muted))' opacity={0.3} />
            <Bar dataKey='completed' fill='hsl(var(--primary))' />
            <Line
              type='monotone'
              dataKey='progress'
              stroke='hsl(var(--secondary))'
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// 목표 달성률 차트
interface GoalCompletionChartProps {
  data: Array<{
    goal: string;
    completed: number;
    total: number;
    percentage: number;
  }>;
  className?: string;
}

export function GoalCompletionChart({
  data,
  className,
}: GoalCompletionChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-background border border-border rounded-lg p-3 shadow-lg'>
          <p className='font-medium'>{label}</p>
          <p className='text-sm text-muted-foreground'>
            완료: {data.completed} / {data.total}
          </p>
          <p className='text-sm text-primary'>달성률: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Target className='w-5 h-5' />
          목표 달성률
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={data} layout='horizontal'>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis type='number' domain={[0, 100]} tick={{ fontSize: 12 }} />
            <YAxis
              dataKey='goal'
              type='category'
              tick={{ fontSize: 12 }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey='percentage'
              fill='hsl(var(--primary))'
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// 생산성 트렌드 차트
interface ProductivityTrendChartProps {
  data: Array<{
    date: string;
    tasksCompleted: number;
    timeSpent: number;
    efficiency: number;
  }>;
  className?: string;
}

export function ProductivityTrendChart({
  data,
  className,
}: ProductivityTrendChartProps) {
  const [metric, setMetric] = useState<"tasks" | "time" | "efficiency">(
    "tasks"
  );

  const getMetricData = () => {
    switch (metric) {
      case "tasks":
        return {
          key: "tasksCompleted",
          color: "hsl(var(--primary))",
          label: "완료된 작업",
        };
      case "time":
        return {
          key: "timeSpent",
          color: "hsl(var(--secondary))",
          label: "소요 시간 (분)",
        };
      case "efficiency":
        return {
          key: "efficiency",
          color: "hsl(var(--accent))",
          label: "효율성 (%)",
        };
      default:
        return {
          key: "tasksCompleted",
          color: "hsl(var(--primary))",
          label: "완료된 작업",
        };
    }
  };

  const metricConfig = getMetricData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-background border border-border rounded-lg p-3 shadow-lg'>
          <p className='font-medium'>{formatDate(label)}</p>
          <p className='text-sm text-muted-foreground'>
            완료된 작업: {data.tasksCompleted}개
          </p>
          <p className='text-sm text-muted-foreground'>
            소요 시간: {data.timeSpent}분
          </p>
          <p className='text-sm text-primary'>효율성: {data.efficiency}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <Activity className='w-5 h-5' />
            생산성 트렌드
          </CardTitle>
          <Select
            value={metric}
            onChange={(e) => setMetric(e.target.value as any)}
          >
            <option value='tasks'>완료된 작업</option>
            <option value='time'>소요 시간</option>
            <option value='efficiency'>효율성</option>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='date'
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatDate(value)}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type='monotone'
              dataKey={metricConfig.key}
              stroke={metricConfig.color}
              fill={metricConfig.color}
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// 카테고리별 분포 차트
interface CategoryDistributionChartProps {
  data: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  className?: string;
}

export function CategoryDistributionChart({
  data,
  className,
}: CategoryDistributionChartProps) {
  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--muted))",
    "hsl(var(--destructive))",
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-background border border-border rounded-lg p-3 shadow-lg'>
          <p className='font-medium'>{data.category}</p>
          <p className='text-sm text-muted-foreground'>개수: {data.count}개</p>
          <p className='text-sm text-primary'>비율: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Target className='w-5 h-5' />
          카테고리별 분포
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <PieChart>
            <Pie
              data={data}
              cx='50%'
              cy='50%'
              labelLine={false}
              label={({ category, percentage }) => `${category} ${percentage}%`}
              outerRadius={80}
              fill='#8884d8'
              dataKey='count'
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// 주간 활동 요약 차트
interface WeeklyActivityChartProps {
  data: Array<{
    day: string;
    tasks: number;
    goals: number;
    time: number;
  }>;
  className?: string;
}

export function WeeklyActivityChart({
  data,
  className,
}: WeeklyActivityChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-background border border-border rounded-lg p-3 shadow-lg'>
          <p className='font-medium'>{label}</p>
          <p className='text-sm text-muted-foreground'>
            작업: {payload[0].value}개
          </p>
          <p className='text-sm text-muted-foreground'>
            목표: {payload[1].value}개
          </p>
          <p className='text-sm text-primary'>시간: {payload[2].value}분</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Calendar className='w-5 h-5' />
          주간 활동 요약
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='day' tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey='tasks' fill='hsl(var(--primary))' name='작업' />
            <Bar dataKey='goals' fill='hsl(var(--secondary))' name='목표' />
            <Bar dataKey='time' fill='hsl(var(--accent))' name='시간' />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// 성과 지표 카드
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  className,
}: MetricCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "increase":
        return "text-green-600 dark:text-green-400";
      case "decrease":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case "increase":
        return "↗";
      case "decrease":
        return "↘";
      default:
        return "";
    }
  };

  return (
    <Card className={className}>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-muted-foreground'>{title}</p>
            <p className='text-2xl font-bold'>{value}</p>
            {change !== undefined && (
              <div className='flex items-center gap-1 mt-1'>
                <span className={`text-sm ${getChangeColor()}`}>
                  {getChangeIcon()} {Math.abs(change)}%
                </span>
                <span className='text-xs text-muted-foreground'>
                  지난 주 대비
                </span>
              </div>
            )}
          </div>
          {icon && <div className='text-muted-foreground'>{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

// 유틸리티 함수들
function getDaysFromRange(range: string): number {
  switch (range) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    default:
      return 7;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}
