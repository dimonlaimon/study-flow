import { createContext, useContext, useEffect, useState } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import { supabase } from './supabaseClient';
import { detectPlatform } from './detectPlatform';

const PlatformAuthContext = createContext(null);
export const usePlatformAuth = () => useContext(PlatformAuthContext);

const PREVIEW_USER = {
  id: 'preview_user',
  full_name: 'Предпросмотр',
  photo_url: null,
  role: 'starosta',
  platform: 'preview',
};

export function PlatformAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [platform] = useState(() => detectPlatform());

  useEffect(() => {
    let active = true;

    if (platform === 'telegram') {
      initTelegram();
    } else {
      initVk();
    }

    async function initVk() {
      try {
        await vkBridge.send('VKWebAppInit');
        const info = await vkBridge.send('VKWebAppGetUserInfo');
        if (!active) return;
        const vk_id = String(info.id);
        const full_name = [info.first_name, info.last_name].filter(Boolean).join(' ') || 'Студент';
        const photo_url = info.photo_100 || info.photo_200 || null;

        const { data: existing, error: selError } = await supabase
          .from('profiles')
          .select('role')
          .eq('vk_id', vk_id)
          .maybeSingle();

        if (selError) throw selError;

        if (existing) {
          const { error: updError } = await supabase
            .from('profiles')
            .update({ full_name, photo_url })
            .eq('vk_id', vk_id);
          if (updError) throw updError;
        } else {
          const { error: insError } = await supabase
            .from('profiles')
            .insert({ vk_id, full_name, photo_url, role: 'user' });
          if (insError) throw insError;
        }
        if (!active) return;
        setUser({ id: vk_id, full_name, photo_url, role: existing?.role || 'user', platform: 'vk' });
      } catch (e) {
        console.error('[PlatformAuth] VK init failed:', e);
        if (!active) return;
        setUser(PREVIEW_USER);
      } finally {
        if (active) setLoading(false);
      }
    }

    async function initTelegram() {
      try {
        const tg = window.Telegram?.WebApp;
        if (!tg) throw new Error('Telegram WebApp SDK не найден');
        tg.ready();
        tg.expand();
        const tgUser = tg.initDataUnsafe?.user;
        if (!tgUser) throw new Error('Нет данных пользователя Telegram');
        if (!active) return;
        const telegram_id = String(tgUser.id);
        const full_name = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || 'Студент';
        const photo_url = tgUser.photo_url || null;

        const { data: existing, error: selError } = await supabase
          .from('profiles')
          .select('role')
          .eq('telegram_id', telegram_id)
          .maybeSingle();

        if (selError) throw selError;

        if (existing) {
          const { error: updError } = await supabase
            .from('profiles')
            .update({ full_name, photo_url })
            .eq('telegram_id', telegram_id);
          if (updError) throw updError;
        } else {
          const { error: insError } = await supabase
            .from('profiles')
            .insert({ telegram_id, full_name, photo_url, role: 'user' });
          if (insError) throw insError;
        }
        if (!active) return;
        setUser({ id: telegram_id, full_name, photo_url, role: existing?.role || 'user', platform: 'telegram' });
      } catch (e) {
        console.error('[PlatformAuth] Telegram init failed:', e);
        if (!active) return;
        setUser(PREVIEW_USER);
      } finally {
        if (active) setLoading(false);
      }
    }

    return () => { active = false; };
  }, [platform]);

  return (
    <PlatformAuthContext.Provider value={{ user, loading, platform }}>
      {children}
    </PlatformAuthContext.Provider>
  );
}
