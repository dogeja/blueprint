"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import { Switch } from "./switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { pushNotificationService } from "@/lib/push-notifications";
import { useToastStore } from "./toast";

export function PushNotificationSettings() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    checkSupport();
    checkSubscriptionStatus();
  }, []);

  const checkSupport = () => {
    const supported = "serviceWorker" in navigator && "PushManager" in window;
    setIsSupported(supported);
  };

  const checkSubscriptionStatus = async () => {
    try {
      const status = await pushNotificationService.getSubscriptionStatus();
      setIsSubscribed(status.isSubscribed);
      setPermission(status.permission);
    } catch (error) {
      console.error("Failed to check subscription status:", error);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const subscription = await pushNotificationService.subscribeToPush();
      if (subscription) {
        await pushNotificationService.saveSubscription(subscription);
        setIsSubscribed(true);
        setPermission("granted");
        addToast({ type: "success", title: "푸시 알림이 활성화되었습니다!" });
      } else {
        addToast({ type: "error", title: "푸시 알림 권한이 거부되었습니다." });
      }
    } catch (error) {
      console.error("Failed to subscribe:", error);
      addToast({ type: "error", title: "푸시 알림 설정에 실패했습니다." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      await pushNotificationService.unsubscribeFromPush();
      await pushNotificationService.deleteSubscription();
      setIsSubscribed(false);
      addToast({ type: "success", title: "푸시 알림이 비활성화되었습니다." });
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      addToast({ type: "error", title: "푸시 알림 해제에 실패했습니다." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await pushNotificationService.sendLocalNotification({
        id: "test-notification",
        title: "테스트 알림 🎯",
        body: "푸시 알림이 정상적으로 작동합니다!",
        data: {
          type: "test",
          timestamp: Date.now(),
        },
      });
      addToast({ type: "success", title: "테스트 알림을 보냈습니다!" });
    } catch (error) {
      console.error("Failed to send test notification:", error);
      addToast({ type: "error", title: "테스트 알림 전송에 실패했습니다." });
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>푸시 알림</CardTitle>
          <CardDescription>
            이 브라우저는 푸시 알림을 지원하지 않습니다.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>푸시 알림 설정</CardTitle>
        <CardDescription>
          매일 아침 8시에 목표 설정을 알려드립니다.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h4 className='text-sm font-medium'>푸시 알림</h4>
            <p className='text-sm text-muted-foreground'>
              {permission === "granted"
                ? "알림 권한이 허용되었습니다."
                : permission === "denied"
                ? "알림 권한이 거부되었습니다."
                : "알림 권한을 요청해주세요."}
            </p>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={isSubscribed ? handleUnsubscribe : handleSubscribe}
            disabled={isLoading || permission === "denied"}
          />
        </div>

        {permission === "denied" && (
          <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-md'>
            <p className='text-sm text-yellow-800'>
              브라우저 설정에서 알림 권한을 허용해주세요.
            </p>
          </div>
        )}

        {isSubscribed && (
          <div className='space-y-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleTestNotification}
              disabled={isLoading}
            >
              테스트 알림 보내기
            </Button>
            <p className='text-xs text-muted-foreground'>
              매일 아침 8시에 목표를 설정하지 않은 경우 알림을 받게 됩니다.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
