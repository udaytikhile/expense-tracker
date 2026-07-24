import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import BottomTabBar from './BottomTabBar';
import FAB from './FAB';
import ToastContainer from '../ui/ToastContainer';

export default function MobileLayout() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="mobile-layout">
      <ToastContainer />
      {!isOnline && (
        <div className="offline-badge" id="offline-status-banner">
          <WifiOff size={14} />
          <span>Offline Mode</span>
        </div>
      )}
      <main className="mobile-main">
        <Outlet />
      </main>
      <FAB />
      <BottomTabBar />
    </div>
  );
}
