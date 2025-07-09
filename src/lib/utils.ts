import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(timeString: string | null): string {
  if (!timeString) return "";
  return timeString.slice(0, 5); // HH:MM 형식으로 변환
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export function getProgressColor(progress: number): string {
  if (progress >= 80) return "bg-green-500";
  if (progress >= 60) return "bg-blue-500";
  if (progress >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

export function getConditionEmoji(score: number | null): string {
  if (!score) return "❓";
  if (score >= 9) return "🤩";
  if (score >= 8) return "😊";
  if (score >= 7) return "🙂";
  if (score >= 6) return "😐";
  if (score >= 5) return "😕";
  if (score >= 4) return "😞";
  if (score >= 3) return "😔";
  return "😵";
}

export function calculateTaskProgress(tasks: any[]): number {
  if (tasks.length === 0) return 0;
  const totalProgress = tasks.reduce(
    (sum, task) => sum + task.progress_rate,
    0
  );
  return Math.round(totalProgress / tasks.length);
}
