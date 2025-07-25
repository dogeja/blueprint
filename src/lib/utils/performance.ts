// 성능 모니터링 유틸리티

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
}

// 페이지 로드 시간 측정
export const measurePageLoadTime = (): number => {
  if (typeof window === "undefined") return 0;

  const navigation = performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming;
  if (navigation) {
    return navigation.loadEventEnd - navigation.loadEventStart;
  }

  return performance.now();
};

// First Contentful Paint 측정
export const measureFCP = (): Promise<number> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(0);
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcp = entries.find(
        (entry) => entry.name === "first-contentful-paint"
      );
      if (fcp) {
        resolve(fcp.startTime);
        observer.disconnect();
      }
    });

    observer.observe({ entryTypes: ["paint"] });
  });
};

// Largest Contentful Paint 측정
export const measureLCP = (): Promise<number> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(0);
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcp = entries[entries.length - 1];
      if (lcp) {
        resolve(lcp.startTime);
        observer.disconnect();
      }
    });

    observer.observe({ entryTypes: ["largest-contentful-paint"] });
  });
};

// Cumulative Layout Shift 측정
export const measureCLS = (): Promise<number> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(0);
      return;
    }

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
    });

    observer.observe({ entryTypes: ["layout-shift"] });

    // 5초 후 최종 CLS 값 반환
    setTimeout(() => {
      observer.disconnect();
      resolve(clsValue);
    }, 5000);
  });
};

// 전체 성능 메트릭 수집
export const collectPerformanceMetrics =
  async (): Promise<PerformanceMetrics> => {
    const [fcp, lcp, cls] = await Promise.all([
      measureFCP(),
      measureLCP(),
      measureCLS(),
    ]);

    return {
      loadTime: measurePageLoadTime(),
      firstContentfulPaint: fcp,
      largestContentfulPaint: lcp,
      cumulativeLayoutShift: cls,
    };
  };

// 성능 메트릭 로깅
export const logPerformanceMetrics = async (pageName: string) => {
  try {
    const metrics = await collectPerformanceMetrics();

    console.log(`Performance Metrics for ${pageName}:`, {
      loadTime: `${metrics.loadTime.toFixed(2)}ms`,
      fcp: `${metrics.firstContentfulPaint.toFixed(2)}ms`,
      lcp: `${metrics.largestContentfulPaint.toFixed(2)}ms`,
      cls: metrics.cumulativeLayoutShift.toFixed(3),
    });

    // 개발 환경에서만 콘솔에 출력
    if (process.env.NODE_ENV === "development") {
      console.table(metrics);
    }
  } catch (error) {
    console.error("Failed to collect performance metrics:", error);
  }
};

// 컴포넌트 렌더링 시간 측정
export const measureRenderTime = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();

    if (process.env.NODE_ENV === "development") {
      console.log(`${name} render time: ${(end - start).toFixed(2)}ms`);
    }

    return result;
  }) as T;
};

// 메모리 사용량 측정
export const getMemoryUsage = () => {
  if (typeof window === "undefined" || !("memory" in performance)) {
    return null;
  }

  const memory = (performance as any).memory;
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
  };
};
