import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useMobileStore } from './store/mobileStore';
import { api } from './services/api';
import { Loader2 } from 'lucide-react';

// Pages
import ConnectionScreen from './pages/ConnectionScreen';
import LoginScreen from './pages/LoginScreen';
import Dashboard from './pages/Dashboard';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { connection } = useMobileStore();

  if (!connection.isConnected || !connection.apiUrl) {
    return <Navigate to="/connect" replace />;
  }

  return <Outlet />;
};

const DashboardRoute = () => {
  const { currentUser } = useMobileStore();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <Dashboard />;
};

function App() {
  const { syncQueue, connection, removeSyncedItems, isHydrated } = useMobileStore();

  // Background Sync Logic
  useEffect(() => {
    if (!connection.isConnected) return;

    const interval = setInterval(async () => {
      // 1. Push Queue - Copy queue to prevent modification during async op
      const queueToSync = [...syncQueue];
      if (queueToSync.length > 0) {
         try {
           const result = await api.syncPush(queueToSync);
           if (result && result.success) {
             // Only remove the specific items we sent
             removeSyncedItems(queueToSync);
           }
         } catch (e) {
           console.error("Sync push failed", e);
         }
      }
      // 2. We could also Pull here if needed for live inventory
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [connection.isConnected, syncQueue, removeSyncedItems]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/connect" element={<ConnectionScreen />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/dashboard" element={<DashboardRoute />} />
        </Route>

        <Route path="/" element={<Navigate to="/connect" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
