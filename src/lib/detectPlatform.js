// Определяет платформу, в которой запущено приложение.
// Возвращает 'telegram' | 'vk' | 'preview'
export function detectPlatform() {
  if (typeof window === 'undefined') return 'preview';

  const tg = window.Telegram?.WebApp;
  if (tg) {
    if (typeof tg.initData === 'string' && tg.initData.length > 0) {
      return 'telegram';
    }
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
      return 'telegram';
    }
  }

  if (window.location.hash.includes('tgWebAppData=')) {
    return 'telegram';
  }

  return 'vk';
}
