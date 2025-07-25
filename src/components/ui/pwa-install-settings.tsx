"use client";

import { useState } from "react";
import { Smartphone, Download, CheckCircle, X } from "lucide-react";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { usePWAInstall } from "@/lib/hooks/use-pwa-install";
import { useToastStore } from "./toast";

export function PWAInstallSettings() {
  const { isInstallable, isInstalled, installPWA, showInstallPromptAgain } =
    usePWAInstall();
  const { addToast } = useToastStore();
  const [isInstalling, setIsInstalling] = useState(false);

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

  const handleShowInstallPrompt = () => {
    showInstallPromptAgain();
    addToast({
      type: "info",
      title: "설치 안내가 다시 표시됩니다",
      message: "페이지를 새로고침하면 설치 배너가 나타나요.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Smartphone className='w-5 h-5' />앱 설치
        </CardTitle>
        <CardDescription>
          홈 화면에 앱을 추가하여 더 편리하게 사용하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {isInstalled ? (
          <div className='flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md'>
            <CheckCircle className='w-5 h-5 text-green-600' />
            <div>
              <p className='text-sm font-medium text-green-800'>
                앱이 설치되어 있습니다! 🎉
              </p>
              <p className='text-xs text-green-600'>
                홈 화면에서 바로 접근할 수 있어요.
              </p>
            </div>
          </div>
        ) : isInstallable ? (
          <div className='space-y-3'>
            <div className='flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-md'>
              <Download className='w-5 h-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-blue-800'>
                  앱을 설치할 수 있습니다!
                </p>
                <p className='text-xs text-blue-600'>
                  홈 화면에 추가하여 더 편리하게 사용하세요.
                </p>
              </div>
            </div>

            <div className='flex space-x-2'>
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className='flex items-center gap-2'
              >
                <Download className='w-4 h-4' />
                {isInstalling ? "설치 중..." : "앱 설치"}
              </Button>

              <Button
                onClick={handleShowInstallPrompt}
                variant='outline'
                size='sm'
              >
                설치 안내 다시 보기
              </Button>
            </div>
          </div>
        ) : (
          <div className='flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-md'>
            <X className='w-5 h-5 text-gray-600' />
            <div>
              <p className='text-sm font-medium text-gray-800'>
                앱 설치가 지원되지 않습니다
              </p>
              <p className='text-xs text-gray-600'>
                Chrome, Edge, Safari 등 최신 브라우저에서 사용해주세요.
              </p>
            </div>
          </div>
        )}

        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>앱 설치 혜택</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600'>
            <div className='flex items-center space-x-1'>
              <span>🔔</span>
              <span>매일 아침 목표 설정 알림</span>
            </div>
            <div className='flex items-center space-x-1'>
              <span>⚡</span>
              <span>더 빠른 앱 로딩</span>
            </div>
            <div className='flex items-center space-x-1'>
              <span>📱</span>
              <span>홈 화면에서 바로 접근</span>
            </div>
            <div className='flex items-center space-x-1'>
              <span>🌐</span>
              <span>오프라인에서도 사용</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
