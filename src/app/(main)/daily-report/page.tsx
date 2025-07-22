"use client";

import { useEffect } from "react";
import { DailyReportForm } from "@/components/daily-report/daily-report-form";
import { IncompleteTasksModal } from "@/components/daily-report/incomplete-tasks-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { format } from "date-fns";

export default function DailyReportPage() {
  const {
    selectedDate,
    showDateChangeConfirm,
    confirmDateChange,
    cancelDateChange,
    showIncompleteTasksModal,
    setShowIncompleteTasksModal,
    loadIncompleteTasks,
    incompleteContinuousTasks,
    incompleteShortTermTasks,
  } = useDailyReportStore();

  // 페이지 로드 시 미완성 목표 확인
  useEffect(() => {
    const checkIncompleteTasks = async () => {
      try {
        await loadIncompleteTasks(selectedDate);
      } catch (error) {
        console.error("Failed to load incomplete tasks:", error);
      }
    };

    checkIncompleteTasks();
  }, [selectedDate, loadIncompleteTasks]);

  // 미완성 목표가 있으면 자동으로 모달 표시
  useEffect(() => {
    const hasIncompleteTasks =
      incompleteContinuousTasks.length > 0 ||
      incompleteShortTermTasks.length > 0;

    // 미완성 목표가 있고, 현재 모달이 닫혀있을 때만 모달 표시
    if (hasIncompleteTasks && !showIncompleteTasksModal) {
      setShowIncompleteTasksModal(true);
    }
  }, [
    incompleteContinuousTasks,
    incompleteShortTermTasks,
    showIncompleteTasksModal,
  ]);

  // 미완성 목표가 없으면 모달 닫기
  useEffect(() => {
    const hasIncompleteTasks =
      incompleteContinuousTasks.length > 0 ||
      incompleteShortTermTasks.length > 0;

    if (!hasIncompleteTasks && showIncompleteTasksModal) {
      setShowIncompleteTasksModal(false);
    }
  }, [
    incompleteContinuousTasks,
    incompleteShortTermTasks,
    showIncompleteTasksModal,
  ]);

  return (
    <div className='space-y-6'>
      {/* 날짜 변경 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={showDateChangeConfirm}
        title='목표 작성 중'
        message='목표를 작성 중입니다. 날짜를 변경하면 작성 중인 내용이 사라집니다. 계속하시겠습니까?'
        confirmText='날짜 변경'
        cancelText='취소'
        onConfirm={confirmDateChange}
        onCancel={cancelDateChange}
        variant='warning'
      />

      {/* 미완성 목표 모달 */}
      <IncompleteTasksModal />

      <DailyReportForm />
    </div>
  );
}
