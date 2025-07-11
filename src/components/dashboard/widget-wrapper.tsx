"use client";

import { useState, useRef } from "react";
import { motion, Reorder, useDragControls } from "framer-motion";
import { useWidgetStore, type Widget } from "@/lib/stores/widget-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";

interface WidgetWrapperProps {
  widget: Widget;
  children: React.ReactNode;
  className?: string;
}

export function WidgetWrapper({
  widget,
  children,
  className,
}: WidgetWrapperProps) {
  const { isEditMode } = useWidgetStore();
  const [isDragging, setIsDragging] = useState(false);
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  // col-span 계산 함수
  const getColSpan = () => {
    if (widget.position === "full") return "col-span-3";
    if (widget.size === "large") return "col-span-2";
    return "col-span-1";
  };

  if (!widget.isVisible) return null;

  if (isEditMode) {
    return (
      <Reorder.Item
        value={widget}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        dragControls={dragControls}
        dragListener={false}
      >
        <motion.div
          layout
          className={`relative group ${getColSpan()} ${className ?? ""}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card className='bg-card border shadow rounded-lg h-full transition-all duration-300'>
            <CardContent className='p-4'>
              {/* 드래그 핸들 */}
              <div className='absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-6 w-6 p-0 cursor-grab active:cursor-grabbing'
                  onPointerDown={(e) => dragControls.start(e)}
                >
                  <GripVertical className='w-3 h-3' />
                </Button>
              </div>
              {/* 위젯 헤더 */}
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2'>
                  <h3 className='font-semibold text-sm'>{widget.title}</h3>
                  <Badge variant='secondary' className='text-xs'>
                    {widget.type}
                  </Badge>
                </div>
                <div className='flex items-center gap-1'>
                  <Badge variant='outline' className='text-xs'>
                    {widget.size}
                  </Badge>
                  <Badge variant='outline' className='text-xs'>
                    {widget.position}
                  </Badge>
                </div>
              </div>
              {/* 위젯 내용 */}
              <div className='min-h-[100px] flex items-center justify-center text-muted-foreground text-sm'>
                {children}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Reorder.Item>
    );
  }

  return (
    <motion.div
      layout
      className={`${getColSpan()} ${className ?? ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className='bg-card border shadow rounded-lg h-full transition-all duration-300'>
        <CardContent className='p-4'>{children}</CardContent>
      </Card>
    </motion.div>
  );
}
