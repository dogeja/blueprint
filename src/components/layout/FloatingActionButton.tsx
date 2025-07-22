"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FileText, Target, X, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const quickActions = [
  {
    title: "일일보고 작성",
    href: "/daily-report/new",
    icon: FileText,
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    title: "새 목표 추가",
    href: "/goals/new",
    icon: Target,
    color: "bg-green-500 hover:bg-green-600",
  },
];

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 특정 페이지에서는 FAB 숨기기
  const shouldHide = pathname.includes("/auth") || pathname === "/";

  if (shouldHide) return null;

  return (
    <div className='fixed bottom-24 right-4 z-50 lg:hidden'>
      {/* 빠른 액션 버튼들 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='mb-4 space-y-2'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <Link
                  href={action.href}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg transition-all duration-200",
                    action.color
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <action.icon className='h-5 w-5' />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메인 FAB 버튼 */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg transition-all duration-200",
            isOpen
              ? "bg-red-500 hover:bg-red-600"
              : "bg-primary hover:bg-primary/90"
          )}
          size='icon'
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className='h-6 w-6' /> : <Plus className='h-6 w-6' />}
          </motion.div>
        </Button>
      </motion.div>
    </div>
  );
}
