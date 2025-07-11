import { format, getDay, getWeek, getMonth } from "date-fns";

// 사용자 패턴 분석 결과
export interface UserPatterns {
  frequentCategories: string[];
  successfulGoalTypes: string[];
  timePatterns: {
    morning: string[];
    afternoon: string[];
    evening: string[];
  };
  conditionPatterns: {
    high: string[];
    low: string[];
  };
  commonKeywords: string[];
  goalCompletionRate: number;
  averageCondition: number;
  preferredGoalDuration: "daily" | "weekly" | "monthly";
}

// 제안 아이템 타입
export interface SuggestionItem {
  id: string;
  type: "goal" | "task" | "category" | "timing" | "pattern";
  title: string;
  message: string;
  confidence: number; // 0-1
  actionUrl?: string;
  actionText?: string;
}

// 사용자 패턴 분석
export function analyzeUserPatterns(
  goals: any[],
  reports: any[],
  tasks: any[]
): UserPatterns {
  // 카테고리 빈도 분석
  const categoryCounts: Record<string, number> = {};
  tasks.forEach((task) => {
    if (task.category) {
      categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
    }
  });

  const frequentCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category]) => category);

  // 목표 달성률 분석
  const completedGoals = goals.filter((g) => g.status === "completed").length;
  const totalGoals = goals.length;
  const goalCompletionRate =
    totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  // 컨디션 패턴 분석
  const conditionScores = reports.map((r) => r.condition_score).filter(Boolean);
  const averageCondition =
    conditionScores.length > 0
      ? conditionScores.reduce((a, b) => a + b, 0) / conditionScores.length
      : 5;

  // 시간대별 패턴 (간단한 추정)
  const timePatterns = {
    morning: ["회의", "계획", "이메일"],
    afternoon: ["개발", "실행", "분석"],
    evening: ["정리", "회고", "문서작성"],
  };

  // 컨디션별 패턴
  const conditionPatterns = {
    high: ["중요 업무", "창의적 작업", "회의"],
    low: ["정리", "간단한 업무", "문서작성"],
  };

  // 자주 사용하는 키워드 추출
  const allTexts = [
    ...goals.map((g) => g.title + " " + (g.description || "")),
    ...tasks.map((t) => t.title + " " + (t.description || "")),
  ].join(" ");

  const commonKeywords = extractKeywords(allTexts);

  // 선호하는 목표 기간 분석
  const goalTypes = goals.map((g) => g.type);
  const typeCounts: Record<string, number> = {};
  goalTypes.forEach((type) => {
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const preferredGoalDuration =
    (Object.entries(typeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as
      | "daily"
      | "weekly"
      | "monthly") || "weekly";

  return {
    frequentCategories,
    successfulGoalTypes:
      goalCompletionRate > 70 ? ["구체적 수치", "주간"] : ["간단한", "일간"],
    timePatterns,
    conditionPatterns,
    commonKeywords,
    goalCompletionRate,
    averageCondition,
    preferredGoalDuration,
  };
}

// 키워드 추출 (간단한 버전)
function extractKeywords(text: string): string[] {
  const keywords = [
    "개발",
    "테스트",
    "회의",
    "문서",
    "분석",
    "설계",
    "구현",
    "검토",
    "개선",
    "완료",
    "진행",
    "계획",
    "정리",
    "회고",
    "학습",
    "연구",
  ];

  return keywords
    .filter((keyword) => text.toLowerCase().includes(keyword.toLowerCase()))
    .slice(0, 5);
}

// 목표 제안 생성
export function generateGoalSuggestions(
  patterns: UserPatterns,
  currentGoals: any[],
  recentTasks: any[]
): SuggestionItem[] {
  const suggestions: SuggestionItem[] = [];

  // 1. 자주 사용하는 카테고리 기반 제안
  if (patterns.frequentCategories.length > 0) {
    const topCategory = patterns.frequentCategories[0];
    const categoryCount = recentTasks.filter(
      (t) => t.category === topCategory
    ).length;

    suggestions.push({
      id: "frequent-category",
      type: "category",
      title: "자주 사용하는 카테고리",
      message: `이번 주 '${topCategory}' 업무를 ${categoryCount}개 완료하셨네요. 다음 주는 '${getNextCategory(
        topCategory
      )}' 목표는 어떠세요?`,
      confidence: 0.8,
      actionUrl: "/goals",
      actionText: "목표 설정하기",
    });
  }

  // 2. 성공 패턴 기반 제안
  if (patterns.goalCompletionRate > 70) {
    suggestions.push({
      id: "success-pattern",
      type: "pattern",
      title: "성공 패턴 발견!",
      message: `목표 달성률이 ${Math.round(
        patterns.goalCompletionRate
      )}%로 높아요! '${
        patterns.successfulGoalTypes[0]
      }' 목표를 더 설정해보세요.`,
      confidence: 0.9,
      actionUrl: "/goals",
      actionText: "목표 추가하기",
    });
  } else if (patterns.goalCompletionRate < 50) {
    suggestions.push({
      id: "improvement-suggestion",
      type: "pattern",
      title: "목표 달성률 개선",
      message: `목표 달성률이 ${Math.round(
        patterns.goalCompletionRate
      )}%예요. 더 작고 구체적인 목표로 시작해보세요.`,
      confidence: 0.7,
      actionUrl: "/goals",
      actionText: "목표 수정하기",
    });
  }

  // 3. 시즌별 제안
  const currentMonth = getMonth(new Date());
  if (
    currentMonth === 11 ||
    currentMonth === 2 ||
    currentMonth === 5 ||
    currentMonth === 8
  ) {
    suggestions.push({
      id: "seasonal-goal",
      type: "timing",
      title: "분기 마무리",
      message:
        "분기 말이 다가왔어요. 이번 분기 성과를 정리하고 다음 분기 목표를 준비해보세요.",
      confidence: 0.6,
      actionUrl: "/goals",
      actionText: "분기 목표 설정",
    });
  }

  // 4. 키워드 기반 제안
  if (patterns.commonKeywords.length > 0) {
    const keyword = patterns.commonKeywords[0];
    suggestions.push({
      id: "keyword-suggestion",
      type: "goal",
      title: "관심 키워드 발견",
      message: `'${keyword}' 관련 목표를 자주 설정하시네요. 이번 주도 '${keyword}' 관련 목표를 추가해보세요.`,
      confidence: 0.7,
      actionUrl: "/goals",
      actionText: "목표 추가하기",
    });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// 일일보고 제안 생성
export function generateDailyReportSuggestions(
  patterns: UserPatterns,
  yesterdayReport: any,
  currentGoals: any[]
): SuggestionItem[] {
  const suggestions: SuggestionItem[] = [];

  // 1. 어제 컨디션 기반 제안
  if (yesterdayReport?.condition_score) {
    const condition = yesterdayReport.condition_score;
    if (condition >= 8) {
      suggestions.push({
        id: "high-condition",
        type: "task",
        title: "컨디션이 좋아요!",
        message: `어제 컨디션이 ${condition}점이었네요! 오늘은 '${patterns.conditionPatterns.high[0]}' 같은 중요한 업무를 계획해보세요.`,
        confidence: 0.8,
      });
    } else if (condition <= 4) {
      suggestions.push({
        id: "low-condition",
        type: "task",
        title: "컨디션 관리",
        message: `어제 컨디션이 ${condition}점이었네요. 오늘은 '${patterns.conditionPatterns.low[0]}' 같은 가벼운 업무부터 시작해보세요.`,
        confidence: 0.8,
      });
    }
  }

  // 2. 목표 진행도 기반 제안
  const activeGoals = currentGoals.filter((g) => g.status === "active");
  if (activeGoals.length > 0) {
    const avgProgress =
      activeGoals.reduce((sum, g) => sum + (g.progress_rate || 0), 0) /
      activeGoals.length;

    if (avgProgress < 30) {
      suggestions.push({
        id: "low-progress",
        type: "goal",
        title: "목표 진행도",
        message: `현재 목표 진행도가 ${Math.round(
          avgProgress
        )}%예요. 오늘 목표 달성을 위한 구체적인 업무를 계획해보세요.`,
        confidence: 0.7,
        actionUrl: "/goals",
        actionText: "목표 확인하기",
      });
    } else if (avgProgress > 70) {
      suggestions.push({
        id: "high-progress",
        type: "goal",
        title: "목표 달성 임박!",
        message: `목표 진행도가 ${Math.round(
          avgProgress
        )}%로 높아요! 마무리 작업에 집중해보세요.`,
        confidence: 0.8,
        actionUrl: "/goals",
        actionText: "목표 확인하기",
      });
    }
  }

  // 3. 요일별 패턴 제안
  const dayOfWeek = getDay(new Date());
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const currentDay = dayNames[dayOfWeek];

  if (currentDay === "월") {
    suggestions.push({
      id: "monday-pattern",
      type: "timing",
      title: "월요일 계획",
      message: "월요일이에요! 이번 주 목표를 확인하고 주간 계획을 세워보세요.",
      confidence: 0.6,
      actionUrl: "/goals",
      actionText: "주간 계획 보기",
    });
  } else if (currentDay === "금") {
    suggestions.push({
      id: "friday-review",
      type: "timing",
      title: "금요일 정리",
      message: "금요일이에요! 이번 주 성과를 정리하고 다음 주를 준비해보세요.",
      confidence: 0.6,
      actionUrl: "/daily-report",
      actionText: "주간 정리하기",
    });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// 다음 카테고리 추천
function getNextCategory(currentCategory: string): string {
  const categoryMap: Record<string, string> = {
    개발: "테스트",
    테스트: "문서화",
    문서화: "회의",
    회의: "분석",
    분석: "개발",
  };

  return categoryMap[currentCategory] || "개발";
}
