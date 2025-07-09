"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className='flex items-center gap-2'>
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-md transition-colors ${
          theme === "light"
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
        title='라이트 모드'
      >
        <Sun className='h-4 w-4' />
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-md transition-colors ${
          theme === "dark"
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
        title='다크 모드'
      >
        <Moon className='h-4 w-4' />
      </button>

      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-md transition-colors ${
          theme === "system"
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
        title='시스템 설정'
      >
        <Monitor className='h-4 w-4' />
      </button>
    </div>
  );
}
