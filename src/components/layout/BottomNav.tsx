"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Target, BarChart3 } from "lucide-react";

const mobileMenuItems = [
  {
    title: "대시보드",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "일일보고",
    href: "/daily-report",
    icon: FileText,
  },
  {
    title: "목표",
    href: "/goals",
    icon: Target,
  },
  {
    title: "분석",
    href: "/analytics",
    icon: BarChart3,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className='fixed bottom-0 left-0 right-0 z-50 bg-background border-t lg:hidden'>
      <div className='flex items-center justify-around px-2 py-1'>
        {mobileMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-h-[4rem] min-w-[4rem] px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              aria-label={item.title}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 mb-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span className='text-xs font-medium'>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
