import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import { PlatformAuthProvider, usePlatformAuth } from '@/lib/PlatformAuthContext';
import ScrollToTop from './components/ScrollToTop';
import Home from '@/pages/Home';

const AuthenticatedApp = () => {
  const { loading } = usePlatformAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
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
          <Toaster />
        </QueryClientProvider>
      </PlatformAuthProvider>
    </AuthProvider>
  )
}

export default App
