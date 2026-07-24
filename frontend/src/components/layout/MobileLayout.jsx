import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomTabBar from './BottomTabBar';
import FAB from './FAB';
import ToastContainer from '../ui/ToastContainer';

export default function MobileLayout() {
  return (
    <div className="mobile-layout">
      <ToastContainer />
      <main className="mobile-main">
        <Outlet />
      </main>
      <FAB />
      <BottomTabBar />
    </div>
  );
}
