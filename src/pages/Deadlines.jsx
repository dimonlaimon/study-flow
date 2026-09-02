import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Target, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeadlineCard from '@/components/deadlines/DeadlineCard';
import DeadlineForm from '@/components/deadlines/DeadlineForm';
import { useToast } from '@/components/ui/use-toast';

export default function Deadlines({ user }) {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState(null);
  const { toast } = useToast();

  const isStarosta = user?.role === 'starosta' || user?.role === 'admin';

  const loadDeadlines = async () => {
    const { data, error } = await supabase
      .from('deadlines')
      .select('*')
      .order('due_date', { ascending: true });
    if (error) {
      toast({ title: 'Ошибка загрузки. Пожалуйста, попробуйте позже!', description: error.message, variant: 'destructive' });
    } else {
      setDeadlines(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { loadDeadlines(); }, []);

  const handleCreate = async (data) => {
    const { error } = await supabase.from('deadlines').insert({
      title: data.title,
      description: data.description || null,
      subject: data.subject || null,
      due_date: data.due_date,
      created_by_id: user?.id || null,
      created_by_name: user?.full_name || null
    });
    if (error) {
      toast({ title: 'Ошибка, что—то сломалось!', description: error.message, variant: 'destructive' });
      return;
    }
    setShowForm(false);
    toast({ title: 'Дедлайн добавлен' });
    loadDeadlines();
  };

  const handleEdit = async (data) => {
    const { error } = await supabase.from('deadlines').update({
      title: data.title,
      description: data.description || null,
      subject: data.subject || null,
      due_date: data.due_date
    }).eq('id', editingDeadline.id);
    if (error) {
      toast({ title: 'Ошибка, что—то сломалось!', description: error.message, variant: 'destructive' });
      return;
    }
    setEditingDeadline(null);
    toast({ title: 'Дедлайн изменён' });
    loadDeadlines();
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('deadlines').delete().eq('id', id);
    if (error) {
      toast({ title: 'Ошибка, что—то сломалось!', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Дедлайн удалён' });
    loadDeadlines();
  };

  const upcoming = deadlines.filter(d => new Date(d.due_date) >= new Date());
  const past = deadlines.filter(d => new Date(d.due_date) < new Date());

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Дедлайны</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {upcoming.length} активных
          </p>
        </div>
        {isStarosta && !showForm && !editingDeadline && (
          <Button size="sm" onClick={() => setShowForm(true)} className="rounded-full">
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        )}
      </div>

      {showForm && (
        <DeadlineForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {editingDeadline && (
        <DeadlineForm
          deadline={editingDeadline}
          onSubmit={handleEdit}
          onCancel={() => setEditingDeadline(null)}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : deadlines.length === 0 ? (
        <div className="text-center py-16">
          <Target className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Дедлайнов пока нет</p>
          {isStarosta && (
            <p className="text-xs text-muted-foreground mt-1">Вы можете добавить первый дедлайн</p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {upcoming.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Предстоящие</h2>
              {upcoming.map(d => (
                <DeadlineCard
                  key={d.id}
                  deadline={d}
                  canDelete={isStarosta}
                  canEdit={isStarosta}
                  onDelete={handleDelete}
                  onEdit={setEditingDeadline}
                />
              ))}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Прошедшие</h2>
              {past.map(d => (
                <DeadlineCard
                  key={d.id}
                  deadline={d}
                  canDelete={isStarosta}
                  canEdit={isStarosta}
                  onDelete={handleDelete}
                  onEdit={setEditingDeadline}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
