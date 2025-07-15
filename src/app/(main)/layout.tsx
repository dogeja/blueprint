"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { useGlobalHotkeys } from "@/lib/hooks/use-global-hotkeys";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useGlobalHotkeys();
  return (
    <div className='flex h-screen bg-background'>
      {/* 데스크탑 사이드바 */}
      <Navbar />

      {/* 메인 콘텐츠 영역 */}
      <div className='flex flex-1 flex-col lg:ml-0'>
        {/* 모바일 상단바 */}
        <TopBar />

        {/* 콘텐츠 */}
        <main className='flex-1 overflow-auto pb-16 lg:pb-0'>
          <motion.div
            className='container mx-auto p-4 lg:p-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
          >
            {children}
          </motion.div>
        </main>

        {/* 모바일 바텀 네비게이션 */}
        <BottomNav />

        {/* 모바일 플로팅 액션 버튼 */}
        <FloatingActionButton />
      </div>
    </div>
  );
}
