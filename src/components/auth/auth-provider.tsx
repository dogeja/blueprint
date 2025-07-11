"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useAuthStore } from "@/lib/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading, setInitialized, loadProfile } =
    useAuthStore();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 초기 세션 확인
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else {
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Failed to get initial session:", error);
        router.push("/auth/login");
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    getInitialSession();

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
        router.push("/dashboard");
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        router.push("/auth/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading, setInitialized, loadProfile, router]);

  return <>{children}</>;
}
