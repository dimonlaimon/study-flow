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

    async function syncProfile(platformId, platformName, full_name, photo_url) {
      // Синхронизирует профиль в БД. Ошибки логируются, но не ломают авторизацию.
      const column = platformName === 'telegram' ? 'telegram_id' : 'vk_id';
      let role = 'user';
      try {
        const { data: existing, error: selError } = await supabase
          .from('profiles')
          .select('role')
          .eq(column, platformId)
          .maybeSingle();

        if (selError) {
          console.error(`[PlatformAuth] ${platformName} DB select failed:`, selError.message);
        } else if (existing) {
          role = existing.role || 'user';
          const { error: updError } = await supabase
            .from('profiles')
            .update({ full_name, photo_url })
            .eq(column, platformId);
          if (updError) console.error(`[PlatformAuth] ${platformName} DB update failed:`, updError.message);
        } else {
          const { error: insError } = await supabase
            .from('profiles')
            .insert({ [column]: platformId, full_name, photo_url, role: 'user' });
          if (insError) console.error(`[PlatformAuth] ${platformName} DB insert failed:`, insError.message);
        }
      } catch (dbErr) {
        console.error(`[PlatformAuth] ${platformName} DB error:`, dbErr);
      }
      return role;
    }

    async function initVk() {
      try {
        await vkBridge.send('VKWebAppInit');
        const info = await vkBridge.send('VKWebAppGetUserInfo');
        if (!active) return;
        const vk_id = String(info.id);
        const full_name = [info.first_name, info.last_name].filter(Boolean).join(' ') || 'Студент';
        const photo_url = info.photo_100 || info.photo_200 || null;

        const role = await syncProfile(vk_id, 'vk', full_name, photo_url);
        if (!active) return;
        setUser({ id: vk_id, full_name, photo_url, role, platform: 'vk' });
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

        // Авторизуем пользователя из данных Telegram — привязка к аккаунту не зависит от БД
        const role = await syncProfile(telegram_id, 'telegram', full_name, photo_url);
        if (!active) return;
        setUser({ id: telegram_id, full_name, photo_url, role, platform: 'telegram' });
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
