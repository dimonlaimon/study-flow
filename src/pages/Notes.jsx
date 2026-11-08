import React, { useState, useEffect } from 'react';
import { Loader2, StickyNote, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import NoteCard from '@/components/notes/NoteCard';
import NoteForm from '@/components/notes/NoteForm';
import { useToast } from '@/components/ui/use-toast';
import { encryptText, decryptText } from '@/lib/crypto';

export default function Notes({ user }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const { toast } = useToast();

  // Идентификатор владельца: "vk_123", "telegram_456" и т.п.
  const ownerId = user?.id ? `${user.platform || 'vk'}_${user.id}` : null;

  useEffect(() => {
    let cancelled = false;

    // Разовый перенос старых заметок из localStorage в базу.
    // После успешной загрузки localStorage очищается.
    async function migrateLocal() {
      const raw = localStorage.getItem(`studyflow_notes_${user.id}`);
      if (!raw) return;

      let localNotes = [];
      try {
        localNotes = JSON.parse(raw) || [];
      } catch {
        localStorage.removeItem(`studyflow_notes_${user.id}`);
        return;
      }

      if (!localNotes.length) {
        localStorage.removeItem(`studyflow_notes_${user.id}`);
        return;
      }

      for (const n of localNotes) {
        const title_enc = await encryptText(ownerId, n.title || '');
        const content_enc = await encryptText(ownerId, n.content || '');
        await supabase.from('notes').insert({
          owner_id: ownerId,
          title_enc,
          content_enc,
          color: n.color || null,
          created_date: n.created_date || new Date().toISOString(),
        });
      }

      localStorage.removeItem(`studyflow_notes_${user.id}`);
    }

    async function load() {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_date', { ascending: false });

      if (error) {
        if (!cancelled) {
          toast({ title: 'Ошибка загрузки заметок', description: error.message, variant: 'destructive' });
          setLoading(false);
        }
        return;
      }

      const decrypted = await Promise.all(
        (data || []).map(async (row) => {
          const note = {
            id: row.id,
            color: row.color,
            created_date: row.created_date,
            title: '',
            content: '',
          };
          try {
            note.title = (await decryptText(ownerId, row.title_enc)) || '(без названия)';
          } catch {
            note.title = '(не удалось расшифровать)';
          }
          try {
            note.content = (await decryptText(ownerId, row.content_enc)) || '';
          } catch {
            note.content = '';
          }
          return note;
        })
      );

      if (cancelled) return;
      setNotes(decrypted);
      setLoading(false);
    }

    async function init() {
      if (!ownerId) {
        setLoading(false);
        return;
      }
      try {
        await migrateLocal();
      } catch (e) {
        console.warn('[Notes] миграция localStorage не удалась:', e);
      }
      await load();
    }

    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  const handleCreate = async (data) => {
    try {
      const title_enc = await encryptText(ownerId, data.title || '');
      const content_enc = await encryptText(ownerId, data.content || '');
      const { data: rows, error } = await supabase
        .from('notes')
        .insert({
          owner_id: ownerId,
          title_enc,
          content_enc,
          color: data.color || null,
        })
        .select();
      if (error) throw error;

      const row = rows[0];
      setNotes([
        { id: row.id, title: data.title || '', content: data.content || '', color: data.color || null, created_date: row.created_date },
        ...notes,
      ]);
      setShowForm(false);
      toast({ title: 'Заметка создана' });
    } catch (e) {
      toast({ title: 'Ошибка', description: e.message || 'Не удалось сохранить заметку', variant: 'destructive' });
    }
  };

  const handleUpdate = async (data) => {
    try {
      const title_enc = await encryptText(ownerId, data.title || '');
      const content_enc = await encryptText(ownerId, data.content || '');
      const { error } = await supabase
        .from('notes')
        .update({ title_enc, content_enc, color: data.color || null, updated_date: new Date().toISOString() })
        .eq('id', editingNote.id);
      if (error) throw error;

      setNotes(notes.map((n) => (n.id === editingNote.id ? { ...n, ...data } : n)));
      setEditingNote(null);
      toast({ title: 'Заметка изменена' });
    } catch (e) {
      toast({ title: 'Ошибка', description: e.message || 'Не удалось сохранить заметку', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
      return;
    }
    setNotes(notes.filter((n) => n.id !== id));
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
          <p className="text-xs text-muted-foreground mt-0.5">
            Заметки хранятся в базе в зашифрованном виде — прочитать их можно только на вашем устройстве.
          </p>
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
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
