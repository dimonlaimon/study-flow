import { useState } from 'react';

export function AnnouncementBanner() {
  const [isClosed, setIsClosed] = useState(
    () => localStorage.getItem('announcementClosed') === 'true'
  );

  const handleClose = () => {
    localStorage.setItem('announcementClosed', 'true');
    setIsClosed(true);
  };

  // Если пользователь уже закрыл баннер, ничего не рендерим
  if (isClosed) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-auto p-4">
      {/* Затемнение фона */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={() => setIsClosed(true)} 
      />
      
      {/* Само окно уведомления */}
      <div className="relative w-full max-w-md p-6 rounded-lg shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-left">
        <h3 className="text-base font-medium mb-4 text-gray-800 dark:text-white">Уведомление</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Переезд приложения не произошёл по техническим причинам. Продолжаем пока пользоваться текущей версией.
        </p>
        
        <button
          onClick={handleClose}
          className="w-full px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors duration-200"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
