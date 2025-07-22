import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  OnboardingState,
  OnboardingStep,
  DEFAULT_ONBOARDING_STEPS,
  onboardingStore,
} from "@/lib/onboarding";

interface OnboardingStoreState extends OnboardingState {
  // Actions
  startOnboarding: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  skipOnboarding: () => Promise<void>;
  nextStep: () => Promise<void>;
  previousStep: () => Promise<void>;
  goToStep: (stepIndex: number) => Promise<void>;
  markStepCompleted: (stepId: string) => Promise<void>;
  markStepSkipped: (stepId: string) => Promise<void>;
  updatePreferences: (
    preferences: Partial<OnboardingState["preferences"]>
  ) => Promise<void>;
  reset: () => Promise<void>;

  // Computed values
  getCurrentStep: () => OnboardingStep | null;
  getProgress: () => number;
  isCompleted: () => boolean;
  isSkipped: () => boolean;

  // Cross-device sync
  checkCrossDeviceSync: () => Promise<{
    hasOtherDevice: boolean;
    lastSyncTime?: number;
    deviceId?: string;
  }>;
}

export const useOnboardingStore = create<OnboardingStoreState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    ...onboardingStore.getState(),

    // Actions
    startOnboarding: async () => {
      await onboardingStore.startOnboarding();
      set(onboardingStore.getState());
    },

    completeOnboarding: async () => {
      await onboardingStore.completeOnboarding();
      set(onboardingStore.getState());
    },

    skipOnboarding: async () => {
      await onboardingStore.skipOnboarding();
      set(onboardingStore.getState());
    },

    nextStep: async () => {
      await onboardingStore.nextStep();
      set(onboardingStore.getState());
    },

    previousStep: async () => {
      await onboardingStore.previousStep();
      set(onboardingStore.getState());
    },

    goToStep: async (stepIndex: number) => {
      await onboardingStore.goToStep(stepIndex);
      set(onboardingStore.getState());
    },

    markStepCompleted: async (stepId: string) => {
      await onboardingStore.markStepCompleted(stepId);
      set(onboardingStore.getState());
    },

    markStepSkipped: async (stepId: string) => {
      await onboardingStore.markStepSkipped(stepId);
      set(onboardingStore.getState());
    },

    updatePreferences: async (preferences) => {
      await onboardingStore.updatePreferences(preferences);
      set(onboardingStore.getState());
    },

    reset: async () => {
      await onboardingStore.reset();
      set(onboardingStore.getState());
    },

    // Computed values
    getCurrentStep: () => {
      return onboardingStore.getCurrentStep();
    },

    getProgress: () => {
      return onboardingStore.getProgress();
    },

    isCompleted: () => {
      return onboardingStore.isCompleted();
    },

    isSkipped: () => {
      return onboardingStore.isSkipped();
    },

    // Cross-device sync
    checkCrossDeviceSync: async () => {
      return await onboardingStore.checkCrossDeviceSync();
    },
  }))
);

// 온보딩 상태 구독
useOnboardingStore.subscribe(
  (state) => state,
  (state) => {
    // 상태 변경 시 자동 저장은 StorageManager에서 처리됨
    // 여기서는 추가적인 사이드 이펙트만 처리
  }
);
