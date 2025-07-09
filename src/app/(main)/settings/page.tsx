"use client";

import { useState, useEffect } from "react";
import { Save, User, Bell, Palette, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { createClient } from "@/lib/supabase";

export default function SettingsPage() {
  const { profile, setProfile } = useAuthStore();
  const { addNotification } = useUIStore();
  const supabase = createClient();

  const [isSaving, setIsSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: profile?.name || "",
    department: profile?.department || "",
    position: profile?.position || "",
    work_start_time: profile?.work_start_time || "09:00",
    work_end_time: profile?.work_end_time || "18:00",
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || "",
        department: profile.department || "",
        position: profile.position || "",
        work_start_time: profile.work_start_time || "09:00",
        work_end_time: profile.work_end_time || "18:00",
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(profileForm)
        .eq("id", profile.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      addNotification({
        type: "success",
        message: "프로필이 업데이트되었습니다.",
      });
    } catch (error) {
      addNotification({
        type: "error",
        message: "프로필 업데이트에 실패했습니다.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-6 max-w-2xl mx-auto'>
      {/* 헤더 */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>설정</h1>
        <p className='text-gray-600'>개인정보 및 시스템 설정을 관리하세요</p>
      </div>

      {/* 프로필 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='w-5 h-5' />
            프로필 설정
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                이름
              </label>
              <Input
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder='이름을 입력하세요'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                부서
              </label>
              <Input
                value={profileForm.department}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                placeholder='부서명을 입력하세요'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                직책
              </label>
              <Input
                value={profileForm.position}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    position: e.target.value,
                  }))
                }
                placeholder='직책을 입력하세요'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                이메일
              </label>
              <Input
                value={profile?.email || ""}
                disabled
                className='bg-gray-50'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                기본 출근시간
              </label>
              <Input
                type='time'
                value={profileForm.work_start_time}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    work_start_time: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                기본 퇴근시간
              </label>
              <Input
                type='time'
                value={profileForm.work_end_time}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    work_end_time: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className='flex items-center gap-2'
          >
            <Save className='w-4 h-4' />
            {isSaving ? "저장 중..." : "프로필 저장"}
          </Button>
        </CardContent>
      </Card>

      {/* 알림 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Bell className='w-5 h-5' />
            알림 설정
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='text-sm text-gray-600'>
            알림 기능은 향후 버전에서 제공될 예정입니다.
          </div>
        </CardContent>
      </Card>

      {/* 데이터 관리 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Database className='w-5 h-5' />
            데이터 관리
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='text-sm text-gray-600'>
            데이터 내보내기 및 백업 기능은 향후 버전에서 제공될 예정입니다.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
