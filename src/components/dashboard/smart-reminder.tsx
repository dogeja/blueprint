"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, isAfter, isBefore } from "date-fns";
import Link from "next/link";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { useGoalStore } from "@/lib/stores/goal-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  FileText,
  Target,
  Calendar,
  X,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface ReminderItem {
  id: string;
  type: "daily-report" | "goal-setting" | "goal-deadline";
  title: string;
  message: string;
  actionUrl: string;
  actionText: string;
  priority: "high" | "medium" | "low";
  icon: any;
}

export function SmartReminder() {
  const { currentReport } = useDailyReportStore();
  const { goals } = useGoalStore();
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const newReminders: ReminderItem[] = [];

    // 1. 일일보고 미작성 체크
    if (!currentReport) {
      newReminders.push({
        id: "daily-report",
        type: "daily-report",
        title: "오늘의 일일보고",
        message: "오늘 하루를 정리하고 내일을 준비해보세요!",
        actionUrl: "/daily-report",
        actionText: "일일보고 작성",
        priority: "high",
        icon: FileText,
      });
    }

    // 2. 목표 미설정 체크
    const activeGoals = goals.filter((g) => g.status === "active");
    if (activeGoals.length === 0) {
      newReminders.push({
        id: "goal-setting",
        type: "goal-setting",
        title: "목표 설정",
        message: "목표를 설정하면 더 체계적으로 관리할 수 있어요!",
        actionUrl: "/goals",
        actionText: "목표 설정하기",
        priority: "medium",
        icon: Target,
      });
    }

    // 3. 목표 마감일 임박 체크 (3일 이내)
    const today = new Date();
    const deadlineGoals = activeGoals.filter((goal) => {
      if (!goal.target_date) return false;
      const deadline = new Date(goal.target_date);
      const daysUntilDeadline = Math.ceil(
        (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilDeadline >= 0 && daysUntilDeadline <= 3;
    });

    deadlineGoals.forEach((goal) => {
      const deadline = new Date(goal.target_date!);
      const daysUntilDeadline = Math.ceil(
        (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      newReminders.push({
        id: `goal-deadline-${goal.id}`,
        type: "goal-deadline",
        title: `목표 마감일 임박: ${goal.title}`,
        message:
          daysUntilDeadline === 0
            ? "오늘이 마감일입니다!"
            : `${daysUntilDeadline}일 후 마감됩니다.`,
        actionUrl: "/goals",
        actionText: "목표 확인",
        priority: daysUntilDeadline === 0 ? "high" : "medium",
        icon: Calendar,
      });
    });

    setReminders(newReminders);
  }, [currentReport, goals]);

  if (reminders.length === 0 || !isVisible) return null;

  // 우선순위별 정렬 (high > medium > low)
  const sortedReminders = reminders.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <AnimatePresence>
      <motion.div
        className='space-y-3'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {sortedReminders.slice(0, 3).map((reminder, index) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`
              border-l-4 shadow-sm hover:shadow-md transition-all duration-300
              ${
                reminder.priority === "high"
                  ? "border-l-red-500 bg-red-50"
                  : reminder.priority === "medium"
                  ? "border-l-orange-500 bg-orange-50"
                  : "border-l-blue-500 bg-blue-50"
              }
            `}
            >
              <CardContent className='p-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-start gap-3 flex-1'>
                    <div
                      className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${
                        reminder.priority === "high"
                          ? "bg-red-100 text-red-600"
                          : reminder.priority === "medium"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-blue-100 text-blue-600"
                      }
                    `}
                    >
                      <reminder.icon className='w-5 h-5' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-semibold text-sm text-foreground mb-1'>
                        {reminder.title}
                      </h3>
                      <p className='text-sm text-muted-foreground mb-3'>
                        {reminder.message}
                      </p>
                      <Link href={reminder.actionUrl}>
                        <Button
                          size='sm'
                          className={`
                            ${
                              reminder.priority === "high"
                                ? "bg-red-500 hover:bg-red-600"
                                : reminder.priority === "medium"
                                ? "bg-orange-500 hover:bg-orange-600"
                                : "bg-blue-500 hover:bg-blue-600"
                            }
                          `}
                        >
                          {reminder.actionText}
                          <ArrowRight className='w-4 h-4 ml-1' />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setIsVisible(false)}
                    className='text-muted-foreground hover:text-foreground'
                  >
                    <X className='w-4 h-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
