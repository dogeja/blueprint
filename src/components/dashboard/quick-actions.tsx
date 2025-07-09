import React from "react";
import { Plus, Target } from "lucide-react";

export function QuickActions() {
  return (
    <div className='bg-white rounded-lg shadow p-4 flex flex-col gap-3'>
      <h2 className='text-lg font-semibold mb-2'>빠른 액션</h2>
      <button className='flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
        <Plus className='w-4 h-4' /> 오늘 할 일 추가
      </button>
      <button className='flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600'>
        <Target className='w-4 h-4' /> 목표 생성
      </button>
    </div>
  );
}
