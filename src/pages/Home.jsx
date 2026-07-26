import React, { useState } from 'react';
import { useVkAuth } from '@/lib/VkAuthContext';
import { Loader2 } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import Schedule from '@/pages/Schedule';
import Deadlines from '@/pages/Deadlines';
import Notes from '@/pages/Notes';
import SettingsTab from '@/pages/SettingsTab';

export default function Home() {
  const { user, loading } = useVkAuth();
  const [tab, setTab] = useState('schedule');

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
        {tab === 'schedule' && <Schedule />}
        {tab === 'deadlines' && <Deadlines user={user} />}
        {tab === 'notes' && <Notes user={user} />}
        {tab === 'settings' && <SettingsTab user={user} />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
