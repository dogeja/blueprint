"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// 전화 통화 내역 예시 데이터 타입
interface CallLog {
  id: number;
  name: string;
  summary: string;
  time: string;
}

export function PhoneCallSection() {
  // 더미 데이터
  const [calls, setCalls] = useState<CallLog[]>([
    { id: 1, name: "김팀장", summary: "업무 협의", time: "09:30" },
    { id: 2, name: "이과장", summary: "일정 조율", time: "11:10" },
  ]);
  const [form, setForm] = useState({ name: "", summary: "", time: "" });
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setCalls((prev) => [...prev, { id: Date.now(), ...form }]);
    setForm({ name: "", summary: "", time: "" });
    setShowForm(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>전화 통화 내역</CardTitle>
          <Button size='sm' onClick={() => setShowForm((v) => !v)}>
            {showForm ? "취소" : "통화 추가"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {showForm && (
          <form
            onSubmit={handleAdd}
            className='space-y-2 bg-gray-50 p-3 rounded'
          >
            <Input
              placeholder='이름/소속'
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              placeholder='통화 시간 (예: 14:30)'
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              required
            />
            <Textarea
              placeholder='간단 메모'
              value={form.summary}
              onChange={(e) =>
                setForm((f) => ({ ...f, summary: e.target.value }))
              }
              rows={2}
            />
            <Button type='submit' className='w-full'>
              추가
            </Button>
          </form>
        )}
        <ul className='space-y-2'>
          {calls.length === 0 ? (
            <li className='text-gray-500 text-sm'>
              등록된 통화 내역이 없습니다.
            </li>
          ) : (
            calls.map((call) => (
              <li key={call.id} className='border rounded p-2 flex flex-col'>
                <span className='font-medium'>{call.name}</span>
                <span className='text-xs text-gray-400'>{call.time}</span>
                <span className='text-sm text-gray-700 mt-1'>
                  {call.summary}
                </span>
              </li>
            ))
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
