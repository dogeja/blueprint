// PWA 관련 타입 정의
export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: "standalone" | "fullscreen" | "minimal-ui" | "browser";
  orientation: "portrait" | "landscape" | "any";
  scope: string;
  startUrl: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: "any" | "maskable";
  }>;
}

// 기본 PWA 설정
export const defaultPWAConfig: PWAConfig = {
  name: "청사진 - 인생의 푸른 설계도",
  shortName: "청사진",
  description: "매일의 작은 걸음으로 마라톤 완주하기",
  themeColor: "#0f172a",
  backgroundColor: "#ffffff",
  display: "standalone",
  orientation: "portrait",
  scope: "/",
  startUrl: "/",
  icons: [
    {
      src: "/icons/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any maskable",
    },
    {
      src: "/icons/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable",
    },
  ],
};

// PWA 설치 가능 여부 확인
export function isPWAInstallable(): boolean {
  if (typeof window === "undefined") return false;

  // iOS Safari
  if (
    navigator.userAgent.includes("iPhone") ||
    navigator.userAgent.includes("iPad")
  ) {
    return true;
  }

  // Android Chrome
  if (
    navigator.userAgent.includes("Android") &&
    navigator.userAgent.includes("Chrome")
  ) {
    return true;
  }

  // 데스크탑 브라우저
  return "serviceWorker" in navigator && "PushManager" in window;
}

// PWA 설치 프롬프트 표시
export function showPWAInstallPrompt(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    // iOS Safari의 경우 수동 설치 안내
    if (
      navigator.userAgent.includes("iPhone") ||
      navigator.userAgent.includes("iPad")
    ) {
      const confirmed = confirm(
        "홈 화면에 추가하려면 Safari 메뉴에서 '홈 화면에 추가'를 선택하세요."
      );
      resolve(confirmed);
      return;
    }

    // Android Chrome의 경우 자동 설치
    if (
      navigator.userAgent.includes("Android") &&
      navigator.userAgent.includes("Chrome")
    ) {
      // Chrome의 beforeinstallprompt 이벤트를 기다림
      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        e.prompt();
        e.userChoice.then((choiceResult: any) => {
          resolve(choiceResult.outcome === "accepted");
        });
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      // 5초 후 타임아웃
      setTimeout(() => {
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
        resolve(false);
      }, 5000);
    } else {
      resolve(false);
    }
  });
}

// 서비스 워커 등록
export async function registerServiceWorker(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service Worker registered:", registration);
    return true;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    return false;
  }
}

// 푸시 알림 권한 요청
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Failed to request notification permission:", error);
    return "denied";
  }
}

// 푸시 알림 구독
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    console.log("Push notification subscription:", subscription);
    return subscription;
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
    return null;
  }
}

// 오프라인 상태 감지
export function isOnline(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}

// 오프라인 이벤트 리스너
export function onOnlineStatusChange(
  callback: (isOnline: boolean) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

// 앱 설치 상태 확인
export function isPWAInstalled(): boolean {
  if (typeof window === "undefined") return false;

  // iOS Safari
  if (
    navigator.userAgent.includes("iPhone") ||
    navigator.userAgent.includes("iPad")
  ) {
    return window.navigator.standalone === true;
  }

  // Android Chrome
  if (
    navigator.userAgent.includes("Android") &&
    navigator.userAgent.includes("Chrome")
  ) {
    return window.matchMedia("(display-mode: standalone)").matches;
  }

  // 데스크탑 브라우저
  return window.matchMedia("(display-mode: standalone)").matches;
}

// PWA 설치 안내 표시
export function showPWAInstallGuide(): void {
  if (typeof window === "undefined") return;

  const isIOS =
    navigator.userAgent.includes("iPhone") ||
    navigator.userAgent.includes("iPad");
  const isAndroid = navigator.userAgent.includes("Android");
  const isChrome = navigator.userAgent.includes("Chrome");

  let message = "";

  if (isIOS) {
    message = "Safari에서 공유 버튼을 누르고 '홈 화면에 추가'를 선택하세요.";
  } else if (isAndroid && isChrome) {
    message = "Chrome 메뉴에서 '홈 화면에 추가'를 선택하세요.";
  } else {
    message = "브라우저의 설치 옵션을 사용하여 앱을 설치하세요.";
  }

  alert(message);
}
