import {
  createClientComponentClient,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

// 클라이언트 컴포넌트용
export const createClient = () => createClientComponentClient<Database>();

// 서버 컴포넌트용
export const createServerClient = () =>
  createServerComponentClient<Database>({ cookies });
