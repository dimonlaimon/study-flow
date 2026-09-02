import React from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const colorStyles = {
  white: 'bg-white-50 border-white-200',
  yellow: 'bg-amber-50 border-amber-200',
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-emerald-50 border-emerald-200',
  pink: 'bg-pink-50 border-pink-200',
  purple: 'bg-purple-50 border-purple-200',
};

export default function NoteCard({ note, onEdit, onDelete }) {
  const style = colorStyles[note.color] || colorStyles.white;

  return (
    <div className={`rounded-xl border p-4 ${style} transition-all hover:shadow-md`}>
      <h3 className="font-semibold text-sm mb-1 break-words">{note.title}</h3>
      {note.content && (
        <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words">{note.content}</p>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {format(new Date(note.created_date), 'd MMM', { locale: ru })}
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(note)} className="h-7 w-7">
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(note.id)} className="h-7 w-7 text-destructive hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
