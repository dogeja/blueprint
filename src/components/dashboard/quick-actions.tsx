import React from "react";
import { motion } from "framer-motion";
import { Plus, Target, Calendar, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>빠른 액션</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          {[
            {
              href: "/daily-report",
              icon: Plus,
              text: "오늘 할 일 추가",
              variant: "default" as const,
            },
            {
              href: "/goals",
              icon: Target,
              text: "목표 생성",
              variant: "secondary" as const,
            },
            {
              href: "/calendar",
              icon: Calendar,
              text: "캘린더 보기",
              variant: "outline" as const,
            },
            {
              href: "/settings",
              icon: Settings,
              text: "설정",
              variant: "ghost" as const,
            },
          ].map((action, index) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.4 + index * 0.1,
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              <Link href={action.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={action.variant}
                    className='flex items-center gap-2 w-full'
                  >
                    <action.icon className='w-4 h-4' />
                    {action.text}
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
