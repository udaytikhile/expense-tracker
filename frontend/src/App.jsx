import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, BarChart3, Download, User, Target, Repeat, Wallet, Sun, Moon, X, AlertTriangle, LogOut, Menu, UserCircle } from 'lucide-react';
import Dashboard from './Dashboard';
import AddExpense from './AddExpense';
import Analytics from './Analytics';
import ExportPage from './ExportPage';
import BudgetManager from './BudgetManager';
import RecurringExpenses from './RecurringExpenses';
import IncomeTracker from './IncomeTracker';
import LoginPage from './LoginPage';
import ProfilePage from './ProfilePage';
import NotificationPanel from './NotificationPanel';
import './index.css';
import './App.css';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [alerts, setAlerts] = useState([]);
  const [tabKey, setTabKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setActiveTab('Dashboard');
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const switchTab = (name) => {
    if (name !== activeTab) {
      setActiveTab(name);
      setTabKey(k => k + 1);
    }
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const addAlert = (alert) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { ...alert, id }]);
    setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), 5000);
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={19} /> },
    { name: 'New Expense', icon: <PlusCircle size={19} /> },
    { name: 'Analytics', icon: <BarChart3 size={19} /> },
    { name: 'Budget', icon: <Target size={19} /> },
    { name: 'Recurring', icon: <Repeat size={19} /> },
    { name: 'Income', icon: <Wallet size={19} /> },
    { name: 'Export', icon: <Download size={19} /> },
    { name: 'Profile', icon: <UserCircle size={19} /> },
  ];

  const tabDescriptions = {
    'Dashboard': 'Your financial overview at a glance',
    'New Expense': 'Record a new expense entry',
    'Analytics': 'Deep dive into your spending patterns',
    'Budget': 'Set and monitor spending limits',
    'Recurring': 'Manage auto-repeating expenses',
    'Income': 'Track income and savings',
    'Export': 'Download your financial data',
    'Profile': 'Manage your account settings',
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">
      {/* Alert Toasts */}
      {alerts.length > 0 && (
        <div className="alert-container">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-toast alert-${alert.type}`}>
              <AlertTriangle size={15} />
              <span>{alert.message}</span>
              <button onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))} style={{ background: 'transparent', padding: '0.15rem', marginLeft: 'auto', minWidth: 'auto' }}>
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-icon" style={{ background: 'transparent', padding: 0, boxShadow: 'none' }}>
            <img src="/logo.png" alt="SpendWise Logo" style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '12px' }} />
          </div>
          <div className="brand-text">
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: "'Outfit', sans-serif" }} className="text-gradient">SpendWise</h1>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.3px' }}>Smart Finance</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item, idx) => (
            <button
              key={item.name}
              onClick={() => switchTab(item.name)}
              className={`nav-btn ${activeTab === item.name ? 'active' : ''}`}
              style={{ animationDelay: `${idx * 0.06}s`, animation: 'fadeInLeft 0.35s ease backwards' }}
            >
              {item.icon}
              <span className="nav-label">{item.name}</span>
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '0.75rem 0.35rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            <span className="nav-label">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button onClick={handleLogout} className="theme-toggle-btn" style={{ color: 'var(--text-danger)' }}>
            <LogOut size={17} />
            <span className="nav-label">Log Out</span>
          </button>
          <div className="sidebar-tip">
            <div style={{ fontSize: '1.3rem', marginBottom: '0.35rem' }}>💡</div>
            <p>Track smarter, save better — every rupee counts!</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="flex-between page-header" style={{ marginBottom: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <h2>{activeTab}</h2>
              <p className="greeting-text">
                {activeTab === 'Dashboard' ? `${getGreeting()}, ${user.name} 👋 — ${tabDescriptions[activeTab]}` : tabDescriptions[activeTab]}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <NotificationPanel />
            <div className="avatar" onClick={() => switchTab('Profile')} style={{ cursor: 'pointer' }} title="Profile">
              <User size={18} />
            </div>
          </div>
        </header>

        <div key={tabKey} className="tab-content">
          {activeTab === 'Dashboard' && <Dashboard />}
          {activeTab === 'New Expense' && <AddExpense onSuccess={() => setTimeout(() => switchTab('Dashboard'), 1000)} />}
          {activeTab === 'Analytics' && <Analytics />}
          {activeTab === 'Budget' && <BudgetManager onAlert={addAlert} />}
          {activeTab === 'Recurring' && <RecurringExpenses />}
          {activeTab === 'Income' && <IncomeTracker />}
          {activeTab === 'Export' && <ExportPage />}
          {activeTab === 'Profile' && <ProfilePage user={user} onUserUpdate={handleUserUpdate} />}
        </div>
      </main>
    </div>
  );
}

export default App;
