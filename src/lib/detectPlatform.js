// Определяет платформу, в которой запущено приложение.
// Возвращает 'telegram' | 'vk' | 'preview'
export function detectPlatform() {
  if (typeof window === 'undefined') return 'preview';

  const tg = window.Telegram?.WebApp;
  if (tg) {
    // Telegram: initData — непустая строка, когда приложение открыто внутри Telegram
    if (typeof tg.initData === 'string' && tg.initData.length > 0) {
      return 'telegram';
    }
    // В некоторых случаях initData ещё не заполнен, но user уже доступен
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
      return 'telegram';
    }
  }
  // В некоторых вариантах встраивания данные приходят через hash
  if (window.location.hash.includes('tgWebAppData=')) {
    return 'telegram';
  }

  // VK нельзя определить синхронно надёжно — по умолчанию считаем VK,
  // а если VKWebAppGetUserInfo не ответит, auth-поток откатится в 'preview'.
  return 'vk';
}
