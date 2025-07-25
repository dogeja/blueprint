import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // PWA 설치 가능 여부 확인
    const checkInstallable = () => {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      setIsInstalled(isStandalone);

      // iOS에서는 다른 방식으로 확인
      if (isIOS) {
        const isInStandaloneMode = (window.navigator as any).standalone;
        setIsInstalled(isInStandaloneMode);
      }
    };

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);

      // 첫 방문 시 설치 프롬프트 표시
      const hasSeenInstallPrompt = localStorage.getItem(
        "pwa-install-prompt-seen"
      );
      if (!hasSeenInstallPrompt) {
        setShowInstallPrompt(true);
        localStorage.setItem("pwa-install-prompt-seen", "true");
      }
    };

    // appinstalled 이벤트 리스너
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);

      // 설치 완료 로그
      console.log("PWA was installed");
    };

    // 이벤트 리스너 등록
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // 초기 상태 확인
    checkInstallable();

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // 설치 프롬프트 실행
  const installPWA = async () => {
    if (!deferredPrompt) {
      console.log("Install prompt not available");
      return false;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
        setIsInstalled(true);
        setIsInstallable(false);
        setShowInstallPrompt(false);
        return true;
      } else {
        console.log("User dismissed the install prompt");
        return false;
      }
    } catch (error) {
      console.error("Error during PWA installation:", error);
      return false;
    } finally {
      setDeferredPrompt(null);
    }
  };

  // 설치 프롬프트 숨기기
  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
  };

  // 설치 프롬프트 다시 표시
  const showInstallPromptAgain = () => {
    setShowInstallPrompt(true);
  };

  return {
    isInstallable,
    isInstalled,
    showInstallPrompt,
    installPWA,
    dismissInstallPrompt,
    showInstallPromptAgain,
  };
}
