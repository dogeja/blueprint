import { ErrorType, ErrorSeverity } from "./error-handling";

// 검증 결과 타입
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  type: ErrorType;
  severity: ErrorSeverity;
}

// 필수 필드 검증
export function validateRequired(
  value: any,
  fieldName: string
): ValidationError | null {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return {
      field: fieldName,
      message: `${fieldName}은(는) 필수 항목입니다.`,
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
    };
  }
  return null;
}

// 문자열 길이 검증
export function validateStringLength(
  value: string,
  fieldName: string,
  minLength: number,
  maxLength: number
): ValidationError | null {
  if (!value) return null;

  if (value.length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName}은(는) 최소 ${minLength}자 이상이어야 합니다.`,
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
    };
  }

  if (value.length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName}은(는) 최대 ${maxLength}자까지 입력 가능합니다.`,
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
    };
  }

  return null;
}

// 이메일 형식 검증
export function validateEmail(email: string): ValidationError | null {
  if (!email) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      field: "email",
      message: "올바른 이메일 형식을 입력해주세요.",
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
    };
  }

  return null;
}

// 시간 형식 검증
export function validateTime(time: string): ValidationError | null {
  if (!time) return null;

  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return {
      field: "time",
      message: "올바른 시간 형식을 입력해주세요. (HH:MM)",
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
    };
  }

  return null;
}

// 숫자 범위 검증
export function validateNumberRange(
  value: number,
  fieldName: string,
  min: number,
  max: number
): ValidationError | null {
  if (value < min || value > max) {
    return {
      field: fieldName,
      message: `${fieldName}은(는) ${min}에서 ${max} 사이의 값이어야 합니다.`,
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
    };
  }

  return null;
}

// 날짜 형식 검증
export function validateDate(date: string): ValidationError | null {
  if (!date) return null;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return {
      field: "date",
      message: "올바른 날짜 형식을 입력해주세요. (YYYY-MM-DD)",
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
    };
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return {
      field: "date",
      message: "유효한 날짜를 입력해주세요.",
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
    };
  }

  return null;
}

// 목표 제목 검증
export function validateTaskTitle(title: string): ValidationResult {
  const requiredError = validateRequired(title, "목표 제목");
  if (requiredError) return { isValid: false, errors: [requiredError] };

  const lengthError = validateStringLength(title, "목표 제목", 1, 200);
  if (lengthError) return { isValid: false, errors: [lengthError] };

  return { isValid: true, errors: [] };
}

// 목표 설명 검증
export function validateTaskDescription(description: string): ValidationResult {
  if (!description) return { isValid: true, errors: [] }; // 설명은 선택사항

  const lengthError = validateStringLength(description, "목표 설명", 1, 1000);
  if (lengthError) return { isValid: false, errors: [lengthError] };

  return { isValid: true, errors: [] };
}

// 예상 시간 검증
export function validateEstimatedTime(minutes: number): ValidationError | null {
  const rangeError = validateNumberRange(minutes, "예상 시간", 1, 1440); // 최대 24시간
  if (rangeError) return rangeError;

  return null;
}

// 우선순위 검증
export function validatePriority(priority: number): ValidationError | null {
  const rangeError = validateNumberRange(priority, "우선순위", 1, 5);
  if (rangeError) return rangeError;

  return null;
}

// 컨디션 점수 검증
export function validateConditionScore(score: number): ValidationError | null {
  const rangeError = validateNumberRange(score, "컨디션 점수", 1, 10);
  if (rangeError) return rangeError;

  return null;
}

// 전화번호 형식 검증
export function validatePhoneNumber(phone: string): ValidationError | null {
  if (!phone) return null;

  const phoneRegex = /^[0-9-+\s()]+$/;
  if (!phoneRegex.test(phone)) {
    return {
      field: "phone",
      message: "올바른 전화번호 형식을 입력해주세요.",
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
    };
  }

  return null;
}

// 일일보고서 기본 정보 검증
export function validateDailyReportBasicInfo(data: {
  condition_score?: number;
  yesterday_end_time?: string;
  today_start_time?: string;
  work_location?: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  // 컨디션 점수 검증
  if (data.condition_score !== undefined) {
    const conditionError = validateConditionScore(data.condition_score);
    if (conditionError) errors.push(conditionError);
  }

  // 시간 형식 검증
  if (data.yesterday_end_time) {
    const timeError = validateTime(data.yesterday_end_time);
    if (timeError) errors.push(timeError);
  }

  if (data.today_start_time) {
    const timeError = validateTime(data.today_start_time);
    if (timeError) errors.push(timeError);
  }

  // 근무 장소 길이 검증
  if (data.work_location) {
    const locationError = validateStringLength(
      data.work_location,
      "근무 장소",
      1,
      100
    );
    if (locationError) errors.push(locationError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// 목표 데이터 검증
export function validateTaskData(taskData: any): ValidationResult {
  const errors: ValidationError[] = [];

  // 제목 검증
  const titleResult = validateTaskTitle(taskData.title);
  if (!titleResult.isValid) {
    errors.push(...titleResult.errors);
  }

  // 설명 검증
  if (taskData.description) {
    const descriptionResult = validateTaskDescription(taskData.description);
    if (!descriptionResult.isValid) {
      errors.push(...descriptionResult.errors);
    }
  }

  // 예상 시간 검증
  if (taskData.estimated_time_minutes) {
    const timeError = validateEstimatedTime(taskData.estimated_time_minutes);
    if (timeError) errors.push(timeError);
  }

  // 우선순위 검증
  if (taskData.priority) {
    const priorityError = validatePriority(taskData.priority);
    if (priorityError) errors.push(priorityError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// 실시간 검증을 위한 디바운스 함수
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 필드별 에러 메시지 생성
export function getFieldErrorMessage(
  errors: ValidationError[],
  fieldName: string
): string | null {
  const fieldError = errors.find((error) => error.field === fieldName);
  return fieldError ? fieldError.message : null;
}

// 전체 검증 결과 요약
export function getValidationSummary(errors: ValidationError[]): string {
  if (errors.length === 0) return "";

  const fieldNames = errors.map((error) => error.field).join(", ");
  return `다음 필드를 확인해주세요: ${fieldNames}`;
}
