import React from 'react';
import { GraduationCap, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const roleName = {
  admin: 'Администратор',
  starosta: 'Староста',
  user: 'Студент'
};

const platformLabel = {
  vk: 'ВКонтакте',
  telegram: 'Telegram',
  preview: 'режим предпросмотра'
};

export default function SettingsTab({ user }) {
  const { toast } = useToast();

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold tracking-tight">Настройки</h1>

      <div className="rounded-xl border bg-white p-5 space-y-4">
        <div className="flex items-center gap-3">
          {user?.photo_url ? (
            <img src={user.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">{user?.full_name || 'Пользователь'}</p>
            <p className="text-xs text-muted-foreground">Вход через {platformLabel[user?.platform] || 'ВКонтакте'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
          <GraduationCap className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium">
            Роль: {roleName[user?.role] || 'Студент'}
          </span>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <p className="text-xs text-muted-foreground mb-3">
          Группа 3332705/50001 · ИММиТ · СПбПУ
        </p>
        <p className="text-xs text-muted-foreground">
          Расписание загружается с ruz.spbstu.ru
        </p>
      </div>

      <button
        onClick={() => toast({ title: `Вы вошли через ${platformLabel[user?.platform] || 'ВКонтакте'}`, description: 'Чтобы сменить аккаунт — выйдите и зайдите снова.' })}
        className="w-full text-xs text-muted-foreground py-2"
      >
        Сменить аккаунт
      </button>
    </div>
  );
}
