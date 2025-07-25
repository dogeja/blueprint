"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { toast } from "@/components/ui/toast";

export function ReflectionSection() {
  const { currentReport, updateReflection } = useDailyReportStore();
  const [reflection, setReflection] = useState(
    currentReport?.reflections?.what_went_well || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!currentReport) return;

    setIsSaving(true);
    try {
      await updateReflection({
        what_went_well: reflection,
        challenges: "",
        lessons_learned: "",
        tomorrow_priorities: "",
        energy_level: 5, // 기본값
        satisfaction_score: 5, // 기본값
      });

      toast.success("회고가 저장되었습니다.");
    } catch (error) {
      toast.error("회고 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>오늘의 회고</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder='오늘 하루를 돌아보며 느낀 점, 개선할 점, 감사한 점 등을 자유롭게 작성해보세요...'
            rows={6}
            className='resize-none'
          />
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "저장 중..." : "회고 저장"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
