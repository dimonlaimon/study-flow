import { createContext, useContext, useEffect, useState } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import { supabase } from './supabaseClient';

const VkAuthContext = createContext(null);
export const useVkAuth = () => useContext(VkAuthContext);

export function VkAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!vkBridge.isWebView()) {
        setUser({ id: 'preview_user', full_name: 'Предпросмотр', photo_url: null, role: 'starosta' });
        setLoading(false);
        return;
      }
      try {
        await vkBridge.send('VKWebAppInit');
        const info = await vkBridge.send('VKWebAppGetUserInfo');
        if (!active) return;
        const vk_id = String(info.id);
        const full_name = [info.first_name, info.last_name].filter(Boolean).join(' ') || 'Студент';
        const photo_url = info.photo_100 || info.photo_200 || null;

        const { data: existing } = await supabase
          .from('profiles')
          .select('role')
          .eq('vk_id', vk_id)
          .maybeSingle();

        if (existing) {
          await supabase.from('profiles').update({ full_name, photo_url }).eq('vk_id', vk_id);
        } else {
          await supabase.from('profiles').insert({ vk_id, full_name, photo_url, role: 'user' });
        }
        if (!active) return;
        setUser({ id: vk_id, full_name, photo_url, role: existing?.role || 'user' });
      } catch (e) {
        if (!active) return;
        setUser({ id: 'preview_user', full_name: 'Предпросмотр', photo_url: null, role: 'starosta' });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return <VkAuthContext.Provider value={{ user, loading }}>{children}</VkAuthContext.Provider>;
}
