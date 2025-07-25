# PWA 배포 체크리스트

## 🚀 **배포 전 준비사항**

### **1. 환경 변수 설정**

```env
# .env.local (개발용)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# Vercel 환경 변수 (프로덕션용)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

### **2. VAPID 키 생성**

```bash
# web-push 설치
npm install web-push

# VAPID 키 생성
npm run generate-vapid

# 생성된 키를 환경 변수에 추가
```

### **3. 데이터베이스 스키마 업데이트**

```sql
-- Supabase에서 실행
-- push_subscriptions 테이블 생성
-- RLS 정책 설정
-- 트리거 설정
```

### **4. PWA 아이콘 준비**

- [ ] `/public/icons/` 폴더에 모든 크기의 아이콘 준비
- [ ] 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- [ ] maskable 아이콘 포함
- [ ] 스크린샷 준비 (선택사항)

## ✅ **PWA 필수 요구사항 체크**

### **기본 요구사항**

- [x] **HTTPS**: Vercel에서 자동 제공
- [x] **Web App Manifest**: `/public/manifest.json` ✅
- [x] **Service Worker**: `next-pwa`로 자동 생성 ✅
- [x] **Responsive Design**: Tailwind CSS로 구현 ✅

### **고급 기능**

- [x] **Offline Support**: Service Worker 캐싱 ✅
- [x] **Installable**: manifest.json 설정 완료 ✅
- [x] **Push Notifications**: 구현 완료 ✅
- [x] **Background Sync**: 준비됨 ✅

## 🔧 **배포 단계**

### **1. 로컬 테스트**

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# PWA 기능 테스트
# - 브라우저에서 "설치" 버튼 확인
# - 오프라인 모드 테스트
# - 푸시 알림 테스트
```

### **2. 빌드 테스트**

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 확인
# - Service Worker 파일 생성 확인
# - 번들 크기 확인
# - 오류 없음 확인
```

### **3. Vercel 배포**

```bash
# Git에 푸시
git add .
git commit -m "Add PWA and push notification features"
git push origin main

# Vercel에서 자동 배포 확인
# - 배포 URL 확인
# - 환경 변수 설정 확인
# - HTTPS 자동 적용 확인
```

## 📱 **PWA 테스트 체크리스트**

### **설치 테스트**

- [ ] 브라우저에서 "설치" 버튼 표시
- [ ] 홈 화면에 앱 아이콘 추가 가능
- [ ] 앱 실행 시 전체 화면 모드
- [ ] 스플래시 스크린 표시

### **오프라인 테스트**

- [ ] 네트워크 끊김 후 앱 동작 확인
- [ ] 오프라인 페이지 표시
- [ ] 네트워크 복구 후 동기화

### **푸시 알림 테스트**

- [ ] 알림 권한 요청
- [ ] 테스트 알림 전송
- [ ] 매일 아침 8시 알림 스케줄링
- [ ] 알림 클릭 시 앱 열기

### **성능 테스트**

- [ ] Lighthouse PWA 점수 90+ 확인
- [ ] First Contentful Paint < 2초
- [ ] Largest Contentful Paint < 2.5초
- [ ] Cumulative Layout Shift < 0.1

## 🎯 **배포 후 확인사항**

### **기술적 확인**

- [ ] HTTPS 자동 리다이렉트
- [ ] Service Worker 등록 성공
- [ ] 푸시 알림 구독 성공
- [ ] 데이터베이스 연결 정상

### **사용자 경험 확인**

- [ ] 모바일에서 앱처럼 동작
- [ ] 터치 제스처 지원
- [ ] 키보드 접근성
- [ ] 다크모드 지원

### **모니터링 설정**

- [ ] Vercel Analytics 활성화
- [ ] 에러 로깅 설정
- [ ] 성능 모니터링 설정
- [ ] 사용자 피드백 수집

## 🚨 **문제 해결**

### **일반적인 문제들**

1. **Service Worker 등록 실패**

   - HTTPS 확인
   - 파일 경로 확인
   - 브라우저 지원 확인

2. **푸시 알림 작동 안함**

   - VAPID 키 확인
   - 권한 상태 확인
   - 구독 정보 확인

3. **PWA 설치 안됨**
   - manifest.json 유효성 확인
   - HTTPS 확인
   - 브라우저 캐시 클리어

### **디버깅 도구**

- Chrome DevTools > Application 탭
- Lighthouse PWA 감사
- Service Worker 디버깅
- Push API 디버깅

## 📊 **성공 지표**

### **기술적 지표**

- PWA 점수: 90+
- 성능 점수: 90+
- 접근성 점수: 90+
- SEO 점수: 90+

### **사용자 지표**

- 설치율: > 10%
- 알림 구독율: > 30%
- 오프라인 사용률: > 5%
- 사용자 만족도: > 4.5/5

---

**체크리스트 완료일**: 배포 전  
**담당자**: 개발팀  
**상태**: 🔄 진행 중
