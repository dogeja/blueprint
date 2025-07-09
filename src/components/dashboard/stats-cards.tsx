"use client";

import React from "react";

export function StatsCards() {
  // 예시 더미 데이터
  const stats = [
    { label: "평균 컨디션", value: "7.8/10" },
    { label: "목표 달성률", value: "82%" },
    { label: "누적 업무", value: "124건" },
  ];

  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
      {stats.map((s, i) => (
        <div
          key={i}
          className='bg-white rounded-lg shadow p-4 flex flex-col items-center'
        >
          <span className='text-gray-500 text-sm mb-1'>{s.label}</span>
          <span className='text-2xl font-bold'>{s.value}</span>
        </div>
      ))}
    </div>
  );
}
