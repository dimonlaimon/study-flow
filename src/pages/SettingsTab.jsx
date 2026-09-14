import React, { useState, useEffect } from 'react';
import { GraduationCap, User, MessageCircle, Send, Bell, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { usePlatformAuth } from '@/lib/PlatformAuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Switch } from '@/components/ui/switch';
import vkBridge from '@vkontakte/vk-bridge';

// Вставьте сюда свои ссылки на поддержку
const VK_SUPPORT_LINK = 'https://vk.ru/dimka050707';
const TG_SUPPORT_LINK = 'https://t.me/dimkalemon';

// ID сообщества ВК (dedlinebot) — замените на числовой ID группы
const VK_COMMUNITY_ID = 236945646;

// Ссылка на Telegram-бота
const TG_BOT_LINK = 'https://t.me/dedline_edu_bot';

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
  const { platform } = usePlatformAuth();
  const [vkNotify, setVkNotify] = useState(false);
  const [tgNotify, setTgNotify] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const column = platform === 'telegram' ? 'telegram_id' : 'vk_id';
    supabase
      .from('profiles')
      .select('vk_notify_enabled, tg_notify_enabled')
      .eq(column, user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setVkNotify(!!data.vk_notify_enabled);
          setTgNotify(!!data.tg_notify_enabled);
        }
      });
  }, [user?.id, platform]);

  async function toggleVk() {
    if (busy || platform !== 'vk') return;
    setBusy(true);
    try {
      if (!vkNotify && VK_COMMUNITY_ID) {
        await vkBridge.send('VKWebAppAllowMessagesFromGroup', { group_id: VK_COMMUNITY_ID });
      }
      const { error } = await supabase
        .from('profiles')
        .update({ vk_notify_enabled: !vkNotify })
        .eq('vk_id', user.id);
      if (error) throw error;
      setVkNotify(!vkNotify);
      toast({ title: !vkNotify ? 'Уведомления ВК включены' : 'Уведомления ВК выключены' });
    } catch (e) {
      toast({ title: 'Ошибка', description: e.message || 'Не удалось включить', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  }

  async function toggleTg() {
    if (busy || platform !== 'telegram') return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ tg_notify_enabled: !tgNotify })
        .eq('telegram_id', user.id);
      if (error) throw error;
      setTgNotify(!tgNotify);
      toast({
        title: !tgNotify ? 'Уведомления Telegram включены' : 'Уведомления Telegram выключены',
        description: !tgNotify ? 'Убедитесь, что вы запустили @dedline_edu_bot' : undefined,
      });
    } catch (e) {
      toast({ title: 'Ошибка', description: e.message || 'Не удалось включить', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  }

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

      <div className="rounded-xl border bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold">Уведомления о дедлайнах</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Сообщения приходят за 2 дня до дедлайна от имени сообщества ВК или бота Telegram.
        </p>

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">ВКонтакте</p>
            {platform !== 'vk' && (
              <p className="text-xs text-muted-foreground">Войдите через ВК, чтобы включить</p>
            )}
          </div>
          <Switch
            checked={vkNotify}
            onCheckedChange={toggleVk}
            disabled={platform !== 'vk' || busy}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Telegram</p>
            {platform === 'telegram' && !tgNotify && (
              <a href__={TG_BOT_LINK} target="_blank" rel="noopener noreferrer" className="text-xs text-primary inline-flex items-center gap-0.5">
                Сначала запустите бота <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {platform !== 'telegram' && (
              <p className="text-xs text-muted-foreground">Войдите через Telegram, чтобы включить</p>
            )}
          </div>
          <Switch
            checked={tgNotify}
            onCheckedChange={toggleTg}
            disabled={platform !== 'telegram' || busy}
          />
        </div>

        {busy && (
          <div className="flex justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-white p-5">
        <p className="text-xs text-muted-foreground mb-3">
          Группа 3332705/50001 · ИММиТ · СПбПУ
        </p>
        <p className="text-xs text-muted-foreground">
          Расписание загружается с ruz.spbstu.ru
        </p>
      </div>

      <div className="rounded-xl border bg-white p-5 space-y-2.5">
        <p className="text-sm font-semibold mb-1">Сообщить об ошибках</p>
        <a
          href__={VK_SUPPORT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-primary shrink-0" />
          <span className="text-sm font-medium">Сообщить об ошибках бота и приложения в ВК</span>
        </a>
        <a
          href__={TG_SUPPORT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <Send className="w-5 h-5 text-primary shrink-0" />
          <span className="text-sm font-medium">Сообщить об ошибках бота и приложения в ТГ</span>
        </a>
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
