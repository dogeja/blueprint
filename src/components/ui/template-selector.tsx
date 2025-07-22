"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Clock,
  Users,
  Code,
  FileText,
  Settings,
  Plus,
  Star,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  TaskTemplate,
  getTemplatesByCategory,
  getMostUsedTemplates,
  getRecentlyUsedTemplates,
  searchTemplates,
  recordTemplateUsage,
} from "@/lib/templates";

interface TemplateSelectorProps {
  onTemplateSelect: (template: TaskTemplate) => void;
  trigger?: React.ReactNode;
  className?: string;
}

const categoryIcons = {
  workflow: Settings,
  meeting: Users,
  development: Code,
  planning: FileText,
  custom: Plus,
};

const categoryLabels = {
  workflow: "워크플로우",
  meeting: "회의",
  development: "개발",
  planning: "기획",
  custom: "사용자 정의",
};

export function TemplateSelector({
  onTemplateSelect,
  trigger,
  className,
}: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<TaskTemplate["category"]>("meeting");
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [mostUsed, setMostUsed] = useState<TaskTemplate[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<TaskTemplate[]>([]);

  // 템플릿 데이터 로드
  useEffect(() => {
    setMostUsed(getMostUsedTemplates(5));
    setRecentlyUsed(getRecentlyUsedTemplates(5));
  }, []);

  // 카테고리별 템플릿 로드
  useEffect(() => {
    if (searchQuery.trim()) {
      setTemplates(searchTemplates(searchQuery));
    } else {
      setTemplates(getTemplatesByCategory(selectedCategory));
    }
  }, [selectedCategory, searchQuery]);

  // 템플릿 선택 처리
  const handleTemplateSelect = (template: TaskTemplate) => {
    recordTemplateUsage(template.id);
    onTemplateSelect(template);
    setIsOpen(false);
    setSearchQuery("");
  };

  // 템플릿 카드 컴포넌트
  const TemplateCard = ({
    template,
    variant = "default",
  }: {
    template: TaskTemplate;
    variant?: "default" | "compact";
  }) => {
    const CategoryIcon = categoryIcons[template.category];
    const totalTime = template.tasks.reduce(
      (sum, task) => sum + (task.estimatedTime || 0),
      0
    );

    return (
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]",
          variant === "compact" && "h-32"
        )}
        onClick={() => handleTemplateSelect(template)}
      >
        <CardHeader className={cn("pb-2", variant === "compact" && "pb-1")}>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-2'>
              <CategoryIcon className='h-4 w-4 text-muted-foreground' />
              <CardTitle
                className={cn("text-sm", variant === "compact" && "text-xs")}
              >
                {template.name}
              </CardTitle>
            </div>
            <div className='flex items-center gap-1'>
              {template.isDefault && (
                <Badge variant='outline' className='text-xs'>
                  기본
                </Badge>
              )}
              {template.usageCount > 0 && (
                <Badge variant='secondary' className='text-xs'>
                  {template.usageCount}회
                </Badge>
              )}
            </div>
          </div>
          {template.description && (
            <p
              className={cn(
                "text-xs text-muted-foreground line-clamp-2",
                variant === "compact" && "line-clamp-1"
              )}
            >
              {template.description}
            </p>
          )}
        </CardHeader>

        <CardContent className={cn("pt-0", variant === "compact" && "pt-0")}>
          <div className='space-y-2'>
            {/* 태그 */}
            <div className='flex flex-wrap gap-1'>
              {template.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant='outline'
                  className='text-xs text-muted-foreground'
                >
                  {tag}
                </Badge>
              ))}
              {template.tags.length > 3 && (
                <span className='text-xs text-muted-foreground'>
                  +{template.tags.length - 3}
                </span>
              )}
            </div>

            {/* 업무 요약 */}
            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span>{template.tasks.length}개 업무</span>
              {totalTime > 0 && (
                <div className='flex items-center gap-1'>
                  <Clock className='h-3 w-3' />
                  <span>{Math.round(totalTime / 60)}시간</span>
                </div>
              )}
            </div>

            {/* 업무 미리보기 (기본 모드에서만) */}
            {variant === "default" && (
              <div className='space-y-1'>
                {template.tasks.slice(0, 3).map((task, index) => (
                  <div key={index} className='flex items-center gap-2 text-xs'>
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        task.priority === 1 && "bg-red-500",
                        task.priority === 2 && "bg-orange-500",
                        task.priority === 3 && "bg-yellow-500",
                        task.priority === 4 && "bg-blue-500",
                        task.priority === 5 && "bg-gray-500"
                      )}
                    />
                    <span className='truncate'>{task.title}</span>
                    {task.estimatedTime && (
                      <span className='text-muted-foreground'>
                        {task.estimatedTime}분
                      </span>
                    )}
                  </div>
                ))}
                {template.tasks.length > 3 && (
                  <div className='text-xs text-muted-foreground'>
                    +{template.tasks.length - 3}개 더...
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant='outline' className={className}>
            <Plus className='h-4 w-4 mr-2' />
            템플릿 사용
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='max-w-4xl max-h-[80vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle>업무 템플릿 선택</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col h-full'>
          {/* 검색 */}
          <div className='relative mb-4'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='템플릿 검색...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>

          <Tabs
            value={searchQuery ? "search" : selectedCategory}
            className='flex-1'
          >
            <TabsList className='grid w-full grid-cols-6'>
              <TabsTrigger
                value='recent'
                onClick={() => setSearchQuery("")}
                className='flex items-center gap-1'
              >
                <History className='h-3 w-3' />
                최근
              </TabsTrigger>
              <TabsTrigger
                value='popular'
                onClick={() => setSearchQuery("")}
                className='flex items-center gap-1'
              >
                <Star className='h-3 w-3' />
                인기
              </TabsTrigger>
              <TabsTrigger
                value='meeting'
                onClick={() => setSelectedCategory("meeting")}
              >
                회의
              </TabsTrigger>
              <TabsTrigger
                value='development'
                onClick={() => setSelectedCategory("development")}
              >
                개발
              </TabsTrigger>
              <TabsTrigger
                value='planning'
                onClick={() => setSelectedCategory("planning")}
              >
                기획
              </TabsTrigger>
              <TabsTrigger
                value='workflow'
                onClick={() => setSelectedCategory("workflow")}
              >
                워크플로우
              </TabsTrigger>
            </TabsList>

            {/* 최근 사용 템플릿 */}
            <TabsContent value='recent' className='mt-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {recentlyUsed.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    variant='compact'
                  />
                ))}
                {recentlyUsed.length === 0 && (
                  <div className='col-span-full text-center py-8 text-muted-foreground'>
                    최근 사용한 템플릿이 없습니다
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 인기 템플릿 */}
            <TabsContent value='popular' className='mt-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {mostUsed.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    variant='compact'
                  />
                ))}
              </div>
            </TabsContent>

            {/* 검색 결과 */}
            <TabsContent value='search' className='mt-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {templates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
                {templates.length === 0 && searchQuery && (
                  <div className='col-span-full text-center py-8 text-muted-foreground'>
                    검색 결과가 없습니다
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 카테고리별 템플릿 */}
            {(["meeting", "development", "planning", "workflow"] as const).map(
              (category) => (
                <TabsContent key={category} value={category} className='mt-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {templates.map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                    {templates.length === 0 && (
                      <div className='col-span-full text-center py-8 text-muted-foreground'>
                        {categoryLabels[category]} 템플릿이 없습니다
                      </div>
                    )}
                  </div>
                </TabsContent>
              )
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
