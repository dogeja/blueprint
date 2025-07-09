// src/lib/supabase-server.ts (새 파일)
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

// 서버 컴포넌트용 (서버에서만 사용)
export const createServerClient = () =>
  createServerComponentClient<Database>({ cookies });
