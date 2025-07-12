"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Target,
  GitBranch,
  BarChart3,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/stores/ui-store";
import { useRecentPagesStore } from "@/lib/stores/recent-pages-store";

interface SidebarProps {
  className?: string;
}

const menuItems = [
  {
    title: "대시보드",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "전체 현황 한눈에 보기",
  },
  {
    title: "일일보고",
    href: "/daily-report",
    icon: FileText,
    description: "매일의 기록과 성찰",
  },
  {
    title: "목표 관리",
    href: "/goals",
    icon: Target,
    description: "목표 설정과 추적",
  },
  {
    title: "목표 트리",
    href: "/goal-tree",
    icon: GitBranch,
    description: "목표 간의 연결 관계",
  },
  {
    title: "분석",
    href: "/analytics",
    icon: BarChart3,
    description: "데이터 기반 인사이트",
  },
  {
    title: "설정",
    href: "/settings",
    icon: Settings,
    description: "개인 설정 관리",
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { recentPages } = useRecentPagesStore();

  // 최근 방문 2개, 자주 방문 2개 추출
  const recentPaths = recentPages.slice(0, 2).map((p) => p.path);
  const freqSorted = [...recentPages]
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
    .map((p) => p.path);

  return (
    <>
      {/* 모바일 오버레이 */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 bg-black/50 z-40 lg:hidden'
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* 사이드바 */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -256,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-background border-r lg:translate-x-0 lg:static lg:z-auto",
          className
        )}
      >
        <div className='flex h-full flex-col'>
          {/* 헤더 */}
          <motion.div
            className='flex h-16 items-center justify-between border-b px-6'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href='/dashboard' className='flex items-center space-x-2'>
              <motion.div
                className='h-8 w-8 rounded-lg bg-primary flex items-center justify-center'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className='text-primary-foreground font-bold text-sm'>
                  B
                </span>
              </motion.div>
              <span className='font-semibold text-lg'>Blueprint</span>
            </Link>
            <Button
              variant='ghost'
              size='sm'
              onClick={toggleSidebar}
              className='lg:hidden'
            >
              <X className='h-4 w-4' />
            </Button>
          </motion.div>

          {/* 네비게이션 메뉴 */}
          <nav className='flex-1 space-y-1 p-4'>
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              // 뱃지 판별
              const isRecent = recentPaths.includes(item.href);
              const isFrequent = freqSorted.includes(item.href) && !isRecent;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => {
                      // 모바일에서 메뉴 클릭 시 사이드바 닫기
                      if (window.innerWidth < 1024) {
                        toggleSidebar();
                      }
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 transition-colors",
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-accent-foreground"
                        )}
                      />
                    </motion.div>
                    <span>{item.title}</span>
                    {/* 뱃지 표시 */}
                    {isRecent && (
                      <span className='ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 animate-pulse'>
                        최근
                      </span>
                    )}
                    {isFrequent && (
                      <span className='ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700'>
                        자주
                      </span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* 푸터 */}
          <motion.div
            className='border-t p-4'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className='text-xs text-muted-foreground'>
              <p>매일의 작은 걸음으로</p>
              <p>마라톤 완주하기</p>
            </div>
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
}
