import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { usePosStore } from './store/posStore';
import CheckoutModal from './components/CheckoutModal';
import MainNavigator from './pages/MainNavigator';
import BusinessRegistrationPage from './pages/BusinessRegistrationPage';
import LoginScreen from './components/LoginScreen';
import OnScreenKeyboard from './components/OnScreenKeyboard';
import ErrorBoundary from './components/ErrorBoundary';
import AutoLogoutModal from './components/AutoLogoutModal';
import { useEffect, useRef } from 'react';
import { useIdle } from 'react-use';

function App() {
  const { businessSetup, loadInitialData, autoPrintClosingReport, isDataLoaded, logout, currentCashier } = usePosStore(state => ({
    businessSetup: state.businessSetup,
    loadInitialData: state.loadInitialData,
    autoPrintClosingReport: state.autoPrintClosingReport,
    isDataLoaded: state.isDataLoaded,
    logout: state.logout,
    currentCashier: state.currentCashier
  }));

  // Auto-logoff Logic
  // Default to 5 minutes if not set or 0
  const idleMinutes = businessSetup?.autoLogoffMinutes || 5;
  const idleMs = idleMinutes * 60 * 1000;

  // useIdle hook initializes with the duration.
  // Note: changing idleMs dynamically might not reset the internal timer of react-use's useIdle instantly in all versions,
  // but it usually reacts to prop changes or re-renders.
  const isIdle = useIdle(idleMs);

  useEffect(() => {
    const init = async () => {
      await loadInitialData();
      // autoPrintClosingReport(); // Disabled on startup per request
    };
    init();
  }, [loadInitialData, autoPrintClosingReport]);

  // Setup Electron IPC Listeners
  useEffect(() => {
    if (window.electron) {
        window.electron.onMobileDataSync((event, payload) => {
            console.log('Received mobile data sync:', payload);
            usePosStore.getState().handleMobileDataSync(payload);
        });
        window.electron.onNewMobileReceipt((event, receipt) => {
            console.log('Received new mobile receipt:', receipt);
            usePosStore.getState().addMobileReceipt(receipt);
        });
    }
  }, []);

  // Periodic Sync (Every 10 seconds)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const state = usePosStore.getState();
      const apiUrl = state.businessSetup?.apiUrl || state.businessSetup?.backOfficeUrl;
      const apiKey = state.businessSetup?.apiKey || state.businessSetup?.backOfficeApiKey;

      if (state.isOnline && apiUrl && apiKey) {
        // 1. Push Pending Changes / Full Sync
        // We use pushDataToServer() because it handles Direct DB Push (Full State Sync) if configured,
        // which is more robust than just processing the queue, ensuring mobile data is always propagated.
        console.log('Auto-sync: Pushing data to server...');
        state.pushDataToServer();

        // 2. Pull updates from server
        console.log('Auto-sync: Fetching updates from server (PULL)...');
        state.syncFromServer();
      } else {
        // Debug log to help diagnose why sync isn't running
        if (!state.isOnline) console.log('Auto-sync skipped: Offline');
        else if (!apiUrl) console.log('Auto-sync skipped: No API URL configured');
        else if (!apiKey) console.log('Auto-sync skipped: No API Key');
      }
    }, 10000);

    return () => clearInterval(syncInterval);
  }, []);

  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      const { businessSetup, openKeyboard } = usePosStore.getState();
      if (businessSetup?.onScreenKeyboard && (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
        if ((event.target as HTMLInputElement).type === 'file') {
          return;
        }
        openKeyboard(event.target as HTMLInputElement | HTMLTextAreaElement);
      }
    };

    window.addEventListener('focusin', handleFocus);

    return () => {
      window.removeEventListener('focusin', handleFocus);
    };
  }, []);

  if (!isDataLoaded) {
    return <div>Loading...</div>;
  }

  if (!businessSetup || !businessSetup.isSetup) {
    return <BusinessRegistrationPage />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-100">
          {!businessSetup.isLoggedIn ? <LoginScreen /> : <MainNavigator />}

          {/* Global Modals */}
          <CheckoutModal />
          <OnScreenKeyboard />

          {/* Auto Logoff Warning Modal */}
          {/* Only show if logged in, feature enabled, and idle */}
          {businessSetup.isLoggedIn && businessSetup.autoLogoffEnabled && isIdle && (
            <AutoLogoutModal onLogout={logout} userName={currentCashier?.name} />
          )}
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
