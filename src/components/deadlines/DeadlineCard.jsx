import React from 'react';
import { Trash2, Pencil, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, differenceInHours } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function DeadlineCard({ deadline, canDelete, canEdit, onDelete, onEdit }) {
  const dueDate = new Date(deadline.due_date);
  const hoursLeft = differenceInHours(dueDate, new Date());
  const isPast = hoursLeft < 0;
  const isUrgent = hoursLeft >= 0 && hoursLeft <= 24;

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isPast ? 'bg-gray-50 border-gray-200 opacity-60' :
      isUrgent ? 'bg-red-50 border-red-200' :
      'bg-white border-border hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isUrgent && !isPast && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
            <h3 className="font-semibold text-sm break-words">{deadline.title}</h3>
          </div>
          {deadline.subject && (
            <p className="text-xs text-muted-foreground mb-1 break-words">{deadline.subject}</p>
          )}
          {deadline.description && (
            <p className="text-xs text-muted-foreground break-words whitespace-pre-wrap">{deadline.description}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className={`text-xs font-medium ${isPast ? 'text-gray-500' : isUrgent ? 'text-red-600' : 'text-foreground'}`}>
            {format(dueDate, 'd MMM', { locale: ru })}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(dueDate, 'HH:mm')}
          </p>
          {!isPast && (
            <p className={`text-xs mt-0.5 ${isUrgent ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
              {hoursLeft < 1 ? 'Менее часа' :
               hoursLeft < 24 ? `${hoursLeft} ч.` :
               `${Math.floor(hoursLeft / 24)} дн.`}
            </p>
          )}
        </div>
      </div>
      {(canDelete || canEdit) && (
        <div className="mt-3 flex justify-end gap-1">
          {canEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(deadline)} className="h-7 px-2">
              <Pencil className="w-3.5 h-3.5 mr-1" />
              Изменить
            </Button>
          )}
          {canDelete && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(deadline.id)} className="text-destructive hover:text-destructive h-7 px-2">
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Удалить
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
