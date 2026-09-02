import React from 'react';
import { GraduationCap, User, MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const VK_SUPPORT_LINK = 'https://vk.ru/dimka050707';
const TG_SUPPORT_LINK = 'https://vk.ru/dimka050707';

const roleName = {
  admin: 'Администратор',
  starosta: 'Староста',
  user: 'Студент',
};

const platformLabel = {
  vk: 'ВКонтакте',
  telegram: 'Telegram',
  preview: 'режим предпросмотра',
};

export default function SettingsTab({ user }) {
  const { toast } = useToast();

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold tracking-tight">Настройки</h1>

      {/* Блок профиля */}
      <div className="rounded-xl border bg-white p-5 space-y-4">
        <div className="flex items-center gap-3">
          {user?.photo_url ? (
            <img
              src={user.photo_url}
              alt=""
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">
              {user?.full_name || 'Пользователь'}
            </p>
            <p className="text-xs text-muted-foreground">
              Вход через {platformLabel[user?.platform] || 'ВКонтакте'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
          <GraduationCap className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium">
            Роль: {roleName[user?.role] || 'Студент'}
          </span>
        </div>
      </div>

      {/* Блок группы */}
      <div className="rounded-xl border bg-white p-5">
        <p className="text-xs text-muted-foreground mb-3">
          Группа 3332705/50001 · ИММиТ · СПбПУ
        </p>
        <p className="text-xs text-muted-foreground">
          Расписание загружается с ruz.spbstu.ru
        </p>
      </div>

      {/* Блок обратной связи */}
      <div className="rounded-xl border bg-white p-5 space-y-2.5">
        <p className="text-sm font-semibold mb-1">Сообщить об ошибках</p>
        <a
          href={VK_SUPPORT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-primary shrink-0" />
          <span className="text-sm font-medium">
            Сообщить об ошибках бота и приложения в ВК
          </span>
        </a>
        <a
          href={TG_SUPPORT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <Send className="w-5 h-5 text-primary shrink-0" />
          <span className="text-sm font-medium">
            Сообщить об ошибках бота и приложения в ТГ
          </span>
        </a>
      </div>

      {/* Кнопка смены аккаунта */}
      <button
        onClick={() =>
          toast({
            title: `Вы вошли через ${platformLabel[user?.platform] || 'ВКонтакте'}`,
            description: 'Чтобы сменить аккаунт — выйдите и зайдите снова.',
          })
        }
        className="w-full text-xs text-muted-foreground py-2"
      >
        Сменить аккаунт
      </button>
    </div> {/* ✅ Вот этот закрывающий div был потерян */}
  );
}
