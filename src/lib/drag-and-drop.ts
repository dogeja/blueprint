export interface DragItem {
  id: string;
  type: string;
  index: number;
  data?: any;
}

export interface DropZone {
  id: string;
  type: string;
  accepts: string[];
}

export interface DragState {
  isDragging: boolean;
  draggedItem: DragItem | null;
  draggedOverZone: DropZone | null;
  draggedOverIndex: number | null;
}

export const DRAG_TYPES = {
  TASK: "task",
  GOAL: "goal",
  TEMPLATE: "template",
} as const;

export type DragType = (typeof DRAG_TYPES)[keyof typeof DRAG_TYPES];

// 드래그 시작 이벤트 처리
export function handleDragStart(
  e: React.DragEvent,
  item: DragItem,
  setDragState: (state: Partial<DragState>) => void
) {
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("application/json", JSON.stringify(item));

  setDragState({
    isDragging: true,
    draggedItem: item,
    draggedOverZone: null,
    draggedOverIndex: null,
  });
}

// 드래그 오버 이벤트 처리
export function handleDragOver(
  e: React.DragEvent,
  zone: DropZone,
  index: number,
  dragState: DragState,
  setDragState: (state: Partial<DragState>) => void
) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";

  if (
    dragState.draggedItem &&
    zone.accepts.includes(dragState.draggedItem.type)
  ) {
    setDragState({
      draggedOverZone: zone,
      draggedOverIndex: index,
    });
  }
}

// 드래그 리브 이벤트 처리
export function handleDragLeave(
  e: React.DragEvent,
  setDragState: (state: Partial<DragState>) => void
) {
  e.preventDefault();
  setDragState({
    draggedOverZone: null,
    draggedOverIndex: null,
  });
}

// 드롭 이벤트 처리
export function handleDrop(
  e: React.DragEvent,
  zone: DropZone,
  index: number,
  dragState: DragState,
  setDragState: (state: Partial<DragState>) => void,
  onDrop: (item: DragItem, targetZone: DropZone, targetIndex: number) => void
) {
  e.preventDefault();

  if (
    dragState.draggedItem &&
    zone.accepts.includes(dragState.draggedItem.type)
  ) {
    onDrop(dragState.draggedItem, zone, index);
  }

  setDragState({
    isDragging: false,
    draggedItem: null,
    draggedOverZone: null,
    draggedOverIndex: null,
  });
}

// 드래그 종료 이벤트 처리
export function handleDragEnd(
  setDragState: (state: Partial<DragState>) => void
) {
  setDragState({
    isDragging: false,
    draggedItem: null,
    draggedOverZone: null,
    draggedOverIndex: null,
  });
}

// 드래그 가능한 요소의 스타일 계산
export function getDragItemStyle(
  isDragging: boolean,
  isOver: boolean,
  isOverIndex: boolean
): React.CSSProperties {
  return {
    opacity: isDragging ? 0.5 : 1,
    transform: isDragging ? "rotate(5deg)" : "none",
    transition: "all 0.2s ease",
    cursor: "grab",
    ...(isOver && {
      borderColor: "hsl(var(--primary))",
      backgroundColor: "hsl(var(--primary) / 0.1)",
    }),
    ...(isOverIndex && {
      borderTop: "2px solid hsl(var(--primary))",
    }),
  };
}

// 드롭 존의 스타일 계산
export function getDropZoneStyle(
  isOver: boolean,
  acceptsType: boolean
): React.CSSProperties {
  return {
    minHeight: "60px",
    border:
      isOver && acceptsType
        ? "2px dashed hsl(var(--primary))"
        : "2px dashed transparent",
    backgroundColor:
      isOver && acceptsType ? "hsl(var(--primary) / 0.05)" : "transparent",
    transition: "all 0.2s ease",
    borderRadius: "8px",
  };
}

// 드래그 프리뷰 이미지 생성
export function createDragPreview(element: HTMLElement): HTMLImageElement {
  const rect = element.getBoundingClientRect();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (ctx) {
    canvas.width = rect.width;
    canvas.height = rect.height;

    // HTML2Canvas 대신 간단한 프리뷰 생성
    ctx.fillStyle = "hsl(var(--background))";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = "hsl(var(--border))";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, rect.width, rect.height);

    ctx.fillStyle = "hsl(var(--foreground))";
    ctx.font = "14px system-ui";
    ctx.fillText("드래그 중...", 10, 20);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
}

// 드래그 앤 드롭 접근성 지원
export function getDragAccessibilityProps(
  isDragging: boolean,
  itemTitle: string
) {
  return {
    "aria-grabbed": isDragging,
    "aria-label": `${itemTitle} 드래그 가능`,
    role: "button",
    tabIndex: 0,
  };
}

// 키보드 드래그 앤 드롭 지원
export function handleKeyboardDrag(
  e: React.KeyboardEvent,
  item: DragItem,
  onDragStart: (item: DragItem) => void
) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    onDragStart(item);
  }
}
