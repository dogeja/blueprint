import { format, addDays, startOfWeek, endOfWeek } from "date-fns";

// 캘린더 이벤트 타입
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay?: boolean;
  location?: string;
  type: "goal" | "daily-report" | "task";
  priority?: "high" | "medium" | "low";
}

// 목표를 캘린더 이벤트로 변환
export function goalToCalendarEvent(goal: any): CalendarEvent {
  return {
    id: `goal-${goal.id}`,
    title: goal.title,
    description: goal.description,
    startDate: goal.target_date || format(new Date(), "yyyy-MM-dd"),
    allDay: true,
    type: "goal",
    priority: goal.priority || "medium",
  };
}

// 일일보고를 캘린더 이벤트로 변환
export function dailyReportToCalendarEvent(report: any): CalendarEvent {
  return {
    id: `report-${report.id}`,
    title: "일일보고",
    description: `컨디션: ${report.condition_score}/10`,
    startDate: report.report_date,
    allDay: true,
    type: "daily-report",
    priority: "medium",
  };
}

// 업무를 캘린더 이벤트로 변환
export function taskToCalendarEvent(
  task: any,
  reportDate: string
): CalendarEvent {
  const estimatedHours = task.estimated_time_minutes
    ? Math.ceil(task.estimated_time_minutes / 60)
    : 1;

  return {
    id: `task-${task.id}`,
    title: task.title,
    description: task.description,
    startDate: reportDate,
    endDate: reportDate, // 같은 날짜
    allDay: false,
    type: "task",
    priority:
      task.priority === 1 ? "high" : task.priority === 2 ? "medium" : "low",
  };
}

// Google Calendar 연동 URL 생성 (향후 구현)
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${event.startDate.replace(/-/g, "")}T000000Z/${
      event.endDate?.replace(/-/g, "") || event.startDate.replace(/-/g, "")
    }T235959Z`,
    details: event.description || "",
    location: event.location || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Outlook Calendar 연동 URL 생성 (향후 구현)
export function generateOutlookCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    startdt: event.startDate,
    enddt: event.endDate || event.startDate,
    body: event.description || "",
    location: event.location || "",
  });

  return `https://outlook.live.com/calendar/0/${params.toString()}`;
}

// 주간 일정 요약 생성
export function generateWeeklySchedule(
  goals: any[],
  reports: any[],
  tasks: any[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  // 목표 이벤트 추가
  goals.forEach((goal) => {
    if (goal.target_date) {
      events.push(goalToCalendarEvent(goal));
    }
  });

  // 일일보고 이벤트 추가
  reports.forEach((report) => {
    events.push(dailyReportToCalendarEvent(report));
  });

  // 목표 이벤트 추가
  tasks.forEach((task) => {
    if (task.daily_report_id) {
      const report = reports.find((r) => r.id === task.daily_report_id);
      if (report) {
        events.push(taskToCalendarEvent(task, report.report_date));
      }
    }
  });

  return events;
}
