import React, { useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileEditModal({ open, onClose }: ProfileEditModalProps) {
  const { profile, updateProfile } = useAuthStore();
  const [name, setName] = useState(profile?.name || "");
  const [position, setPosition] = useState(profile?.position || "");
  const [department, setDepartment] = useState(profile?.department || "");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    updateProfile({ name, position, department });
    setSaving(false);
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-card rounded-xl shadow-xl w-full max-w-sm p-6 relative'>
        <button
          className='absolute top-3 right-3 text-muted-foreground hover:text-foreground'
          onClick={onClose}
        >
          ×
        </button>
        <h2 className='text-xl font-bold mb-4'>프로필 편집</h2>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm mb-1'>이름</label>
            <input
              className='w-full px-3 py-2 rounded border bg-background'
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
            />
          </div>
          <div>
            <label className='block text-sm mb-1'>직책</label>
            <input
              className='w-full px-3 py-2 rounded border bg-background'
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              disabled={saving}
            />
          </div>
          <div>
            <label className='block text-sm mb-1'>부서</label>
            <input
              className='w-full px-3 py-2 rounded border bg-background'
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={saving}
            />
          </div>
        </div>
        <button
          className='mt-6 w-full py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition'
          onClick={handleSave}
          disabled={saving}
        >
          저장
        </button>
      </div>
    </div>
  );
}
