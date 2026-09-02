import React from 'react';
import { Cake } from 'lucide-react';

const birthdays = [
  { name: 'тест', date: '26.09' },
  { name: 'тест', date: '12.09' },
  { name: 'тест', date: '4.09' },
];

export default function Birthdays() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Наши именинники</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Именинники месяца (сентябрь)</p>
      </div>

      <div className="space-y-2.5">
        {birthdays.map((b, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border bg-white p-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Cake className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold break-words">{b.name}</p>
            </div>
            <span className="text-sm font-medium text-muted-foreground shrink-0">{b.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
