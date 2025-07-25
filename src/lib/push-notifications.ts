import { createClient } from "./supabase";

const supabase = createClient();

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface NotificationSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private swRegistration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // 서비스 워커 등록
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service Worker is not supported");
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered:", this.swRegistration);
      return this.swRegistration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      throw error;
    }
  }

  // 푸시 알림 권한 요청
  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      throw new Error("Notifications are not supported");
    }

    const permission = await Notification.requestPermission();
    console.log("Notification permission:", permission);
    return permission;
  }

  // 푸시 구독 생성
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      await this.registerServiceWorker();
    }

    const permission = await this.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    try {
      const subscription = await this.swRegistration!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      console.log("Push subscription created:", subscription);
      return subscription;
    } catch (error) {
      console.error("Failed to subscribe to push:", error);
      throw error;
    }
  }

  // 구독 해제
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.swRegistration) {
      return false;
    }

    const subscription =
      await this.swRegistration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log("Push subscription unsubscribed");
      return true;
    }
    return false;
  }

  // 구독 정보를 서버에 저장
  async saveSubscription(subscription: PushSubscription): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const subscriptionData = {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: btoa(
        String.fromCharCode.apply(
          null,
          Array.from(new Uint8Array(subscription.getKey("p256dh")!))
        )
      ),
      auth: btoa(
        String.fromCharCode.apply(
          null,
          Array.from(new Uint8Array(subscription.getKey("auth")!))
        )
      ),
    };

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(subscriptionData, { onConflict: "user_id" });

    if (error) {
      console.error("Failed to save subscription:", error);
      throw error;
    }

    console.log("Subscription saved to database");
  }

  // 구독 정보를 서버에서 삭제
  async deleteSubscription(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to delete subscription:", error);
      throw error;
    }

    console.log("Subscription deleted from database");
  }

  // 로컬 알림 보내기 (테스트용)
  async sendLocalNotification(notification: PushNotification): Promise<void> {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const serviceWorker = await navigator.serviceWorker.ready;
    await serviceWorker.showNotification(notification.title, {
      body: notification.body,
      icon: notification.icon || "/favicon.ico",
      badge: notification.badge || "/favicon.ico",
      data: notification.data,
      requireInteraction: true,
      tag: notification.id,
    } as NotificationOptions);
  }

  // 매일 아침 8시 목표 설정 알림 스케줄링
  async scheduleDailyGoalReminder(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // 오늘 날짜의 일일보고 확인
    const today = new Date().toISOString().split("T")[0];
    const { data: dailyReport } = await supabase
      .from("daily_reports")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    // 일일보고가 없으면 알림 스케줄링
    if (!dailyReport) {
      await this.scheduleNotification({
        id: `goal-reminder-${today}`,
        title: "오늘의 목표를 설정해주세요! 🎯",
        body: "매일의 작은 걸음이 큰 목표를 이룹니다. 오늘의 목표를 설정하고 시작해보세요.",
        data: {
          type: "goal-reminder",
          date: today,
          action: "open-daily-report",
        },
        actions: [
          {
            action: "open-app",
            title: "목표 설정하기",
          },
          {
            action: "snooze",
            title: "나중에",
          },
        ],
      });
    }
  }

  // 알림 스케줄링
  private async scheduleNotification(
    notification: PushNotification
  ): Promise<void> {
    // 현재 시간이 오전 8시 이전이면 오늘 8시에, 이후면 내일 8시에 스케줄링
    const now = new Date();
    const targetTime = new Date(now);
    targetTime.setHours(8, 0, 0, 0);

    if (now >= targetTime) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const delay = targetTime.getTime() - now.getTime();

    setTimeout(async () => {
      await this.sendLocalNotification(notification);
    }, delay);

    console.log(`Notification scheduled for ${targetTime.toLocaleString()}`);
  }

  // VAPID 키 변환 (Base64 URL -> Uint8Array)
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // 구독 상태 확인
  async getSubscriptionStatus(): Promise<{
    isSubscribed: boolean;
    permission: NotificationPermission;
  }> {
    const permission =
      "Notification" in window ? Notification.permission : "denied";

    if (!this.swRegistration) {
      return { isSubscribed: false, permission };
    }

    const subscription =
      await this.swRegistration.pushManager.getSubscription();
    return {
      isSubscribed: !!subscription,
      permission,
    };
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
