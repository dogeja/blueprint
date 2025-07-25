# Blueprint 프로젝트 개요

## 🎯 **프로젝트 소개**

**Blueprint**는 개인의 일일 업무 관리와 목표 추적을 위한 웹 애플리케이션입니다. 매일의 작은 걸음으로 마라톤을 완주하는 것처럼, 지속적인 개선과 목표 달성을 지원합니다.

### **핵심 가치**

- 📝 **일일 기록**: 매일의 업무와 성찰을 체계적으로 기록
- 🎯 **목표 추적**: 장기 목표와 일일 업무의 연결성 강화
- 📊 **데이터 기반**: 분석을 통한 개인 생산성 향상
- 🔄 **지속적 개선**: 회고를 통한 자기 발전

## 🏗️ **아키텍처 개요**

### **프론트엔드**

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/            # 메인 레이아웃 그룹
│   │   ├── dashboard/     # 대시보드
│   │   ├── daily-report/  # 일일보고
│   │   ├── goals/         # 목표 관리
│   │   ├── goal-tree/     # 목표 트리
│   │   ├── analytics/     # 분석
│   │   └── settings/      # 설정
│   └── auth/              # 인증
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   ├── dashboard/        # 대시보드 관련
│   ├── daily-report/     # 일일보고 관련
│   └── layout/           # 레이아웃 컴포넌트
├── lib/                  # 유틸리티 및 설정
│   ├── stores/           # Zustand 상태 관리
│   ├── utils/            # 유틸리티 함수
│   └── database/         # 데이터베이스 관련
└── types/                # TypeScript 타입 정의
```

### **백엔드**

- **Supabase**: PostgreSQL 데이터베이스
- **인증**: Supabase Auth
- **실시간**: Supabase Realtime
- **스토리지**: Supabase Storage

## 📊 **주요 기능**

### 1. **대시보드**

- 📈 실시간 성과 지표
- 📊 주간/월간 진행률 차트
- 🎯 목표 진행 상황
- ⚡ 빠른 액션 버튼

### 2. **일일보고**

- 📝 업무 계획 및 기록
- 📞 통화 기록
- 🤔 일일 회고
- 📋 템플릿 시스템

### 3. **목표 관리**

- 🎯 연간/월간/주간/일간 목표
- 🌳 목표 트리 구조
- 📊 목표별 진행률
- 🔗 업무와 목표 연결

### 4. **분석**

- 📊 생산성 분석
- 📈 트렌드 분석
- 🎯 목표 달성률
- 💡 AI 기반 인사이트

## 🛠️ **기술 스택**

### **프론트엔드**

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

### **상태 관리**

- **Global State**: Zustand
- **Form**: React Hook Form + Zod
- **HTTP Client**: Supabase Client

### **백엔드**

- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage

### **배포 & 인프라**

- **Hosting**: Vercel
- **PWA**: next-pwa
- **Monitoring**: Sentry (선택적)
- **Analytics**: Bundle Analyzer

## 📈 **성능 최적화 현황**

### **완료된 최적화**

- ✅ 번들 크기 최적화 (Vendor 청크 분리)
- ✅ 코드 스플리팅 (Lazy loading)
- ✅ Tree shaking 강화
- ✅ 성능 모니터링 도구 추가
- ✅ 캐싱 전략 구현
- ✅ React.memo 최적화

### **성능 지표**

- **First Load JS**: ~474kB (평균)
- **Bundle Size**: 최적화 완료
- **Build Time**: 개선됨
- **Type Safety**: 100% TypeScript

## 🔄 **개발 워크플로우**

### **개발 환경**

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run lint         # 코드 린팅
npm run type-check   # 타입 체크
```

### **코드 품질**

- **ESLint**: 코드 스타일 검사
- **TypeScript**: 타입 안정성
- **Prettier**: 코드 포맷팅
- **Husky**: Git hooks

## 📋 **데이터베이스 스키마**

### **주요 테이블**

- `profiles`: 사용자 프로필
- `daily_reports`: 일일보고
- `tasks`: 업무 항목
- `goals`: 목표
- `reflections`: 회고
- `phone_calls`: 통화 기록

### **관계**

- 사용자 ↔ 일일보고 (1:N)
- 일일보고 ↔ 업무 (1:N)
- 목표 ↔ 업무 (1:N)
- 일일보고 ↔ 회고 (1:1)

## 🚀 **배포 정보**

### **프로덕션 환경**

- **URL**: [배포 URL]
- **Platform**: Vercel
- **Database**: Supabase
- **CDN**: Vercel Edge Network

### **환경 변수**

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SENTRY_DSN=
```

## 📝 **문서화**

### **기술 문서**

- `docs/database-erd.md`: 데이터베이스 ERD
- `docs/database-schema.sql`: 데이터베이스 스키마
- `docs/performance-optimization.md`: 성능 최적화 보고서
- `docs/project-overview.md`: 프로젝트 개요 (현재 문서)

### **가이드**

- `THEME_GUIDE.md`: 테마 가이드
- `README.md`: 프로젝트 소개

## 🔮 **향후 계획**

### **Phase 1: API 개발 (1-2주)**

- REST API 엔드포인트 구축
- 웹훅 시스템
- 데이터 내보내기/가져오기

### **Phase 2: 외부 연동 (2-3주)**

- Slack 연동
- Google Calendar 연동
- 이메일 알림 시스템

### **Phase 3: 플러그인 시스템 (3-4주)**

- 플러그인 아키텍처
- 시간 추적 플러그인
- 팀 협업 플러그인

### **Phase 4: AI 기능 (4-5주)**

- GPT 연동
- 예측 분석
- 개인화 엔진

---

**프로젝트 시작일**: 2024년  
**현재 버전**: 1.0.0  
**상태**: 🟢 활성 개발 중
