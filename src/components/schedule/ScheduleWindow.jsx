import React from 'react';
import { Coffee } from 'lucide-react';

export default function ScheduleWindow({ start, end }) {
  return (
    <div className="rounded-xl border border-dashed border-black-300 bg-black-100 p-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
      <Coffee className="w-3.5 h-3.5" />
      <span className="font-medium">Окно</span>
      <span>{start}–{end}</span>
    </div>
  );
}
