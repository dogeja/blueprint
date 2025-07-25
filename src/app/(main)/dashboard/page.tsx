"use client";

import { Dashboard } from "@/components/dashboard/dashboard";
import { IncompleteTasksModal } from "@/components/daily-report/incomplete-tasks-modal";

export default function DashboardPage() {
  return (
    <>
      <Dashboard />
      <IncompleteTasksModal />
    </>
  );
}
