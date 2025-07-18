"use client";

import { useEffect, useState } from "react";
import { PartyPopper, Trophy, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  delay: number;
}

const colors = [
  "bg-yellow-400",
  "bg-pink-400",
  "bg-blue-400",
  "bg-green-400",
  "bg-purple-400",
  "bg-red-400",
  "bg-orange-400",
];

export function Celebration() {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 컨페티 생성
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 1000,
      });
    }
    setConfetti(pieces);
    setIsVisible(true);

    // 3초 후 숨김
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className='fixed inset-0 z-50 pointer-events-none'>
      {/* 컨페티 애니메이션 */}
      <div className='absolute inset-0 overflow-hidden'>
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className={cn(
              "absolute w-2 h-2 rounded-full animate-bounce",
              piece.color
            )}
            style={{
              left: `${piece.x}%`,
              top: `${piece.y}%`,
              transform: `rotate(${piece.rotation}deg)`,
              animationDelay: `${piece.delay}ms`,
              animationDuration: `${2000 + Math.random() * 1000}ms`,
            }}
          />
        ))}
      </div>

      {/* 축하 메시지 */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-8 py-6 rounded-2xl shadow-2xl transform animate-pulse'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-1'>
              <Trophy className='w-6 h-6' />
              <Star className='w-5 h-5' />
              <PartyPopper className='w-6 h-6' />
            </div>
            <div className='text-center'>
              <h3 className='text-xl font-bold'>축하합니다! 🎉</h3>
              <p className='text-sm opacity-90'>목표를 달성하셨습니다!</p>
            </div>
            <div className='flex items-center gap-1'>
              <Sparkles className='w-5 h-5' />
              <Star className='w-6 h-6' />
              <Trophy className='w-6 h-6' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
