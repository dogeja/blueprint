// 에러 타입 정의
export enum ErrorType {
  NETWORK = "NETWORK",
  AUTHENTICATION = "AUTHENTICATION",
  VALIDATION = "VALIDATION",
  DATABASE = "DATABASE",
  UNKNOWN = "UNKNOWN",
}

export enum ErrorSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  originalError?: any;
  context?: any;
  retryable: boolean;
  retryCount?: number;
  maxRetries?: number;
}

// 에러 메시지 매핑
const ERROR_MESSAGES = {
  [ErrorType.NETWORK]: {
    title: "네트워크 오류",
    messages: {
      timeout: "요청 시간이 초과되었습니다. 인터넷 연결을 확인해주세요.",
      offline: "인터넷 연결이 끊어졌습니다. 연결을 확인해주세요.",
      server: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
      default: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    },
  },
  [ErrorType.AUTHENTICATION]: {
    title: "인증 오류",
    messages: {
      expired: "로그인이 만료되었습니다. 다시 로그인해주세요.",
      invalid: "로그인 정보가 올바르지 않습니다.",
      unauthorized: "접근 권한이 없습니다.",
      default: "인증 오류가 발생했습니다. 다시 로그인해주세요.",
    },
  },
  [ErrorType.VALIDATION]: {
    title: "입력 오류",
    messages: {
      required: "필수 항목을 입력해주세요.",
      format: "입력 형식이 올바르지 않습니다.",
      length: "입력 길이가 올바르지 않습니다.",
      default: "입력 내용을 확인해주세요.",
    },
  },
  [ErrorType.DATABASE]: {
    title: "데이터 오류",
    messages: {
      notFound: "요청한 데이터를 찾을 수 없습니다.",
      conflict: "데이터 충돌이 발생했습니다.",
      constraint: "데이터 제약 조건을 위반했습니다.",
      default: "데이터 처리 중 오류가 발생했습니다.",
    },
  },
  [ErrorType.UNKNOWN]: {
    title: "알 수 없는 오류",
    messages: {
      default: "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    },
  },
};

// Supabase 에러를 AppError로 변환
export function convertSupabaseError(error: any, context?: any): AppError {
  const errorMessage =
    error?.message || error?.error_description || "알 수 없는 오류";

  // 네트워크 관련 에러
  if (error?.code === "PGRST301" || error?.code === "PGRST302") {
    return {
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.HIGH,
      message: errorMessage,
      userMessage: ERROR_MESSAGES[ErrorType.NETWORK].messages.server,
      originalError: error,
      context,
      retryable: true,
      maxRetries: 3,
    };
  }

  // 인증 관련 에러
  if (error?.status === 401 || error?.code === "PGRST116") {
    return {
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      message: errorMessage,
      userMessage: ERROR_MESSAGES[ErrorType.AUTHENTICATION].messages.expired,
      originalError: error,
      context,
      retryable: false,
    };
  }

  // 데이터베이스 관련 에러
  if (error?.code?.startsWith("PGRST")) {
    return {
      type: ErrorType.DATABASE,
      severity: ErrorSeverity.MEDIUM,
      message: errorMessage,
      userMessage: ERROR_MESSAGES[ErrorType.DATABASE].messages.default,
      originalError: error,
      context,
      retryable: true,
      maxRetries: 2,
    };
  }

  // 기본 에러
  return {
    type: ErrorType.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    message: errorMessage,
    userMessage: ERROR_MESSAGES[ErrorType.UNKNOWN].messages.default,
    originalError: error,
    context,
    retryable: false,
  };
}

// 네트워크 상태 확인
export function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine;
}

// 재시도 가능한 에러인지 확인
export function isRetryableError(error: AppError): boolean {
  return error.retryable && (error.retryCount || 0) < (error.maxRetries || 1);
}

// 지수 백오프를 사용한 재시도 지연 시간 계산
export function getRetryDelay(
  retryCount: number,
  baseDelay: number = 1000
): number {
  return Math.min(baseDelay * Math.pow(2, retryCount), 10000);
}

// 에러 로깅
export function logError(error: AppError): void {
  if (process.env.NODE_ENV === "development") {
    console.error("App Error:", {
      type: error.type,
      severity: error.severity,
      message: error.message,
      userMessage: error.userMessage,
      context: error.context,
      retryCount: error.retryCount,
      originalError: error.originalError,
    });
  }

  // 프로덕션에서는 에러 추적 서비스로 전송
  if (process.env.NODE_ENV === "production") {
    // Sentry나 다른 에러 추적 서비스로 전송
    console.error("Production Error:", error);
  }
}

// 사용자 친화적 에러 메시지 생성
export function getUserFriendlyMessage(error: AppError): string {
  return error.userMessage;
}

// 에러 해결 방법 제안
export function getErrorResolution(error: AppError): string[] {
  const resolutions: string[] = [];

  switch (error.type) {
    case ErrorType.NETWORK:
      resolutions.push("인터넷 연결을 확인해주세요");
      resolutions.push("잠시 후 다시 시도해주세요");
      if (error.retryable) {
        resolutions.push("자동으로 재시도됩니다");
      }
      break;

    case ErrorType.AUTHENTICATION:
      resolutions.push("다시 로그인해주세요");
      resolutions.push("브라우저를 새로고침해주세요");
      break;

    case ErrorType.VALIDATION:
      resolutions.push("입력 내용을 다시 확인해주세요");
      resolutions.push("필수 항목이 모두 입력되었는지 확인해주세요");
      break;

    case ErrorType.DATABASE:
      resolutions.push("잠시 후 다시 시도해주세요");
      if (error.retryable) {
        resolutions.push("자동으로 재시도됩니다");
      }
      break;

    default:
      resolutions.push("페이지를 새로고침해주세요");
      resolutions.push("잠시 후 다시 시도해주세요");
  }

  return resolutions;
}
