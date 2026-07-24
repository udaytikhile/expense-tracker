import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateProfile } from '../services/api';
import PageHeader from '../components/layout/PageHeader';
import { CURRENCIES } from '../utils/constants';
import { User, Globe, Save, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Display Name cannot be empty', 'warning');
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile(name.trim(), currency);
      if (res.ok) {
        updateUser(res.data);
        addToast('Profile changes saved successfully! ✨', 'success');
      } else {
        addToast(res.data.error || 'Failed to update settings', 'error');
      }
    } catch (err) {
      addToast('Profile update connection error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <div className="mobile-page">
      <PageHeader title="Profile Settings" />

      {/* Avatar Card */}
      <div className="profile-hero-card">
        <div className="profile-avatar-circle">{initials}</div>
        <h2 className="profile-name">{user?.name}</h2>
        <span className="profile-email">{user?.email}</span>
      </div>

      {/* Configuration Form */}
      <form className="mobile-form profile-form-card" onSubmit={handleSave}>
        <h3 className="section-title">Edit Configuration</h3>

        <div className="form-group">
          <label>
            <User size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Display Name
          </label>
          <input 
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Enter name"
          />
        </div>

        <div className="form-group">
          <label>
            <Globe size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            App Currency
          </label>
          <select value={currency} onChange={e => setCurrency(e.target.value)}>
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-primary" disabled={saving} style={{ width: '100%', marginTop: 8 }}>
          <Save size={16} style={{ marginRight: 6 }} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>

      {/* Danger Logout Action */}
      <div className="profile-danger-zone">
        <button className="btn-danger-outline" onClick={logout}>
          <LogOut size={16} /> Sign Out Account
        </button>
      </div>
    </div>
  );
}
