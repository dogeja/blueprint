"use client";

import { DailyReportForm } from "@/components/daily-report/daily-report-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";

export default function DailyReportPage() {
  const { showDateChangeConfirm, confirmDateChange, cancelDateChange } =
    useDailyReportStore();

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

      <DailyReportForm />
    </div>
  );
}
