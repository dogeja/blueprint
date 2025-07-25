"use client";

import { useState } from "react";
import { X, Download, Smartphone, Bell, Zap } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { usePWAInstall } from "@/lib/hooks/use-pwa-install";
import { useToastStore } from "./toast";

export function PWAInstallBanner() {
  const {
    isInstallable,
    isInstalled,
    showInstallPrompt,
    installPWA,
    dismissInstallPrompt,
  } = usePWAInstall();
  const { addToast } = useToastStore();
  const [isInstalling, setIsInstalling] = useState(false);

  // 이미 설치되었거나 설치할 수 없으면 표시하지 않음
  if (isInstalled || !isInstallable || !showInstallPrompt) {
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
          message: "언제든지 설정에서 다시 설치할 수 있어요.",
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

  const handleDismiss = () => {
    dismissInstallPrompt();
    addToast({
      type: "info",
      title: "설치 안내를 닫았습니다",
      message: "설정에서 언제든지 앱을 설치할 수 있어요.",
    });
  };

  return (
    <div className='fixed top-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'>
      <Card className='border-0 bg-white/10 backdrop-blur-sm'>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='flex-shrink-0'>
                <Smartphone className='w-8 h-8 text-white' />
              </div>
              <div className='flex-1'>
                <h3 className='text-lg font-semibold text-white'>
                  앱으로 설치하세요! 📱
                </h3>
                <div className='flex items-center space-x-4 mt-1 text-sm text-white/90'>
                  <div className='flex items-center space-x-1'>
                    <Bell className='w-4 h-4' />
                    <span>매일 아침 알림</span>
                  </div>
                  <div className='flex items-center space-x-1'>
                    <Zap className='w-4 h-4' />
                    <span>더 빠른 접근</span>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className='bg-white text-blue-600 hover:bg-white/90 font-medium'
                size='sm'
              >
                <Download className='w-4 h-4 mr-1' />
                {isInstalling ? "설치 중..." : "설치"}
              </Button>

              <Button
                onClick={handleDismiss}
                variant='ghost'
                size='sm'
                className='text-white hover:bg-white/20'
              >
                <X className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
