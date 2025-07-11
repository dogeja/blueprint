import {
  format,
  startOfWeek,
  endOfWeek,
  subDays,
  isToday,
  isYesterday,
} from "date-fns";
import { ko } from "date-fns/locale";

// 일일보고 연속 작성일 수 계산
export function calculateReportStreak(
  reports: Array<{ report_date: string }>
): number {
  if (!reports.length) return 0;

  const sortedReports = reports
    .map((r) => r.report_date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  let currentDate = new Date();

  // 오늘부터 역순으로 확인
  for (let i = 0; i < 7; i++) {
    // 최대 7일까지만 확인
    const dateStr = format(currentDate, "yyyy-MM-dd");

    if (sortedReports.includes(dateStr)) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
  }

  return streak;
}

// 주간 목표 달성률 계산
export function calculateWeeklyGoalProgress(
  goals: Array<{ progress_rate: number }>
): number {
  if (!goals.length) return 0;

  const totalProgress = goals.reduce(
    (sum, goal) => sum + (goal.progress_rate || 0),
    0
  );
  return Math.round(totalProgress / goals.length);
}

// 어제와 오늘 비교 (업무 완료 개수)
export function compareYesterdayToday(
  yesterdayTasks: Array<{ progress_rate: number }>,
  todayTasks: Array<{ progress_rate: number }>
): { type: "improved" | "same" | "decreased"; difference: number } {
  const yesterdayCompleted = yesterdayTasks.filter(
    (t) => t.progress_rate === 100
  ).length;
  const todayCompleted = todayTasks.filter(
    (t) => t.progress_rate === 100
  ).length;

  const difference = todayCompleted - yesterdayCompleted;

  if (difference > 0) return { type: "improved", difference };
  if (difference < 0)
    return { type: "decreased", difference: Math.abs(difference) };
  return { type: "same", difference: 0 };
}

// 동기부여 메시지 생성
export function generateMotivationMessage(
  streak: number,
  weeklyProgress: number,
  comparison: { type: "improved" | "same" | "decreased"; difference: number },
  userName: string
): { greeting: string; motivation: string; badges: string[] } {
  const badges: string[] = [];

  // 연속 작성 배지
  if (streak >= 7) {
    badges.push("🔥 7일 연속!");
  } else if (streak >= 5) {
    badges.push("⚡ 5일 연속!");
  } else if (streak >= 3) {
    badges.push("🎯 3일 연속!");
  } else if (streak >= 1) {
    badges.push("📝 기록 중!");
  }

  // 주간 목표 달성 배지
  if (weeklyProgress >= 80) {
    badges.push("🏆 목표 달성!");
  } else if (weeklyProgress >= 60) {
    badges.push("📈 꾸준한 진행!");
  } else if (weeklyProgress >= 40) {
    badges.push("💪 노력 중!");
  }

  // 어제 대비 개선 배지
  if (comparison.type === "improved") {
    badges.push(`🚀 ${comparison.difference}개 더 완료!`);
  }

  // 인사말
  const greeting = `좋은 하루예요, ${userName}님!`;

  // 동기부여 메시지
  let motivation = "오늘도 목표를 향해 한 걸음씩 나아가요!";

  if (streak >= 7) {
    motivation = "7일 연속 기록! 정말 대단해요! 🎉";
  } else if (streak >= 5) {
    motivation = "5일 연속 기록 중! 습관이 만들어지고 있어요!";
  } else if (streak >= 3) {
    motivation = "3일 연속 기록! 꾸준함이 곧 힘입니다!";
  } else if (comparison.type === "improved") {
    motivation = `어제보다 ${comparison.difference}개 더 많이 완료했어요! 👍`;
  } else if (weeklyProgress >= 80) {
    motivation = "이번 주 목표를 거의 달성했어요! 마지막까지 파이팅!";
  } else if (weeklyProgress >= 60) {
    motivation = "꾸준한 진행이 보여요! 오늘도 한 걸음씩!";
  }

  return { greeting, motivation, badges };
}
