import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useMobileStore } from './store/mobileStore';
import { api } from './services/api';

// Pages
import ConnectionScreen from './pages/ConnectionScreen';
import LoginScreen from './pages/LoginScreen';
import Dashboard from './pages/Dashboard';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { connection, currentUser } = useMobileStore();

  if (!connection.isConnected || !connection.apiUrl) {
    return <Navigate to="/connect" replace />;
  }

  // If connected but no user logged in, allow login screen but not dashboard
  // We handle specific route protection inside the switch or here.
  // For Dashboard, we need a user.

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
  const { syncQueue, connection, clearSyncQueue } = useMobileStore();

  // Background Sync Logic
  useEffect(() => {
    if (!connection.isConnected) return;

    const interval = setInterval(async () => {
      // 1. Push Queue
      if (syncQueue.length > 0) {
         try {
           const result = await api.syncPush(syncQueue);
           if (result && result.success) {
             clearSyncQueue();
           }
         } catch (e) {
           console.error("Sync push failed", e);
         }
      }
      // 2. We could also Pull here if needed for live inventory
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [connection.isConnected, syncQueue, clearSyncQueue]);

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
