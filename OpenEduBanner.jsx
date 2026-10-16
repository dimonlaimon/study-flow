import React from 'react';

export function OpenEduBanner() {
  return (
    <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-800 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300 shadow-sm ring-1 ring-red-100 dark:ring-red-900/40">
      <h3 className="font-bold text-lg leading-tight mb-1 tracking-wide uppercase">
        САЙТ OPENEDU.RU ПОКА НЕ ДОСТУПЕН
      </h3>
      <p className="text-sm font-medium">
        Дедлайны по этому предмету не будут обновляться до восстановления работы сайта.
      </p>
    </div>
  );
}
