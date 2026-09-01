import React from 'react';
import { CalendarDays, Target, StickyNote, Cake, Settings } from 'lucide-react';

const tabs = [
  { id: 'schedule', label: 'Расписание', icon: CalendarDays },
  { id: 'deadlines', label: 'Дедлайны', icon: Target },
  { id: 'notes', label: 'Заметки', icon: StickyNote },
  { id: 'birthdays', label: 'Именинники', icon: Cake },
  { id: 'settings', label: 'Ещё', icon: Settings },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t z-50">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
