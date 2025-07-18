"use client";

import { useEffect } from "react";
import { DailyReportForm } from "@/components/daily-report/daily-report-form";
import { IncompleteTasksModal } from "@/components/daily-report/incomplete-tasks-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";
import { format } from "date-fns";

export default function DailyReportPage() {
  const {
    showDateChangeConfirm,
    confirmDateChange,
    cancelDateChange,
    showIncompleteTasksModal,
    setShowIncompleteTasksModal,
    loadIncompleteTasks,
    incompleteContinuousTasks,
    incompleteShortTermTasks,
  } = useDailyReportStore();

  // 페이지 로드 시 미완성 업무 확인
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    loadIncompleteTasks(today);
  }, [loadIncompleteTasks]);

  // 미완성 업무가 있으면 자동으로 모달 표시
  useEffect(() => {
    const hasIncompleteTasks =
      incompleteContinuousTasks.length > 0 ||
      incompleteShortTermTasks.length > 0;

    // 미완성 업무가 있고, 현재 모달이 닫혀있을 때만 모달 표시
    if (hasIncompleteTasks && !showIncompleteTasksModal) {
      // 약간의 지연 후 모달 표시 (페이지 로드 완료 후)
      const timer = setTimeout(() => {
        setShowIncompleteTasksModal(true);
      }, 1000);

      return () => clearTimeout(timer);
    }

    // 미완성 업무가 없으면 모달 닫기
    if (!hasIncompleteTasks && showIncompleteTasksModal) {
      setShowIncompleteTasksModal(false);
    }
  }, [
    incompleteContinuousTasks.length,
    incompleteShortTermTasks.length,
    showIncompleteTasksModal,
    setShowIncompleteTasksModal,
  ]);

  return (
    <div className='max-w-4xl mx-auto'>
      {/* 날짜 변경 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={showDateChangeConfirm}
        title='업무 작성 중'
        message='업무를 작성 중입니다. 날짜를 변경하면 작성 중인 내용이 사라집니다. 계속하시겠습니까?'
        confirmText='날짜 변경'
        cancelText='취소'
        onConfirm={confirmDateChange}
        onCancel={cancelDateChange}
        variant='warning'
      />

      {/* 미완성 업무 모달 */}
      <IncompleteTasksModal
        isOpen={showIncompleteTasksModal}
        onClose={() => setShowIncompleteTasksModal(false)}
      />

      <DailyReportForm />
    </div>
  );
}
