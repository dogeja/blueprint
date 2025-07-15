import * as Sentry from "@sentry/nextjs";

export const initMonitoring = () => {
  if (process.env.NODE_ENV === "production") {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
    });
  }
};

export const captureError = (error: Error, context?: any) => {
  if (process.env.NODE_ENV === "production") {
    Sentry.captureException(error, { extra: context });
  }
};
