import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useMobileStore } from './store/mobileStore';
import ConnectScreen from './pages/ConnectScreen';
import LoginScreen from './pages/LoginScreen';
import MobilePOS from './pages/MobilePOS';

const App = () => {
  const { isConnected, currentUser, checkConnection, syncWithServer } = useMobileStore();

  // Attempt auto-reconnect on mount
  useEffect(() => {
      checkConnection();
  }, []);

  // Periodically sync (Pull)
  useEffect(() => {
      const interval = setInterval(() => {
          if (isConnected && currentUser) {
              syncWithServer();
          }
      }, 30000); // Every 30s
      return () => clearInterval(interval);
  }, [isConnected, currentUser]);

  if (!isConnected) {
    return <ConnectScreen />;
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MobilePOS />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
