import React, { useState } from 'react';
import { User, Mail, Globe, Save, Check } from 'lucide-react';
import { updateProfile } from './api';

const CURRENCIES = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

function ProfilePage({ user, onUserUpdate }) {
    const [name, setName] = useState(user.name || '');
    const [currency, setCurrency] = useState(user.currency || 'INR');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (!name.trim()) { setError('Name cannot be empty'); return; }
        setSaving(true); setError(''); setSaved(false);
        try {
            const res = await updateProfile(name.trim(), currency);
            if (res.ok) {
                onUserUpdate(res.data);
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            } else {
                setError(res.data.error || 'Failed to update');
            }
        } catch { setError('Connection error'); }
        finally { setSaving(false); }
    };

    const currencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

    return (
        <div style={{ maxWidth: '640px', animation: 'fadeInUp 0.4s ease' }}>
            {/* Profile Header Card */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(249, 115, 22, 0.3)', flexShrink: 0
                    }}>
                        <span style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 700 }}>
                            {(user.name || 'U')[0].toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.2rem' }}>{user.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                            <Mail size={14} />
                            <span>{user.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                            <Globe size={13} />
                            <span>{currencyInfo.name} ({currencyInfo.symbol})</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} style={{ color: 'var(--primary)' }} />
                    Edit Profile
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Name */}
                    <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
                            Display Name
                        </label>
                        <input
                            type="text" value={name} onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Currency */}
                    <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
                            <Globe size={14} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                            Currency
                        </label>
                        <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ width: '100%' }}>
                            {CURRENCIES.map(c => (
                                <option key={c.code} value={c.code}>{c.symbol} {c.name} ({c.code})</option>
                            ))}
                        </select>
                    </div>

                    {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 500 }}>{error}</div>}

                    <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                        {saved ? <><Check size={16} /> Saved!</> : saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                    </button>
                </div>
            </div>

            {/* Account Info */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                    Account Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Email</span>
                        <span style={{ fontWeight: 500 }}>{user.email}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>User ID</span>
                        <span style={{ fontWeight: 500 }}>#{user.id}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Currency</span>
                        <span style={{ fontWeight: 500 }}>{currencyInfo.symbol} {currencyInfo.code}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
