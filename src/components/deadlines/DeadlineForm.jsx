import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';

export default function DeadlineForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: '', description: '', subject: '', due_date: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.due_date) return;
    setLoading(true);
    await onSubmit({
      ...form,
      due_date: new Date(form.due_date).toISOString()
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Новый дедлайн</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel} className="h-7 w-7">
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Название *</Label>
          <Input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Сдать лабораторную №3"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Предмет</Label>
          <Input
            value={form.subject}
            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            placeholder="Физика"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Описание</Label>
          <Textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Подробности..."
            className="mt-1"
            rows={2}
          />
        </div>
        <div>
          <Label className="text-xs">Срок *</Label>
          <Input
            type="datetime-local"
            value={form.due_date}
            onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>
      <Button type="submit" disabled={loading || !form.title || !form.due_date} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        {loading ? 'Добавление...' : 'Добавить дедлайн'}
      </Button>
    </form>
  );
}
