import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function WeekNavigator({ weekStart, onPrev, onNext, onToday }) {
  const weekEnd = addDays(weekStart, 6);

  return (
    <div className="flex items-center justify-between gap-2">
      <Button variant="ghost" size="icon" onClick={onPrev} className="rounded-full">
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">
          {format(weekStart, 'd MMM', { locale: ru })} — {format(weekEnd, 'd MMM', { locale: ru })}
        </p>
        <button
          onClick={onToday}
          className="text-xs text-primary/70 hover:text-primary underline underline-offset-2"
        >
          Сегодня
        </button>
      </div>
      <Button variant="ghost" size="icon" onClick={onNext} className="rounded-full">
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
