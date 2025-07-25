"use client";

import { useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { usePWAInstall } from "@/lib/hooks/use-pwa-install";
import { useToastStore } from "./toast";

export function PWAInstallFAB() {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall();
  const { addToast } = useToastStore();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // 이미 설치되었거나 설치할 수 없으면 표시하지 않음
  if (isInstalled || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installPWA();
      if (success) {
        addToast({
          type: "success",
          title: "앱이 성공적으로 설치되었습니다! 🎉",
          message: "이제 홈 화면에서 바로 접근할 수 있어요.",
        });
      } else {
        addToast({
          type: "info",
          title: "설치가 취소되었습니다",
          message: "언제든지 다시 설치할 수 있어요.",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "설치 중 오류가 발생했습니다",
        message: "잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className='fixed bottom-20 right-4 z-40'>
      {/* 툴팁 */}
      {showTooltip && (
        <div className='absolute bottom-full right-0 mb-2 w-64'>
          <Card className='bg-white shadow-lg border-0'>
            <CardContent className='p-3'>
              <div className='flex items-start space-x-2'>
                <Smartphone className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
                <div className='flex-1'>
                  <h4 className='text-sm font-semibold text-gray-900'>
                    앱으로 설치하세요!
                  </h4>
                  <p className='text-xs text-gray-600 mt-1'>
                    홈 화면에 추가하여 더 편리하게 사용하세요.
                  </p>
                  <div className='flex items-center space-x-4 mt-2 text-xs text-gray-500'>
                    <span>🔔 매일 알림</span>
                    <span>⚡ 빠른 접근</span>
                  </div>
                </div>
                <Button
                  onClick={() => setShowTooltip(false)}
                  variant='ghost'
                  size='sm'
                  className='h-6 w-6 p-0'
                >
                  <X className='w-3 h-3' />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 플로팅 버튼 */}
      <Button
        onClick={handleInstall}
        disabled={isInstalling}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className='w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'
        size='lg'
      >
        <Download className='w-6 h-6' />
      </Button>
    </div>
  );
}
