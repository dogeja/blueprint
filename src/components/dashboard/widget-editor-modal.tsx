"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWidgetStore, type Widget } from "@/lib/stores/widget-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Settings,
  Eye,
  EyeOff,
  Move,
  Maximize2,
  Minimize2,
  RotateCcw,
  X,
  GripVertical,
  Layout,
  Monitor,
  Smartphone,
} from "lucide-react";

interface WidgetEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WidgetEditorModal({ isOpen, onClose }: WidgetEditorModalProps) {
  const {
    widgets,
    isEditMode,
    toggleEditMode,
    toggleWidget,
    updateWidgetSize,
    updateWidgetPosition,
    resetToDefault,
  } = useWidgetStore();

  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);

  const handleWidgetToggle = (widgetId: string) => {
    toggleWidget(widgetId);
  };

  const handleSizeChange = (
    widgetId: string,
    size: "small" | "medium" | "large"
  ) => {
    updateWidgetSize(widgetId, size);
  };

  const handlePositionChange = (
    widgetId: string,
    position: "left" | "right" | "full"
  ) => {
    updateWidgetPosition(widgetId, position);
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case "small":
        return "작음";
      case "medium":
        return "보통";
      case "large":
        return "큼";
      default:
        return "보통";
    }
  };

  const getPositionLabel = (position: string) => {
    switch (position) {
      case "left":
        return "왼쪽";
      case "right":
        return "오른쪽";
      case "full":
        return "전체";
      default:
        return "전체";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Settings className='w-5 h-5' />
            대시보드 위젯 설정
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* 편집 모드 토글 */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>편집 모드</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium'>위젯 드래그 앤 드롭 활성화</p>
                  <p className='text-sm text-muted-foreground'>
                    편집 모드를 켜면 위젯을 드래그하여 재배치할 수 있습니다.
                  </p>
                </div>
                <Switch checked={isEditMode} onCheckedChange={toggleEditMode} />
              </div>
            </CardContent>
          </Card>

          {/* 위젯 목록 */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>위젯 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {widgets.map((widget) => (
                  <motion.div
                    key={widget.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='border rounded-lg p-4 hover:bg-muted/50 transition-colors'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3 flex-1'>
                        <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
                          <GripVertical className='w-5 h-5 text-primary' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 mb-1'>
                            <h3 className='font-semibold text-sm'>
                              {widget.title}
                            </h3>
                            <Badge variant='secondary' className='text-xs'>
                              {widget.type}
                            </Badge>
                          </div>
                          <p className='text-sm text-muted-foreground'>
                            {widget.description}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-3'>
                        {/* 표시/숨김 토글 */}
                        <div className='flex items-center gap-2'>
                          <Switch
                            checked={widget.isVisible}
                            onCheckedChange={() =>
                              handleWidgetToggle(widget.id)
                            }
                          />
                          {widget.isVisible ? (
                            <Eye className='w-4 h-4 text-green-600' />
                          ) : (
                            <EyeOff className='w-4 h-4 text-gray-400' />
                          )}
                        </div>

                        {/* 크기 선택 */}
                        <div className='flex items-center gap-2'>
                          <span className='text-xs text-muted-foreground'>
                            크기:
                          </span>
                          <Select
                            value={widget.size}
                            onValueChange={(value: string) =>
                              handleSizeChange(
                                widget.id,
                                value as "small" | "medium" | "large"
                              )
                            }
                            className='w-20'
                          >
                            <option value='small'>작음</option>
                            <option value='medium'>보통</option>
                            <option value='large'>큼</option>
                          </Select>
                        </div>

                        {/* 위치 선택 */}
                        <div className='flex items-center gap-2'>
                          <span className='text-xs text-muted-foreground'>
                            위치:
                          </span>
                          <Select
                            value={widget.position}
                            onValueChange={(value: string) =>
                              handlePositionChange(
                                widget.id,
                                value as "left" | "right" | "full"
                              )
                            }
                            className='w-20'
                          >
                            <option value='left'>왼쪽</option>
                            <option value='right'>오른쪽</option>
                            <option value='full'>전체</option>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 기본값으로 리셋 */}
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium'>기본 설정으로 복원</p>
                  <p className='text-sm text-muted-foreground'>
                    모든 위젯을 기본 설정으로 되돌립니다.
                  </p>
                </div>
                <Button
                  variant='outline'
                  onClick={resetToDefault}
                  className='flex items-center gap-2'
                >
                  <RotateCcw className='w-4 h-4' />
                  기본값으로 리셋
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='flex justify-end gap-2 pt-4 border-t'>
          <Button variant='outline' onClick={onClose}>
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
