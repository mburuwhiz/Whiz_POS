import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { usePosStore } from './store/posStore';
import CheckoutModal from './components/CheckoutModal';
import MainNavigator from './pages/MainNavigator';
import BusinessRegistrationPage from './pages/BusinessRegistrationPage';
import LoginScreen from './components/LoginScreen';
import OnScreenKeyboard from './components/OnScreenKeyboard';
import ErrorBoundary from './components/ErrorBoundary';
import { useEffect } from 'react';

/**
 * The root application component.
 *
 * Responsibilities:
 * 1. Initializes the application state by loading data from storage.
 * 2. Manages the global focus event listener for the on-screen keyboard.
 * 3. Renders the initial loading state.
 * 4. Routes between the Setup Wizard, Login Screen, and the Main Application based on state.
 *
 * @returns {JSX.Element} The rendered application.
 */
function App() {
  const { businessSetup, loadInitialData, autoPrintClosingReport, isDataLoaded } = usePosStore(state => ({
    businessSetup: state.businessSetup,
    loadInitialData: state.loadInitialData,
    autoPrintClosingReport: state.autoPrintClosingReport,
    isDataLoaded: state.isDataLoaded,
  }));

  // Initial data loading and automated startup tasks
  useEffect(() => {
    const init = async () => {
      await loadInitialData();
      autoPrintClosingReport();
    };
    init();
  }, [loadInitialData, autoPrintClosingReport]);

  // Global listener for input focus to trigger the on-screen keyboard
  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      const { businessSetup, openKeyboard } = usePosStore.getState();
      // Only open keyboard if enabled in settings and the target is a text input
      if (businessSetup?.onScreenKeyboard && (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
        // Do not show keyboard for file uploads
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
    // Display a simple loading indicator while data is fetched
    return <div>Loading...</div>;
  }

  // If business setup is not complete, force the user to the registration page
  if (!businessSetup || !businessSetup.isSetup) {
    return <BusinessRegistrationPage />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-100">
          {/* Conditional rendering based on authentication state */}
          {!businessSetup.isLoggedIn ? <LoginScreen /> : <MainNavigator />}

          {/* Global Modals accessible from anywhere in the app */}
          <CheckoutModal />
          <OnScreenKeyboard />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
