"use client";

import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-14 items-center'>
        <div className='mr-4 hidden md:flex'>
          <a className='mr-6 flex items-center space-x-2' href='/'>
            <span className='hidden font-bold sm:inline-block'>BLUEPRINT</span>
          </a>
        </div>

        <div className='flex flex-1 items-center justify-between space-x-2 md:justify-end'>
          <nav className='flex items-center space-x-6 text-sm font-medium'>
            <a
              className='transition-colors hover:text-foreground/80 text-foreground/60'
              href='/dashboard'
            >
              대시보드
            </a>
            <a
              className='transition-colors hover:text-foreground/80 text-foreground/60'
              href='/tasks'
            >
              작업 관리
            </a>
            <a
              className='transition-colors hover:text-foreground/80 text-foreground/60'
              href='/analytics'
            >
              분석
            </a>
          </nav>

          <div className='flex items-center space-x-2'>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
