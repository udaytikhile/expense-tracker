import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { fetchNotifications, markNotificationRead, clearNotifications } from './api';

const typeIcons = {
    danger: <AlertTriangle size={15} style={{ color: '#dc2626' }} />,
    warning: <AlertTriangle size={15} style={{ color: '#d97706' }} />,
    success: <CheckCircle size={15} style={{ color: '#059669' }} />,
    info: <Info size={15} style={{ color: '#0284c7' }} />,
};

function NotificationPanel() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const load = async () => {
        setLoading(true);
        try {
            const data = await fetchNotifications();
            setNotifications(data);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    useEffect(() => {
        load();
        const interval = setInterval(load, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    const handleToggle = () => {
        setOpen(!open);
        if (!open) load();
    };

    const handleMarkRead = async (id) => {
        await markNotificationRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleClearAll = async () => {
        await clearNotifications();
        setNotifications([]);
    };

    const formatTime = (created) => {
        if (!created) return '';
        const diff = Date.now() - new Date(created + 'Z').getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div ref={panelRef} style={{ position: 'relative' }}>
            <button className="notification-bell" onClick={handleToggle}>
                <Bell size={17} />
                {unreadCount > 0 && <span className="badge-dot"></span>}
            </button>

            {open && (
                <div className="notification-dropdown" style={{
                    position: 'absolute', top: '110%', right: 0, width: '340px',
                    background: 'var(--bg-card-solid)', borderRadius: 'var(--rounded-sm)',
                    boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)',
                    zIndex: 1000, animation: 'slideDown 0.2s ease', overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)'
                    }}>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>
                            Notifications {unreadCount > 0 && <span style={{
                                fontSize: '0.72rem', background: 'var(--danger)', color: '#fff',
                                padding: '0.1rem 0.45rem', borderRadius: '10px', marginLeft: '0.4rem'
                            }}>{unreadCount}</span>}
                        </h4>
                        {notifications.length > 0 && (
                            <button onClick={handleClearAll} style={{
                                background: 'transparent', color: 'var(--text-muted)', fontSize: '0.78rem',
                                padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
                                minWidth: 'auto'
                            }}>
                                <Trash2 size={13} /> Clear
                            </button>
                        )}
                    </div>

                    {/* Notification list */}
                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                        {loading && notifications.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Loading...
                            </div>
                        )}
                        {!loading && notifications.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                🔔 No notifications yet
                            </div>
                        )}
                        {notifications.map(n => (
                            <div key={n.id} style={{
                                display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                                padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)',
                                background: n.read ? 'transparent' : 'var(--primary-surface)',
                                cursor: 'pointer', transition: 'background 0.2s ease'
                            }} onClick={() => !n.read && handleMarkRead(n.id)}>
                                <div style={{ marginTop: '2px', flexShrink: 0 }}>
                                    {typeIcons[n.type] || typeIcons.info}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '0.84rem', lineHeight: 1.4, margin: 0, fontWeight: n.read ? 400 : 500 }}>
                                        {n.message}
                                    </p>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                                        {formatTime(n.created)}
                                    </span>
                                </div>
                                {!n.read && (
                                    <div style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: 'var(--primary)', flexShrink: 0, marginTop: '6px'
                                    }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationPanel;
