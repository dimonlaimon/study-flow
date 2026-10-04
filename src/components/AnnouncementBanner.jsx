import { useState } from 'react';

export function AnnouncementBanner() {
  const [isClosed, setIsClosed] = useState(
    () => localStorage.getItem('announcementClosed') === 'true'
  );

  const handleClose = () => {
    localStorage.setItem('announcementClosed', 'true');
    setIsClosed(true);
  };

  if (isClosed) return null;

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center">
      {/* Полупрозрачный фон */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Попап с сообщением */}
      <div className="relative w-full max-w-md p-6 rounded-lg shadow-xl border border-gray-300 dark:border-gray-700 text-left">
        <h3 className="text-base font-medium mb-4">Уведомление</h3>
        <p>Переезд приложения не произошёл по техническим причинам, продолжаем пользоваться пока этой версией.</p>
        <button
          onClick={handleClose}
          className="mt-4 inline-block px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:text-red-600"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
