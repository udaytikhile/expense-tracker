import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import MobileLayout from './components/layout/MobileLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import AddExpensePage from './pages/AddExpensePage';
import AnalyticsPage from './pages/AnalyticsPage';
import BudgetPage from './pages/BudgetPage';
import IncomePage from './pages/IncomePage';
import RecurringPage from './pages/RecurringPage';
import ExportPage from './pages/ExportPage';
import ProfilePage from './pages/ProfilePage';
import MorePage from './pages/MorePage';

function ProtectedRoutes() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoutes() {
  const { user } = useAuth();
  return !user ? <Outlet /> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route element={<PublicRoutes />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>

              {/* Protected App Routes */}
              <Route element={<ProtectedRoutes />}>
                <Route element={<MobileLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/expenses/add" element={<AddExpensePage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/budget" element={<BudgetPage />} />
                  <Route path="/income" element={<IncomePage />} />
                  <Route path="/recurring" element={<RecurringPage />} />
                  <Route path="/export" element={<ExportPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/more" element={<MorePage />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
