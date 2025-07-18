"use client";

import { useEffect, useState } from "react";
import { X, Trophy, Star, Target, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { useFeedbackStore, Achievement } from "@/lib/stores/feedback-store";

const achievementIcons = {
  task_completed: CheckCircle,
  goal_reached: Target,
  streak_milestone: Star,
  daily_complete: Trophy,
};

function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
      <polyline points='22,4 12,14.01 9,11.01' />
    </svg>
  );
}

export function AchievementNotification() {
  const { achievements, markAchievementAsRead } = useFeedbackStore();
  const [visibleAchievements, setVisibleAchievements] = useState<Achievement[]>(
    []
  );

  useEffect(() => {
    // 새로운 성취만 필터링
    const newAchievements = achievements.filter(
      (achievement) => achievement.isNew
    );
    setVisibleAchievements(newAchievements);
  }, [achievements]);

  const handleDismiss = (achievementId: string) => {
    markAchievementAsRead(achievementId);
    setVisibleAchievements((prev) =>
      prev.filter((achievement) => achievement.id !== achievementId)
    );
  };

  if (visibleAchievements.length === 0) return null;

  return (
    <div className='fixed bottom-4 right-4 z-50 space-y-2'>
      {visibleAchievements.map((achievement) => {
        const Icon = achievementIcons[achievement.type] || Trophy;

        return (
          <div
            key={achievement.id}
            className='bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 shadow-lg max-w-sm animate-in slide-in-from-right-2 duration-300'
          >
            <div className='flex items-start gap-3'>
              <div className='flex-shrink-0'>
                <div className='w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center'>
                  <Icon className='w-5 h-5 text-white' />
                </div>
              </div>

              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-1'>
                  <h4 className='font-semibold text-sm text-foreground'>
                    {achievement.title}
                  </h4>
                  <span className='text-lg'>{achievement.icon}</span>
                </div>
                <p className='text-sm text-muted-foreground'>
                  {achievement.description}
                </p>
                <div className='flex items-center gap-2 mt-2'>
                  <span className='text-xs text-muted-foreground'>
                    {new Date(achievement.timestamp).toLocaleTimeString(
                      "ko-KR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
              </div>

              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleDismiss(achievement.id)}
                className='h-6 w-6 p-0 opacity-70 hover:opacity-100'
              >
                <X className='w-4 h-4' />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
