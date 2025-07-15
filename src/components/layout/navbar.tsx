"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Calendar,
  Target,
  BarChart3,
  Settings,
  Menu,
  X,
  User,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { ProfileEditModal } from "@/components/layout/ProfileEditModal";

const navigation = [
  {
    name: "대시보드",
    href: "/dashboard",
    icon: Home,
    description: "전체 현황을 한눈에",
  },
  {
    name: "일일보고",
    href: "/daily-report",
    icon: Calendar,
    description: "오늘의 업무와 회고",
  },
  {
    name: "목표관리",
    href: "/goals",
    icon: Target,
    description: "목표 설정과 추적",
  },
  {
    name: "분석",
    href: "/analytics",
    icon: BarChart3,
    description: "데이터 기반 인사이트",
  },
  {
    name: "설정",
    href: "/settings",
    icon: Settings,
    description: "계정 및 환경 설정",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    signOut();
  };

  // 데스크탑에서는 항상 x:0, 모바일에서만 sidebarOpen에 따라 x값 변경
  const getSidebarX = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      return 0;
    }
    return sidebarOpen ? 0 : -320;
  };

  return (
    <>
      {/* 모바일 사이드바 오버레이 */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden'
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 사이드바 - PC에서는 항상 표시, 모바일에서는 조건부 표시 */}
      <motion.div
        initial={false}
        animate={{ x: getSidebarX() }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-card/95 backdrop-blur-sm border-r border-border/50 shadow-xl lg:translate-x-0 lg:static lg:inset-0 lg:w-72 lg:shadow-none"
        )}
      >
        <div className='flex flex-col h-full'>
          {/* 헤더 */}
          <motion.div
            className='flex items-center justify-between h-16 px-6 border-b border-border/50'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className='flex items-center space-x-3'>
              <motion.div
                className='w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className='text-primary-foreground font-bold text-lg'>
                  BP
                </span>
              </motion.div>
              <div>
                <span className='text-lg font-bold text-foreground'>
                  靑寫眞
                </span>
                <p className='text-xs text-muted-foreground'>
                  가장 작은 것부터 그려나가는 설계도
                </p>
              </div>
            </div>
            <motion.button
              onClick={() => setSidebarOpen(false)}
              className='lg:hidden p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors'
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className='w-5 h-5' />
            </motion.button>
          </motion.div>

          {/* 네비게이션 */}
          <nav className='flex-1 px-4 py-6 space-y-2'>
            <motion.div
              className='mb-4'
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3'>
                메뉴
              </h3>
            </motion.div>
            {navigation.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <motion.div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-200",
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <item.icon className='w-4 h-4' />
                    </motion.div>
                    <div className='flex-1'>
                      <div className='font-medium'>{item.name}</div>
                      <div
                        className={cn(
                          "text-xs transition-colors",
                          isActive
                            ? "text-primary/70"
                            : "text-muted-foreground/60 group-hover:text-muted-foreground"
                        )}
                      >
                        {item.description}
                      </div>
                    </div>
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className='w-4 h-4 text-primary ml-2' />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.div>
              );
            })}

            <motion.div
              className='pt-4 border-t border-border/50 mt-6'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                href='/goal-tree'
                className={cn(
                  "group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  pathname === "/goal-tree"
                    ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <motion.div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-200",
                    pathname === "/goal-tree"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Target className='w-4 h-4' />
                </motion.div>
                <div className='flex-1'>
                  <div className='font-medium'>목표 트리</div>
                  <div
                    className={cn(
                      "text-xs transition-colors",
                      pathname === "/goal-tree"
                        ? "text-primary/70"
                        : "text-muted-foreground/60 group-hover:text-muted-foreground"
                    )}
                  >
                    목표 간의 관계 시각화
                  </div>
                </div>
                <AnimatePresence>
                  {pathname === "/goal-tree" && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className='w-4 h-4 text-primary ml-2' />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          </nav>

          {/* 프로필 섹션 */}
          <motion.div
            className='p-4 border-t border-border/50'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className='relative'>
              <motion.button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className='flex items-center w-full px-4 py-3 text-sm font-medium text-foreground rounded-xl hover:bg-muted/50 transition-colors'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className='w-10 h-10 bg-gradient-to-br from-muted to-muted/80 rounded-xl flex items-center justify-center mr-3 shadow-sm'>
                  <User className='w-5 h-5 text-muted-foreground' />
                </div>
                <div className='flex-1 text-left'>
                  <div className='font-medium text-foreground'>
                    {profile?.name || "사용자"}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {profile?.position || "일반 사용자"}
                  </div>
                </div>
              </motion.button>

              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className='absolute bottom-full left-0 w-full mb-2 bg-card/95 backdrop-blur-sm rounded-xl shadow-xl border border-border/50'
                  >
                    <motion.button
                      onClick={handleSignOut}
                      className='flex items-center w-full px-4 py-3 text-sm text-foreground hover:bg-muted/50 rounded-xl transition-colors'
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogOut className='w-4 h-4 mr-3 text-muted-foreground' />
                      로그아웃
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setEditModalOpen(true);
                        setProfileMenuOpen(false);
                      }}
                      className='flex items-center w-full px-4 py-3 text-sm text-foreground hover:bg-muted/50 rounded-xl transition-colors'
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ✏️<span className='ml-2'>프로필 편집</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          <ProfileEditModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
          />
        </div>
      </motion.div>

      {/* 모바일 상단 바 */}
      <div className='lg:hidden'>
        <motion.div
          className='flex items-center justify-between h-16 px-4 bg-card/95 backdrop-blur-sm border-b border-border/50'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.button
            onClick={() => setSidebarOpen(true)}
            className='p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors'
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Menu className='w-6 h-6' />
          </motion.button>
          <div className='flex items-center space-x-3'>
            <motion.div
              className='w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className='text-primary-foreground font-bold text-sm'>
                P
              </span>
            </motion.div>
            <span className='text-lg font-bold text-foreground'>靑寫眞</span>
          </div>
          <div className='w-10' /> {/* 균형을 위한 빈 공간 */}
        </motion.div>
      </div>
    </>
  );
}
