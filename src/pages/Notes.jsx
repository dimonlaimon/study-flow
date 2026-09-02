import React, { useState, useEffect } from 'react';
import { Loader2, StickyNote, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NoteCard from '@/components/notes/NoteCard';
import NoteForm from '@/components/notes/NoteForm';
import { useToast } from '@/components/ui/use-toast';

const storageKey = (uid) => `studyflow_notes_${uid || 'local'}`;

export default function Notes({ user }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(user?.id));
      setNotes(raw ? JSON.parse(raw) : []);
    } catch {
      setNotes([]);
    }
    setLoading(false);
  }, [user?.id]);

  const persist = (next) => {
    setNotes(next);
    localStorage.setItem(storageKey(user?.id), JSON.stringify(next));
  };

  const handleCreate = (data) => {
    const note = { ...data, id: Date.now().toString(), created_date: new Date().toISOString() };
    persist([note, ...notes]);
    setShowForm(false);
    toast({ title: 'Заметка создана' });
  };

  const handleUpdate = (data) => {
    persist(notes.map(n => (n.id === editingNote.id ? { ...n, ...data } : n)));
    setEditingNote(null);
    toast({ title: 'Заметка изменена' });
  };

  const handleDelete = (id) => {
    persist(notes.filter(n => n.id !== id));
    toast({ title: 'Заметка удалена' });
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Мои заметки</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Видны только вам. ВНИМАНИЕ! Заметки не хранятся в базе данных, они есть только на вашем устройстве. Поэтому при очистке кэша—мини приложения, ВК или ТГ, заметки безвозвратно стираются! (Позже будет исправлено)</p>
        </div>
        {!showForm && !editingNote && (
          <Button size="sm" onClick={() => setShowForm(true)} className="rounded-full">
            <Plus className="w-4 h-4 mr-1" />Добавить
          </Button>
        )}
      </div>

      {showForm && (
        <NoteForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {editingNote && (
        <NoteForm note={editingNote} onSubmit={handleUpdate} onCancel={() => setEditingNote(null)} />
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : notes.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <StickyNote className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">У вас пока нет заметок</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {notes.map(note => (
            <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
