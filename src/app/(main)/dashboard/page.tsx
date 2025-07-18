"use client";

import { Dashboard } from "@/components/dashboard/dashboard";
import { IncompleteTasksModal } from "@/components/daily-report/incomplete-tasks-modal";
import { useDailyReportStore } from "@/lib/stores/daily-report-store";

export default function DashboardPage() {
  const { showIncompleteTasksModal, setShowIncompleteTasksModal } =
    useDailyReportStore();

  return (
    <>
      <Dashboard />

      {/* 미완성 업무 모달 */}
      <IncompleteTasksModal
        isOpen={showIncompleteTasksModal}
        onClose={() => setShowIncompleteTasksModal(false)}
      />
    </>
  );
}
