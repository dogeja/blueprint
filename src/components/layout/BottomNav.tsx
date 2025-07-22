"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Target,
  BarChart3,
  Settings,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/stores/ui-store";

const navigation = [
  {
    name: "대시보드",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "일일보고",
    href: "/daily-report",
    icon: FileText,
  },
  {
    name: "목표",
    href: "/goals",
    icon: Target,
  },
  {
    name: "분석",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "설정",
    href: "/settings",
    icon: Settings,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className='lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border'>
      <div className='flex items-center justify-around px-2 py-2'>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className='h-5 w-5 mb-1' />
              <span className='text-xs font-medium'>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* 안전 영역 (iPhone의 홈 인디케이터) */}
      <div className='h-safe-area-inset-bottom bg-background' />
    </nav>
  );
}
