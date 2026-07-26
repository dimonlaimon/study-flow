import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

const colors = [
  { value: 'yellow', bg: 'bg-amber-400' },
  { value: 'blue', bg: 'bg-blue-400' },
  { value: 'green', bg: 'bg-emerald-400' },
  { value: 'pink', bg: 'bg-pink-400' },
  { value: 'purple', bg: 'bg-purple-400' },
];

export default function NoteForm({ note, onSubmit, onCancel }) {
  const [form, setForm] = useState({ title: '', content: '', color: 'yellow' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (note) {
      setForm({ title: note.title, content: note.content || '', color: note.color || 'yellow' });
    }
  }, [note]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{note ? 'Редактировать' : 'Новая заметка'}</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel} className="h-7 w-7">
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Заголовок *</Label>
          <Input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Моя заметка"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Текст</Label>
          <Textarea
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="Текст заметки..."
            className="mt-1"
            rows={3}
          />
        </div>
        <div>
          <Label className="text-xs mb-2 block">Цвет</Label>
          <div className="flex gap-2">
            {colors.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, color: c.value }))}
                className={`w-7 h-7 rounded-full ${c.bg} transition-all ${
                  form.color === c.value ? 'ring-2 ring-offset-2 ring-foreground scale-110' : 'hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      <Button type="submit" disabled={loading || !form.title} className="w-full">
        {loading ? 'Сохранение...' : note ? 'Сохранить' : 'Создать'}
      </Button>
    </form>
  );
}
