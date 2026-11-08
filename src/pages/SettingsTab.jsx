import React, { useState, useEffect } from 'react';
import { GraduationCap, User, MessageCircle, Send, Bell, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { usePlatformAuth } from '@/lib/PlatformAuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Switch } from '@/components/ui/switch';
import vkBridge from '@vkontakte/vk-bridge';

// Ссылки на поддержку
const VK_SUPPORT_LINK = 'https://vk.ru/dimka050707';
const TG_SUPPORT_LINK = 'https://t.me/dimkalemon';

// ID сообщества VK (dedlinebot)
const VK_COMMUNITY_ID = 236945646;

// Ссылка на Telegram-бота
const TG_BOT_LINK = 'https://t.me/dedline_edu_bot';

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

// Открывает внешнюю ссылку из мини-приложения.
// В Telegram — официальный openLink из SDK.
// В VK (особенно на десктопе) window.open из iframe блокируется
// как поп-ап, поэтому создаём ссылку и кликаем по ней программно —
// это пользовательская навигация, её блокировщики не режут.
function openExternal(url) {
  if (window.Telegram?.WebApp?.openLink) {
    window.Telegram.WebApp.openLink(url);
    return;
  }

  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

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
            <p className="text-xs text-muted-foreground">
              Вход через {platformLabel[user?.platform] || 'ВКонтакте'}
            </p>
          </div>
        </div>

        {/* Этот блок восстановлен по смыслу — в PDF он не читался.
            Поправьте оформление, если в оригинале он выглядел иначе. */}
        <div className="flex items-center gap-2 pt-1 border-t">
          <GraduationCap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{roleName[user?.role] || 'Студент'}</span>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold">Уведомления о дедлайнах</p>
        </div>

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
              <button
                type="button"
                onClick={() => openExternal(TG_BOT_LINK)}
                className="text-xs text-primary inline-flex items-center gap-0.5"
              >
                Сначала запустите бота <ExternalLink className="w-3 h-3" />
              </button>
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

        <button
          type="button"
          onClick={() => openExternal(VK_SUPPORT_LINK)}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-left"
        >
          <MessageCircle className="w-5 h-5 text-primary shrink-0" />
          <span className="text-sm font-medium">Сообщить об ошибках бота и приложения в ВК</span>
        </button>

        <button
          type="button"
          onClick={() => openExternal(TG_SUPPORT_LINK)}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-left"
        >
          <Send className="w-5 h-5 text-primary shrink-0" />
          <span className="text-sm font-medium">Сообщить об ошибках бота и приложения в ТГ</span>
        </button>
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
