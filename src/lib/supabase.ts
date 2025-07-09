// src/lib/supabase.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";

// 클라이언트 컴포넌트용 (브라우저에서 사용)
export const createClient = () => createClientComponentClient<Database>();
