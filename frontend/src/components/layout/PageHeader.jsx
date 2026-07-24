import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Trash2, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchNotifications, markNotificationRead, clearNotifications } from '../../services/api';
import { formatTimeAgo } from '../../utils/formatters';

const typeIcons = {
  danger: <AlertTriangle size={15} style={{ color: '#dc2626' }} />,
  warning: <AlertTriangle size={15} style={{ color: '#d97706' }} />,
  success: <CheckCircle size={15} style={{ color: '#059669' }} />,
  info: <Info size={15} style={{ color: '#0284c7' }} />,
};

export default function PageHeader({ title, showBack = false, rightAction }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [notifOpen]);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAll = async () => {
    await clearNotifications();
    setNotifications([]);
  };

  return (
    <header className="page-header">
      <div className="header-left">
        {showBack ? (
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
        ) : (
          <div className="app-logo-mini">
            <img src="/icon-48x48.png" alt="SpendWise" style={{ width: 28, height: 28, borderRadius: 6 }} onError={(e) => e.target.style.display = 'none'} />
            <span className="app-logo-text">SpendWise</span>
          </div>
        )}
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-right">
        {rightAction ? (
          rightAction
        ) : (
          <div className="header-actions" ref={dropdownRef}>
            <button className="notif-bell-btn" onClick={() => setNotifOpen(!notifOpen)} aria-label="Notifications">
              <Bell size={20} />
              {unreadCount > 0 && <span className="notif-badge-dot" />}
            </button>

            {notifOpen && (
              <div className="notif-dropdown">
                <div className="notif-dropdown-header">
                  <h3>Notifications {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}</h3>
                  {notifications.length > 0 && (
                    <button onClick={handleClearAll} className="clear-all-btn">
                      <Trash2 size={13} /> Clear
                    </button>
                  )}
                </div>

                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">🔔 No notifications yet</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`notif-item ${n.read ? 'read' : 'unread'}`}
                        onClick={() => !n.read && handleMarkRead(n.id)}
                      >
                        <div className="notif-item-icon">
                          {typeIcons[n.type] || typeIcons.info}
                        </div>
                        <div className="notif-item-content">
                          <p>{n.message}</p>
                          <span>{formatTimeAgo(n.created)}</span>
                        </div>
                        {!n.read && <span className="unread-dot" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="header-avatar" onClick={() => navigate('/profile')}>
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
