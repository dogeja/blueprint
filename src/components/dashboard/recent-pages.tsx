"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useRecentPagesStore } from "@/lib/stores/recent-pages-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  FileText,
  Target,
  BarChart3,
  Settings,
  Clock,
  ArrowRight,
} from "lucide-react";

// 페이지별 아이콘 매핑
const pageIcons: Record<string, any> = {
  "/": TrendingUp,
  "/dashboard": TrendingUp,
  "/daily-report": FileText,
  "/goals": Target,
  "/analysis": BarChart3,
  "/settings": Settings,
};

// 페이지별 이름 매핑
const pageNames: Record<string, string> = {
  "/": "대시보드",
  "/dashboard": "대시보드",
  "/daily-report": "일일보고",
  "/goals": "목표 관리",
  "/analysis": "분석",
  "/settings": "설정",
};

export function RecentPages() {
  const { recentPages } = useRecentPagesStore();

  // 최근 4개만 표시
  const recentPagesToShow = recentPages.slice(0, 4);

  if (recentPagesToShow.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className='border-dashed border-2 border-muted-foreground/20'>
          <CardContent className='p-6 text-center'>
            <Clock className='w-8 h-8 text-muted-foreground mx-auto mb-2' />
            <p className='text-sm text-muted-foreground'>
              아직 방문한 페이지가 없어요
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              페이지를 방문하면 여기에 표시됩니다
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      className='space-y-3'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {recentPagesToShow.map((page, index) => {
        const IconComponent = pageIcons[page.path] || FileText;
        const pageName = pageNames[page.path] || page.name;

        return (
          <motion.div
            key={page.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            <Link href={page.path}>
              <Card className='hover:shadow-md transition-all duration-200 cursor-pointer group'>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform'>
                        <IconComponent className='w-5 h-5 text-primary' />
                      </div>
                      <div>
                        <p className='font-medium text-sm text-foreground group-hover:text-primary transition-colors'>
                          {pageName}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {formatDistanceToNow(page.visitedAt, {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className='w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all' />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
