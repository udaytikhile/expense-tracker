import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import { 
  PiggyBank, Repeat, Download, User, LogOut, ChevronRight,
  Shield, Moon, Smartphone, HelpCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function MorePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { label: 'Income Registry', icon: PiggyBank, color: '#0d9488', path: '/income' },
    { label: 'Recurring Bills', icon: Repeat, color: '#7c3aed', path: '/recurring' },
    { label: 'Data Export', icon: Download, color: '#0284c7', path: '/export' },
    { label: 'Profile Settings', icon: User, color: '#f97316', path: '/profile' },
  ];

  return (
    <div className="mobile-page">
      <PageHeader title="More Settings" />

      {/* Main Feature Menu List */}
      <div className="menu-list-card">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <div 
              key={item.label} 
              className="menu-list-item"
              onClick={() => navigate(item.path)}
            >
              <div className="item-left">
                <div className="item-icon-circle" style={{ color: item.color, backgroundColor: `${item.color}15` }}>
                  <Icon size={18} />
                </div>
                <span>{item.label}</span>
              </div>
              <ChevronRight size={18} className="chevron" />
            </div>
          );
        })}
      </div>

      {/* App Preferences */}
      <h3 className="section-title" style={{ marginTop: 16 }}>App Preferences</h3>
      <div className="menu-list-card">
        <div className="menu-list-item" onClick={toggleTheme}>
          <div className="item-left">
            <div className="item-icon-circle" style={{ color: '#f59e0b', backgroundColor: '#f59e0b15' }}>
              <Moon size={18} />
            </div>
            <span>Dark Theme</span>
          </div>
          <label className="switch" onClick={e => e.stopPropagation()}>
            <input 
              type="checkbox" 
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
            <span className="slider round" />
          </label>
        </div>

        <div className="menu-list-item disabled">
          <div className="item-left">
            <div className="item-icon-circle" style={{ color: '#059669', backgroundColor: '#05966915' }}>
              <Shield size={18} />
            </div>
            <span>Biometric Lock</span>
          </div>
          <span className="preference-badge">PIN Required</span>
        </div>
      </div>

      {/* Help & Info */}
      <h3 className="section-title" style={{ marginTop: 16 }}>Support</h3>
      <div className="menu-list-card">
        <div className="menu-list-item disabled">
          <div className="item-left">
            <div className="item-icon-circle" style={{ color: '#64748b', backgroundColor: '#64748b15' }}>
              <Smartphone size={18} />
            </div>
            <span>Version Details</span>
          </div>
          <span className="version-info">v2.1.0 PWA</span>
        </div>
      </div>

      {/* Logout Action */}
      <button className="btn-danger-outline" onClick={logout} style={{ width: '100%', marginTop: 24, padding: 14 }}>
        <LogOut size={16} /> Sign Out Account
      </button>
    </div>
  );
}
