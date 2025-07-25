// Sentry 모니터링 (선택적)
let Sentry: any = null;

try {
  Sentry = require("@sentry/nextjs");
} catch (error) {
  // Sentry가 설치되지 않은 경우 무시
  console.log("Sentry not installed, monitoring disabled");
}

export const initMonitoring = () => {
  if (process.env.NODE_ENV === "production" && Sentry) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
    });
  }
};

export const captureError = (error: Error, context?: any) => {
  if (process.env.NODE_ENV === "production" && Sentry) {
    Sentry.captureException(error, { extra: context });
  }
};
