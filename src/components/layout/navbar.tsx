"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "대시보드", href: "/dashboard", icon: Home },
  { name: "일일보고", href: "/daily-report", icon: Calendar },
  { name: "목표관리", href: "/goals", icon: Target },
  { name: "분석", href: "/analytics", icon: BarChart3 },
  { name: "설정", href: "/settings", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    signOut();
  };

  return (
    <>
      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className='flex flex-col h-full'>
          {/* 헤더 */}
          <div className='flex items-center justify-between h-16 px-4 border-b border-gray-200'>
            <div className='flex items-center'>
              <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>P</span>
              </div>
              <span className='ml-2 text-lg font-semibold text-gray-900'>
                PPMS
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className='lg:hidden p-1 rounded-md hover:bg-gray-100'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* 네비게이션 */}
          <nav className='flex-1 px-4 py-4 space-y-2'>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className='w-5 h-5 mr-3' />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* 프로필 섹션 */}
          <div className='p-4 border-t border-gray-200'>
            <div className='relative'>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className='flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100'
              >
                <div className='w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3'>
                  <User className='w-4 h-4' />
                </div>
                <div className='flex-1 text-left'>
                  <div className='text-sm font-medium'>
                    {profile?.name || "사용자"}
                  </div>
                  <div className='text-xs text-gray-500'>
                    {profile?.position || ""}
                  </div>
                </div>
              </button>

              {profileMenuOpen && (
                <div className='absolute bottom-full left-0 w-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200'>
                  <button
                    onClick={handleSignOut}
                    className='flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg'
                  >
                    <LogOut className='w-4 h-4 mr-3' />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 상단 바 */}
      <div className='lg:hidden'>
        <div className='flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200'>
          <button
            onClick={() => setSidebarOpen(true)}
            className='p-1 rounded-md hover:bg-gray-100'
          >
            <Menu className='w-6 h-6' />
          </button>
          <div className='flex items-center'>
            <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>P</span>
            </div>
            <span className='ml-2 text-lg font-semibold text-gray-900'>
              PPMS
            </span>
          </div>
          <div className='w-6' /> {/* 균형을 위한 빈 공간 */}
        </div>
      </div>
    </>
  );
}
