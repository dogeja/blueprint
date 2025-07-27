interface RateLimiterOptions {
  interval: number; // 시간 간격 (밀리초)
  uniqueTokenPerInterval: number; // 간격당 허용 토큰 수
}

interface TokenBucket {
  count: number;
  lastRefill: number;
}

export class RateLimiter {
  private tokens: Map<string, TokenBucket> = new Map();
  private interval: number;
  private maxTokens: number;

  constructor(options: RateLimiterOptions) {
    this.interval = options.interval;
    this.maxTokens = options.uniqueTokenPerInterval;
  }

  async check(identifier: string, limit: number): Promise<{ success: boolean; remaining: number }> {
    const now = Date.now();
    let bucket = this.tokens.get(identifier);

    if (!bucket) {
      bucket = { count: this.maxTokens, lastRefill: now };
      this.tokens.set(identifier, bucket);
    }

    // 토큰 보충 로직
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.interval) * this.maxTokens;
    
    if (tokensToAdd > 0) {
      bucket.count = Math.min(this.maxTokens, bucket.count + tokensToAdd);
      bucket.lastRefill = now;
    }

    // 요청 처리
    if (bucket.count >= limit) {
      bucket.count -= limit;
      return { success: true, remaining: bucket.count };
    }

    return { success: false, remaining: bucket.count };
  }

  // 메모리 정리 (선택적)
  cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.interval * 2; // 2배 간격 이후 정리

    this.tokens.forEach((bucket, key) => {
      if (bucket.lastRefill < cutoff) {
        this.tokens.delete(key);
      }
    });
  }
}

// 싱글톤 인스턴스
export const rateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1분
  uniqueTokenPerInterval: 100, // 분당 100개 토큰
});

// API별 제한 설정
export const API_LIMITS = {
  auth: 5, // 인증 관련: 분당 5회
  goals: 20, // 목표 CRUD: 분당 20회
  reports: 30, // 일일 보고서: 분당 30회
  analytics: 10, // 분석 데이터: 분당 10회
  general: 60, // 일반 API: 분당 60회
} as const;