"use client";

import { useState, useEffect } from "react";
import { Save, Heart, Brain, Target, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { useUIStore } from "@/lib/stores/ui-store";

export function ReflectionSection() {
  const { currentReport, updateReflection } = useDailyReportStore();
  const { addNotification } = useUIStore();

  const [reflectionForm, setReflectionForm] = useState({
    what_went_well: "",
    challenges: "",
    lessons_learned: "",
    tomorrow_priorities: "",
    energy_level: 7,
    satisfaction_score: 7,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentReport?.reflections) {
      const reflection = currentReport.reflections;
      setReflectionForm({
        what_went_well: reflection.what_went_well || "",
        challenges: reflection.challenges || "",
        lessons_learned: reflection.lessons_learned || "",
        tomorrow_priorities: reflection.tomorrow_priorities || "",
        energy_level: reflection.energy_level || 7,
        satisfaction_score: reflection.satisfaction_score || 7,
      });
    }
  }, [currentReport?.reflections]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateReflection(reflectionForm);
      addNotification({
        type: "success",
        message: "회고가 저장되었습니다.",
      });
    } catch (error) {
      addNotification({
        type: "error",
        message: "회고 저장에 실패했습니다.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getEnergyEmoji = (level: number) => {
    if (level >= 9) return "🔥";
    if (level >= 7) return "💪";
    if (level >= 5) return "😊";
    if (level >= 3) return "😐";
    return "😴";
  };

  const getSatisfactionEmoji = (score: number) => {
    if (score >= 9) return "🤩";
    if (score >= 7) return "😊";
    if (score >= 5) return "🙂";
    if (score >= 3) return "😕";
    return "😞";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Brain className='w-5 h-5' />
          오늘의 회고
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* 점수 평가 */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-foreground mb-2'>
              <Heart className='w-4 h-4 inline mr-1' />
              에너지 레벨 {getEnergyEmoji(reflectionForm.energy_level)}
            </label>
            <Select
              value={reflectionForm.energy_level.toString()}
              onChange={(e) =>
                setReflectionForm((prev) => ({
                  ...prev,
                  energy_level: parseInt(e.target.value),
                }))
              }
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                <option key={level} value={level}>
                  {level}점 {getEnergyEmoji(level)}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className='block text-sm font-medium text-foreground mb-2'>
              <Star className='w-4 h-4 inline mr-1' />
              만족도 {getSatisfactionEmoji(reflectionForm.satisfaction_score)}
            </label>
            <Select
              value={reflectionForm.satisfaction_score.toString()}
              onChange={(e) =>
                setReflectionForm((prev) => ({
                  ...prev,
                  satisfaction_score: parseInt(e.target.value),
                }))
              }
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                <option key={score} value={score}>
                  {score}점 {getSatisfactionEmoji(score)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* 회고 내용 */}
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-foreground mb-2'>
              ✅ 오늘 잘한 것들
            </label>
            <Textarea
              value={reflectionForm.what_went_well}
              onChange={(e) =>
                setReflectionForm((prev) => ({
                  ...prev,
                  what_went_well: e.target.value,
                }))
              }
              placeholder='오늘 성공적으로 완료한 일이나 잘했다고 생각하는 것들을 적어보세요'
              rows={3}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-foreground mb-2'>
              🤔 어려웠던 점들
            </label>
            <Textarea
              value={reflectionForm.challenges}
              onChange={(e) =>
                setReflectionForm((prev) => ({
                  ...prev,
                  challenges: e.target.value,
                }))
              }
              placeholder='오늘 어려웠거나 힘들었던 점들을 적어보세요'
              rows={3}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-foreground mb-2'>
              💡 배운 점과 인사이트
            </label>
            <Textarea
              value={reflectionForm.lessons_learned}
              onChange={(e) =>
                setReflectionForm((prev) => ({
                  ...prev,
                  lessons_learned: e.target.value,
                }))
              }
              placeholder='오늘 새롭게 배운 것이나 깨달은 점을 적어보세요'
              rows={3}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-foreground mb-2'>
              <Target className='w-4 h-4 inline mr-1' />
              내일의 우선순위 (3가지)
            </label>
            <Textarea
              value={reflectionForm.tomorrow_priorities}
              onChange={(e) =>
                setReflectionForm((prev) => ({
                  ...prev,
                  tomorrow_priorities: e.target.value,
                }))
              }
              placeholder='내일 집중해서 해야 할 가장 중요한 3가지를 적어보세요'
              rows={3}
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className='w-full flex items-center gap-2'
        >
          <Save className='w-4 h-4' />
          {isSaving ? "저장 중..." : "회고 저장"}
        </Button>
      </CardContent>
    </Card>
  );
}
