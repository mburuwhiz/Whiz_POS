import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to track user idle state.
 * Resets the idle timer on user activity and when the enabled state changes.
 *
 * @param timeoutMs The duration in milliseconds before considering the user idle.
 * @param isEnabled Whether the idle tracking is active.
 * @returns boolean indicating if the user is idle.
 */
export function useAutoLogout(timeoutMs: number, isEnabled: boolean) {
  const [isIdle, setIsIdle] = useState(false);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    // Reset state when enabled/disabled or timeout changes
    setIsIdle(false);
    lastActivityRef.current = Date.now();

    if (!isEnabled) {
      return;
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      if (isIdle) {
          setIsIdle(false);
      }
    };

    // Add event listeners
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Check for idle state periodically
    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > timeoutMs) {
        if (!isIdle) {
            setIsIdle(true);
        }
      }
    }, 1000); // Check every second

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearInterval(interval);
    };
  }, [timeoutMs, isEnabled, isIdle]);

  return isIdle;
}
