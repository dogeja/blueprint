import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/stores/ui-store";

const keyMap: Record<string, string> = {
  "g+d": "/dashboard",
  "g+r": "/daily-report",
  "g+g": "/goals",
  "g+a": "/analytics",
  "g+s": "/settings",
};

export function useGlobalHotkeys() {
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const keyBuffer = useRef<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // input, textarea, contenteditable에서는 무시
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (
        ["input", "textarea"].includes(tag) ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // ESC: 사이드바/모달 닫기
      if (e.key === "Escape") {
        if (sidebarOpen) setSidebarOpen(false);
        // TODO: 모달 닫기 등 추가 가능
        return;
      }

      // g + ... 단축키
      keyBuffer.current.push(e.key.toLowerCase());
      if (keyBuffer.current.length > 2) keyBuffer.current.shift();
      const combo = keyBuffer.current.join("+");
      if (keyMap[combo]) {
        router.push(keyMap[combo]);
        keyBuffer.current = [];
        e.preventDefault();
        return;
      }
    };
    const handleKeyUp = () => {
      // 1초 내 입력 없으면 버퍼 초기화
      setTimeout(() => {
        keyBuffer.current = [];
      }, 1000);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [router, sidebarOpen, setSidebarOpen]);
}
