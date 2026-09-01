// Определяет платформу, в которой запущено приложение.
// Возвращает 'telegram' | 'vk' | 'preview'
export function detectPlatform() {
  if (typeof window === 'undefined') return 'preview';

  const tg = window.Telegram?.WebApp;
  let result = 'vk';

  if (tg) {
    if (typeof tg.initData === 'string' && tg.initData.length > 0) {
      result = 'telegram';
    } else if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
      result = 'telegram';
    }
  }
  if (result !== 'telegram' && window.location.hash.includes('tgWebAppData=')) {
    result = 'telegram';
  }

  // Отладка — поможет понять, почему Telegram не определяется
  console.log('[detectPlatform]', {
    hasTelegramWebApp: !!tg,
    initDataLength: tg?.initData?.length ?? 0,
    hasInitDataUnsafeUser: !!tg?.initDataUnsafe?.user,
    hash: window.location.hash,
    result,
  });

  return result;
}
