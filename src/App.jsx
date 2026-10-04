import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import Home from '@/pages/Home';

// Импорты для работы заглушки и объявления
import MaintenanceOverlay from './components/MaintenanceOverlay';
import { useMaintenance } from './components/useMaintenance';
// ВАЖНО: Именованный импорт (в фигурных скобках)
import { AnnouncementBanner } from './components/AnnouncementBanner';

import { AuthProvider } from '@/lib/AuthContext';
import { PlatformAuthProvider, usePlatformAuth } from '@/lib/PlatformAuthContext';
import ScrollToTop from './components/ScrollToTop';

const AuthenticatedApp = () => {
  // Проверка режима обслуживания
  if (useMaintenance()) return <MaintenanceOverlay />;

  const { loading } = usePlatformAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Основной маршрут */}
      <Route path="/" element={<Home />} />
      {/* Обработчик ошибки 404 */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <PlatformAuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router basename="/study-flow">
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>

          {/* Глобальные элементы (не зависят от пути) */}
          <AnnouncementBanner />
          <Toaster />
        </QueryClientProvider>
      </PlatformAuthProvider>
    </AuthProvider>
  );
}

export default App;
