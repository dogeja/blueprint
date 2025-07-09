"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useAuthStore } from "@/lib/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 초기 세션 확인
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);

        // 프로필 정보 가져오기
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setProfile(profile);
        } else {
          // 프로필이 없으면 생성
          const { data: newProfile } = await supabase
            .from("profiles")
            .insert([
              {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || "",
              },
            ])
            .select()
            .single();

          if (newProfile) {
            setProfile(newProfile);
          }
        }
      } else {
        router.push("/auth/login");
      }

      setLoading(false);
    };

    getInitialSession();

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        router.push("/dashboard");
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        router.push("/auth/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, setUser, setProfile, setLoading, router]);

  return <>{children}</>;
}
