import React from "react";

export function RecentActivity() {
  // 예시 더미 데이터
  const activities = [
    {
      id: 1,
      title: "주간 회의 준비",
      category: "업무",
      progress: 80,
      estimated: 60,
      actual: 50,
      date: "2024-06-01",
    },
    {
      id: 2,
      title: "운동 30분",
      category: "건강",
      progress: 100,
      estimated: 30,
      actual: 30,
      date: "2024-06-01",
    },
    {
      id: 3,
      title: "독서 20페이지",
      category: "개인발전",
      progress: 60,
      estimated: 40,
      actual: 25,
      date: "2024-06-01",
    },
  ];

  return (
    <div className='bg-white rounded-lg shadow p-4'>
      <h2 className='text-lg font-semibold mb-2'>최근 활동</h2>
      <ul className='space-y-2'>
        {activities.map((a) => (
          <li
            key={a.id}
            className='flex items-center justify-between border-b pb-1 last:border-b-0'
          >
            <div>
              <span className='font-medium'>{a.title}</span>
              <span className='ml-2 text-xs text-gray-500'>[{a.category}]</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-xs text-gray-400'>{a.progress}%</span>
              <span className='text-xs text-gray-400'>{a.actual}분</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
