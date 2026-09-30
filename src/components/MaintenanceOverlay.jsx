import React from "react";

export default function MaintenanceOverlay() {
  return (
    <div className="fixed inset-0 z-[999] bg-gray/60 backdrop-blur-sm flex items-center justify-center">
      <div className="text-white text-center p-5 space-y-3 rounded-md border border-gray-700 max-w-xs">
        <div className="text-6xl">🔒</div>
        <h1 className="text-xl">Идёт настройка приложения на октябрь</h1>
        <p>Приложение заработает 2 октября.</p>
      </div>
    </div>
  );
}

