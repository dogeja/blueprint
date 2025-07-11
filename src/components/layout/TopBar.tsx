"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/stores/ui-store";

const pageTitles: Record<string, string> = {
  "/dashboard": "대시보드",
  "/daily-report": "일일보고",
  "/goals": "목표 관리",
  "/goal-tree": "목표 트리",
  "/analytics": "분석",
  "/settings": "설정",
};

export function TopBar() {
  const pathname = usePathname();
  const { toggleSidebar } = useUIStore();
  const pageTitle = pageTitles[pathname] || "Blueprint";

  return (
    <header className='sticky top-0 z-40 bg-background border-b lg:hidden'>
      <div className='flex h-16 items-center justify-between px-4'>
        <Button
          variant='ghost'
          size='sm'
          onClick={toggleSidebar}
          className='lg:hidden'
          aria-label='메뉴 열기'
        >
          <Menu className='h-5 w-5' />
        </Button>
        <h1 className='text-lg font-semibold'>{pageTitle}</h1>
        <div className='w-10' /> {/* 우측 여백 */}
      </div>
    </header>
  );
}
