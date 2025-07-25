# 개발자 가이드

## 🚀 **시작하기**

### **환경 설정**

```bash
# 저장소 클론
git clone [repository-url]
cd blueprint

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### **필수 환경 변수**

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🏗️ **프로젝트 구조**

### **디렉토리 구조**

```
blueprint/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/            # 메인 레이아웃 그룹
│   │   ├── auth/              # 인증 페이지
│   │   ├── api/               # API 라우트
│   │   ├── globals.css        # 전역 스타일
│   │   └── layout.tsx         # 루트 레이아웃
│   ├── components/            # React 컴포넌트
│   │   ├── ui/               # 기본 UI 컴포넌트
│   │   ├── dashboard/        # 대시보드 컴포넌트
│   │   ├── daily-report/     # 일일보고 컴포넌트
│   │   └── layout/           # 레이아웃 컴포넌트
│   ├── lib/                  # 유틸리티 및 설정
│   │   ├── stores/           # Zustand 스토어
│   │   ├── utils/            # 유틸리티 함수
│   │   ├── database/         # 데이터베이스 관련
│   │   └── supabase.ts       # Supabase 클라이언트
│   └── types/                # TypeScript 타입
├── public/                   # 정적 파일
├── docs/                     # 문서
└── package.json
```

## 🛠️ **개발 도구**

### **주요 스크립트**

```bash
npm run dev          # 개발 서버 실행 (http://localhost:3000)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # ESLint 실행
npm run type-check   # TypeScript 타입 체크
```

### **성능 분석**

```bash
# 번들 분석
ANALYZE=true npm run build

# 성능 모니터링
# 브라우저 개발자 도구에서 성능 탭 확인
```

## 📝 **코딩 컨벤션**

### **TypeScript**

- 엄격한 타입 체크 사용
- 인터페이스 우선 설계
- 제네릭 활용
- 유니온 타입 적극 활용

### **React**

- 함수형 컴포넌트 사용
- Hooks 우선 사용
- React.memo로 불필요한 리렌더링 방지
- Suspense와 lazy loading 활용

### **스타일링**

- Tailwind CSS 클래스 우선
- 컴포넌트별 스타일 모듈화
- 반응형 디자인 고려
- 다크모드 지원

### **파일 명명 규칙**

```
components/
├── ui/                    # 기본 UI 컴포넌트
│   ├── button.tsx
│   ├── input.tsx
│   └── card.tsx
├── dashboard/             # 기능별 컴포넌트
│   ├── stats-cards.tsx
│   └── recent-activity.tsx
└── layout/               # 레이아웃 컴포넌트
    ├── sidebar.tsx
    └── header.tsx
```

## 🔧 **상태 관리**

### **Zustand 스토어 구조**

```typescript
// src/lib/stores/example-store.ts
import { create } from "zustand";

interface ExampleState {
  data: any[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchData: () => Promise<void>;
  setData: (data: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useExampleStore = create<ExampleState>((set, get) => ({
  data: [],
  loading: false,
  error: null,

  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      // API 호출
      const data = await fetchExampleData();
      set({ data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
```

### **스토어 사용법**

```typescript
// 컴포넌트에서 사용
import { useExampleStore } from "@/lib/stores/example-store";

export function ExampleComponent() {
  const { data, loading, error, fetchData } = useExampleStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return <div>{/* 데이터 렌더링 */}</div>;
}
```

## 🗄️ **데이터베이스**

### **Supabase 클라이언트**

```typescript
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### **데이터베이스 서비스**

```typescript
// src/lib/database/example-service.ts
import { supabase } from "@/lib/supabase";

export class ExampleService {
  static async getData() {
    const { data, error } = await supabase.from("table_name").select("*");

    if (error) throw error;
    return data;
  }

  static async createData(payload: any) {
    const { data, error } = await supabase
      .from("table_name")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
```

## 🎨 **UI 컴포넌트**

### **기본 UI 컴포넌트**

```typescript
// src/components/ui/button.tsx
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          // variant styles
          variant === "default" &&
            "bg-primary text-primary-foreground hover:bg-primary/90",
          variant === "outline" &&
            "border border-input bg-background hover:bg-accent",
          variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
          // size styles
          size === "sm" && "h-8 px-3 text-sm",
          size === "md" && "h-10 px-4 py-2",
          size === "lg" && "h-12 px-8 text-lg",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### **유틸리티 함수**

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}
```

## 🔍 **디버깅**

### **개발자 도구**

- **React DevTools**: 컴포넌트 상태 확인
- **Redux DevTools**: Zustand 스토어 상태 확인
- **Network 탭**: API 호출 확인
- **Performance 탭**: 성능 분석

### **로깅**

```typescript
// 개발 환경에서만 로그 출력
if (process.env.NODE_ENV === "development") {
  console.log("Debug info:", data);
}

// 성능 측정
import { measureRenderTime } from "@/lib/utils/performance";

const optimizedComponent = measureRenderTime(Component, "ComponentName");
```

## 🧪 **테스팅**

### **테스트 구조**

```
__tests__/
├── components/           # 컴포넌트 테스트
├── lib/                 # 유틸리티 테스트
└── integration/         # 통합 테스트
```

### **테스트 예시**

```typescript
// __tests__/components/ui/button.test.tsx
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
```

## 🚀 **배포**

### **Vercel 배포**

1. GitHub 저장소 연결
2. 환경 변수 설정
3. 자동 배포 설정

### **환경 변수**

```env
# Production
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SENTRY_DSN=
```

## 📚 **유용한 리소스**

### **문서**

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

### **도구**

- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind CSS Playground](https://play.tailwindcss.com)
- [Supabase Dashboard](https://app.supabase.com)

---

**마지막 업데이트**: 2024년 현재  
**버전**: 1.0.0
