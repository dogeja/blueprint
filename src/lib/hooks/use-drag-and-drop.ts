import { useState, useCallback, useRef } from "react";
import type { DragItem, DropZone, DragState } from "../drag-and-drop";

export function useDragAndDrop() {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    draggedOverZone: null,
    draggedOverIndex: null,
  });

  const dragPreviewRef = useRef<HTMLImageElement | null>(null);

  const updateDragState = useCallback((updates: Partial<DragState>) => {
    setDragState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleDragStart = useCallback(
    (e: React.DragEvent, item: DragItem) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("application/json", JSON.stringify(item));

      // 드래그 프리뷰 설정
      if (dragPreviewRef.current) {
        e.dataTransfer.setDragImage(dragPreviewRef.current, 0, 0);
      }

      updateDragState({
        isDragging: true,
        draggedItem: item,
        draggedOverZone: null,
        draggedOverIndex: null,
      });
    },
    [updateDragState]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, zone: DropZone, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      if (
        dragState.draggedItem &&
        zone.accepts.includes(dragState.draggedItem.type)
      ) {
        updateDragState({
          draggedOverZone: zone,
          draggedOverIndex: index,
        });
      }
    },
    [dragState.draggedItem, updateDragState]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      updateDragState({
        draggedOverZone: null,
        draggedOverIndex: null,
      });
    },
    [updateDragState]
  );

  const handleDrop = useCallback(
    (
      e: React.DragEvent,
      zone: DropZone,
      index: number,
      onDrop: (
        item: DragItem,
        targetZone: DropZone,
        targetIndex: number
      ) => void
    ) => {
      e.preventDefault();

      if (
        dragState.draggedItem &&
        zone.accepts.includes(dragState.draggedItem.type)
      ) {
        onDrop(dragState.draggedItem, zone, index);
      }

      updateDragState({
        isDragging: false,
        draggedItem: null,
        draggedOverZone: null,
        draggedOverIndex: null,
      });
    },
    [dragState.draggedItem, updateDragState]
  );

  const handleDragEnd = useCallback(() => {
    updateDragState({
      isDragging: false,
      draggedItem: null,
      draggedOverZone: null,
      draggedOverIndex: null,
    });
  }, [updateDragState]);

  const isOverZone = useCallback(
    (zoneId: string) => {
      return dragState.draggedOverZone?.id === zoneId;
    },
    [dragState.draggedOverZone]
  );

  const isOverIndex = useCallback(
    (index: number) => {
      return dragState.draggedOverIndex === index;
    },
    [dragState.draggedOverIndex]
  );

  const canDrop = useCallback(
    (zone: DropZone) => {
      return dragState.draggedItem
        ? zone.accepts.includes(dragState.draggedItem.type)
        : false;
    },
    [dragState.draggedItem]
  );

  return {
    dragState,
    dragPreviewRef,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    isOverZone,
    isOverIndex,
    canDrop,
    updateDragState,
  };
}

// 작업 순서 변경을 위한 특화된 훅
export function useTaskReorder(
  tasks: any[],
  onReorder: (newOrder: any[]) => void
) {
  const {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useDragAndDrop();

  const handleTaskDragStart = useCallback(
    (e: React.DragEvent, task: any, index: number) => {
      handleDragStart(e, {
        id: task.id,
        type: "task",
        index,
        data: task,
      });
    },
    [handleDragStart]
  );

  const handleTaskDrop = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      if (!dragState.draggedItem || dragState.draggedItem.type !== "task")
        return;

      const draggedIndex = dragState.draggedItem.index;
      const newTasks = [...tasks];

      // 드래그된 아이템 제거
      const [draggedTask] = newTasks.splice(draggedIndex, 1);

      // 새로운 위치에 삽입
      newTasks.splice(targetIndex, 0, draggedTask);

      onReorder(newTasks);
    },
    [dragState.draggedItem, tasks, onReorder]
  );

  const handleTaskDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      handleDragOver(
        e,
        { id: "tasks", type: "task", accepts: ["task"] },
        index
      );
    },
    [handleDragOver]
  );

  return {
    dragState,
    handleTaskDragStart,
    handleTaskDrop,
    handleDragOver: handleTaskDragOver,
    handleDragLeave,
    handleDragEnd,
  };
}

// 목표 연결을 위한 특화된 훅
export function useGoalConnection(
  onConnectToGoal: (taskId: string, goalId: string) => void
) {
  const {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useDragAndDrop();

  const handleGoalDragStart = useCallback(
    (e: React.DragEvent, goal: any) => {
      handleDragStart(e, {
        id: goal.id,
        type: "goal",
        index: 0,
        data: goal,
      });
    },
    [handleDragStart]
  );

  const handleTaskDrop = useCallback(
    (e: React.DragEvent, taskId: string) => {
      if (!dragState.draggedItem || dragState.draggedItem.type !== "goal")
        return;

      const goalId = dragState.draggedItem.id;
      onConnectToGoal(taskId, goalId);
    },
    [dragState.draggedItem, onConnectToGoal]
  );

  return {
    dragState,
    handleGoalDragStart,
    handleTaskDrop,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
  };
}
