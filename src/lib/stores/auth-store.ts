import { create } from "zustand";
import { User } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@/lib/supabase";
import type { Profile } from "@/types";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  signOut: () => void;
  loadProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),

  loadProfile: async (userId: string) => {
    try {
      const supabase = createClient();

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Failed to load profile:", error);
        return;
      }

      if (profile) {
        set({ profile });
        console.log("Profile loaded:", profile);
      } else {
        // 프로필이 없으면 생성
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert([
            {
              id: userId,
              email: get().user?.email || "",
              name: get().user?.user_metadata?.name || "",
              position: "일반 사용자",
            },
          ])
          .select()
          .single();

        if (createError) {
          console.error("Failed to create profile:", createError);
          return;
        }

        if (newProfile) {
          set({ profile: newProfile });
          console.log("New profile created:", newProfile);
        }
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  },

  signOut: () => set({ user: null, profile: null }),
}));
