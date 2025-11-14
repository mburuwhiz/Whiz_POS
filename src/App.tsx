import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { usePosStore } from './store/posStore';
import CheckoutModal from './components/CheckoutModal';
import MainNavigator from './pages/MainNavigator';
import BusinessRegistrationPage from './pages/BusinessRegistrationPage';
import LoginScreen from './components/LoginScreen';
import OnScreenKeyboard from './components/OnScreenKeyboard';
import { useEffect } from 'react';

function App() {
  const { businessSetup, openKeyboard, loadInitialData, autoPrintClosingReport, isDataLoaded } = usePosStore();

  useEffect(() => {
    const init = async () => {
      await loadInitialData();
      autoPrintClosingReport();
    };
    init();
  }, [loadInitialData, autoPrintClosingReport]);

  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      if (businessSetup?.onScreenKeyboard && (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
        const target = event.target;
        const onValueChange = (value: string) => {
          // This is a bit of a hack to get around React's controlled components
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
          )?.set;
          nativeInputValueSetter?.call(target, value);
          const inputEvent = new Event('input', { bubbles: true });
          target.dispatchEvent(inputEvent);
        };
        openKeyboard(target, onValueChange);
      }
    };

    window.addEventListener('focusin', handleFocus);
    return () => window.removeEventListener('focusin', handleFocus);
  }, [businessSetup, openKeyboard]);

  if (!isDataLoaded) {
    return <div>Loading...</div>;
  }

  if (!businessSetup || !businessSetup.isSetup) {
    return <BusinessRegistrationPage />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {!businessSetup.isLoggedIn ? <LoginScreen /> : <MainNavigator />}

        {/* Global Modals */}
        <CheckoutModal />
        <OnScreenKeyboard />
      </div>
    </Router>
  );
}

export default App;
