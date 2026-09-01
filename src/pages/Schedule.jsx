import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addWeeks, subWeeks, isToday, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Loader2, CalendarX } from 'lucide-react';
import ScheduleCard from '@/components/schedule/ScheduleCard';
import ScheduleWindow from '@/components/schedule/ScheduleWindow';
import WeekNavigator from '@/components/schedule/WeekNavigator';

const parseTime = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const GROUP_ID = 45221;
const API_URL = 'https://ruz.spbstu.ru/api/v1/ruz/scheduler';

const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function Schedule() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const dateStr = format(weekStart, 'yyyy-MM-dd');
    fetch(`${API_URL}/${GROUP_ID}?date=${dateStr}`)
      .then(r => r.json())
      .then(json => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [weekStart]);

  const handleToday = () => {
    const today = new Date();
    setWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
    // getDay: 0=вс, 1=пн, … 6=сб. API использует weekday 1–6 для пн–сб.
    const jsDay = today.getDay();
    setSelectedDay(jsDay >= 1 && jsDay <= 6 ? jsDay : null);
  };

  const days = data?.days || [];
  const daysWithLessons = days.filter(d => d.lessons.length > 0);
  const displayDays = selectedDay !== null
    ? daysWithLessons.filter(d => d.weekday === selectedDay)
    : daysWithLessons;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Расписание</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {data?.group?.name || '3332705/50001'}
        </p>
      </div>

      <WeekNavigator
        weekStart={weekStart}
        onPrev={() => { setWeekStart(w => subWeeks(w, 1)); setSelectedDay(null); }}
        onNext={() => { setWeekStart(w => addWeeks(w, 1)); setSelectedDay(null); }}
        onToday={handleToday}
      />

      {/* Day chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {[1, 2, 3, 4, 5, 6].map(wd => {
          const dayData = days.find(d => d.weekday === wd);
          const hasLessons = dayData && dayData.lessons.length > 0;
          const dayDate = dayData ? parseISO(dayData.date) : null;
          const isSelected = selectedDay === wd;
          const isTodayDay = dayDate && isToday(dayDate);

          return (
            <button
              key={wd}
              onClick={() => setSelectedDay(isSelected ? null : wd)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : isTodayDay
                  ? 'bg-primary/10 text-primary'
                  : hasLessons
                  ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  : 'bg-secondary/50 text-muted-foreground'
              }`}
            >
              {dayNames[wd - 1].slice(0, 2)}
              {dayDate && <span className="ml-1">{format(dayDate, 'd')}</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : displayDays.length === 0 ? (
        <div className="text-center py-16">
          <CalendarX className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Нет занятий</p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayDays.map(day => (
            <div key={day.date}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold">
                  {dayNames[day.weekday - 1]}
                </h2>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isToday(parseISO(day.date))
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}>
                  {format(parseISO(day.date), 'd MMMM', { locale: ru })}
                </span>
              </div>
              <div className="space-y-2.5">
                {day.lessons.flatMap((lesson, i) => {
                  const items = [<ScheduleCard key={`l-${i}`} lesson={lesson} />];
                  if (i < day.lessons.length - 1) {
                    const next = day.lessons[i + 1];
                    const gap = parseTime(next.time_start) - parseTime(lesson.time_end);
                    if (gap > 20) {
                      items.push(
                        <ScheduleWindow key={`w-${i}`} start={lesson.time_end} end={next.time_start} />
                      );
                    }
                  }
                  return items;
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
