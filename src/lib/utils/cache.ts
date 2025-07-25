// 캐싱 전략 유틸리티

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
}

interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

class LRUCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  set(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    // 캐시가 가득 찬 경우 가장 오래된 항목 제거
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // TTL 확인
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // LRU: 사용된 항목을 맨 뒤로 이동
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // 만료된 항목들 정리
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// 전역 캐시 인스턴스들
const dataCache = new LRUCache<any>(200);
const apiCache = new LRUCache<any>(100);

// 데이터 캐싱 함수
export const cacheData = <T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): void => {
  const { ttl = 5 * 60 * 1000 } = options; // 기본 5분
  dataCache.set(key, data, ttl);
};

// 캐시된 데이터 조회
export const getCachedData = <T>(key: string): T | null => {
  return dataCache.get(key);
};

// API 응답 캐싱
export const cacheApiResponse = <T>(
  url: string,
  response: T,
  options: CacheOptions = {}
): void => {
  const { ttl = 2 * 60 * 1000 } = options; // 기본 2분
  apiCache.set(url, response, ttl);
};

// 캐시된 API 응답 조회
export const getCachedApiResponse = <T>(url: string): T | null => {
  return apiCache.get(url);
};

// 캐시 키 생성
export const createCacheKey = (...parts: (string | number)[]): string => {
  return parts.join(":");
};

// 캐시 무효화
export const invalidateCache = (pattern: string): void => {
  // 패턴에 맞는 모든 캐시 항목 삭제
  const keys = Array.from(dataCache["cache"].keys());
  keys.forEach((key) => {
    if (key.includes(pattern)) {
      dataCache.delete(key);
    }
  });
};

// 캐시 통계
export const getCacheStats = () => {
  return {
    dataCacheSize: dataCache.size(),
    apiCacheSize: apiCache.size(),
  };
};

// 주기적 캐시 정리 (5분마다)
if (typeof window !== "undefined") {
  setInterval(() => {
    dataCache.cleanup();
    apiCache.cleanup();
  }, 5 * 60 * 1000);
}

// 로컬 스토리지 캐싱
export const localStorageCache = {
  set: <T>(key: string, value: T, ttl: number = 24 * 60 * 60 * 1000): void => {
    if (typeof window === "undefined") return;

    const item = {
      value,
      timestamp: Date.now(),
      ttl,
    };

    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn("Failed to cache in localStorage:", error);
    }
  },

  get: <T>(key: string): T | null => {
    if (typeof window === "undefined") return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const { value, timestamp, ttl } = JSON.parse(item);

      if (Date.now() - timestamp > ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return value;
    } catch (error) {
      console.warn("Failed to get from localStorage cache:", error);
      return null;
    }
  },

  delete: (key: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },

  clear: (): void => {
    if (typeof window === "undefined") return;
    localStorage.clear();
  },
};
