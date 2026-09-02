import React from 'react';
import { Clock, MapPin, User } from 'lucide-react';

const typeColors = {
  'Лекция': 'bg-white-50 border-white-200 text-white-700',
  'Практика': 'bg-green-50 border-green-200 text-green-700',
  'Лабораторные': 'bg-green-50 border-green-200 text-green-700',
  'Экзамен': 'bg-red-50 border-red-200 text-red-700',
  'Зачет': 'bg-red-50 border-red-200 text-red-700',
  'Консультация': 'bg-grey-50 border-grey-200 text-grey-700',
};

const typeDots = {
  'Лекция': 'bg-white-500',
  'Практика': 'bg-green-500',
  'Лабораторные': 'bg-green-500',
  'Экзамен': 'bg-red-500',
  'Зачет': 'bg-red-500',
  'Консультация': 'bg-grey-500',
};

export default function ScheduleCard({ lesson }) {
  const typeName = lesson.typeObj?.name || 'Занятие';
  const colorClass = typeColors[typeName] || 'bg-gray-50 border-gray-200 text-gray-700';
  const dotClass = typeDots[typeName] || 'bg-gray-500';

  return (
    <div className={`rounded-xl border p-4 ${colorClass} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`w-2 h-2 rounded-full ${dotClass} shrink-0`} />
            <span className="text-xs font-semibold uppercase tracking-wide opacity-80">{typeName}</span>
          </div>
          <h3 className="font-semibold text-sm leading-snug text-foreground break-words">
            {lesson.subject}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium shrink-0 bg-white/60 rounded-lg px-2.5 py-1.5">
          <Clock className="w-3.5 h-3.5" />
          {lesson.time_start}–{lesson.time_end}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        {lesson.teachers?.length > 0 && (
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>{lesson.teachers[0].full_name}</span>
          </div>
        )}
        {lesson.auditories?.length > 0 && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {lesson.auditories[0].building?.abbr || lesson.auditories[0].building?.name}, ауд. {lesson.auditories[0].name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
