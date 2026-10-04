// src/components/AnnouncementBanner.jsx

import { useEffect } from 'react';

export function AnnouncementBanner() {
  // Проверка флага закрытия при монтировании компонента.
  const isClosed = localStorage.getItem('announcementClosed');

  return (
    <>
      {/* Если флаг установлен, ничего не показываем */}
      {!isClosed && (
        <div className="fixed inset-0 z-[998] flex items-center justify-center">
          {/* Полупрозрачный фон для эффекта "выделенности" попапа.
              Вы можете удалить этот div, если хотите видеть приложение без затемнения. */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Сам попап с сообщением */}
          <div className="relative w-full max-w-md p-6 rounded-lg shadow-xl border border-gray-300 dark:border-gray-700 text-left">
            <h3 className="text-base font-medium mb-4">Уведомление</h3>
            <p>Переезд приложения не произошел по техническим причинам, продолжаем пользоваться пока этой версией.</p>
            <button 
              onClick={() => localStorage.setItem('announcementClosed', 'true')}
              className="mt-4 inline-block px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:text-red-600"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
}
