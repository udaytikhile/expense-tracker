import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, BarChart3, Target, MoreHorizontal } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/expenses', label: 'Expenses', icon: Receipt },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/budget', label: 'Budget', icon: Target },
  { path: '/more', label: 'More', icon: MoreHorizontal },
];

export default function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/more') {
      return ['/more', '/income', '/recurring', '/export', '/profile'].includes(location.pathname);
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-tab-bar">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const active = isActive(tab.path);
        return (
          <button
            key={tab.path}
            className={`tab-item ${active ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
            id={`tab-${tab.label.toLowerCase()}`}
          >
            <div className="tab-pill-wrap">
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} className="tab-icon" />
              {active && <span className="tab-label-active">{tab.label}</span>}
            </div>
          </button>
        );
      })}
    </nav>
  );
}

