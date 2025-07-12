import { create } from "zustand";
import { User } from "@supabase/auth-helpers-nextjs";
import type { Profile } from "@/types";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
  updateProfile: (
    fields: Partial<Pick<Profile, "name" | "position" | "department">>
  ) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: () => set({ user: null, profile: null }),
  updateProfile: (fields) => {
    const prev = get().profile;
    if (!prev) return;
    set({ profile: { ...prev, ...fields } });
  },
}));
