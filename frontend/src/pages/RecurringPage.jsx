import React, { useState, useEffect } from 'react';
import { fetchRecurring, addRecurring, deleteRecurring, toggleRecurring, processRecurring } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';
import PageHeader from '../components/layout/PageHeader';
import BottomSheet from '../components/ui/BottomSheet';
import { Repeat, Plus, Trash2, Play, Pause, Zap, Calendar, AlertCircle } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';

export default function RecurringPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    category: CATEGORIES[0],
    amount: '',
    note: '',
    frequency: 'monthly',
    next_date: new Date().toISOString().split('T')[0]
  });

  const loadRecurring = async () => {
    setLoading(true);
    try {
      const data = await fetchRecurring();
      setItems(data || []);
    } catch (err) {
      addToast('Failed to load subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecurring();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) return;
    
    try {
      await addRecurring({
        amount: parseFloat(formData.amount),
        category: `${formData.category.emoji} ${formData.category.label}`,
        note: formData.note,
        frequency: formData.frequency,
        next_date: formData.next_date
      });
      addToast('Subscription established successfully', 'success');
      setFormOpen(false);
      setFormData({
        category: CATEGORIES[0],
        amount: '',
        note: '',
        frequency: 'monthly',
        next_date: new Date().toISOString().split('T')[0]
      });
      loadRecurring();
    } catch (err) {
      addToast('Failed to set up recurring expense', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRecurring(id);
      addToast('Recurring bill deleted', 'success');
      loadRecurring();
    } catch (err) {
      addToast('Failed to delete bill', 'error');
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleRecurring(id);
      addToast('Status toggled', 'success');
      loadRecurring();
    } catch (err) {
      addToast('Failed to toggle status', 'error');
    }
  };

  const handleProcess = async () => {
    setProcessing(true);
    try {
      const res = await processRecurring();
      addToast(res.message || 'Auto-payments processed successfully', 'success');
      loadRecurring();
    } catch (err) {
      addToast('Error processing automatic charges', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const userCurrency = user?.currency || 'INR';

  return (
    <div className="mobile-page">
      <PageHeader 
        title="Recurring Bills" 
        rightAction={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="header-action-circle-btn secondary" onClick={handleProcess} disabled={processing} aria-label="Process due items">
              <Zap size={18} />
            </button>
            <button className="header-action-circle-btn" onClick={() => setFormOpen(true)} aria-label="Create subscription">
              <Plus size={18} />
            </button>
          </div>
        }
      />

      {/* Hero Tip Card */}
      <div className="dashboard-greeting recur">
        <p><AlertCircle size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> Automatically log charges like subscriptions, rent, and monthly commitments.</p>
      </div>

      {/* Subscriptions List */}
      <div className="recurring-bills-container">
        {loading ? (
          <div className="skeleton-container">
            <div className="skeleton skeleton-list-item" />
            <div className="skeleton skeleton-list-item" />
          </div>
        ) : items.length === 0 ? (
          <div className="empty-card-list">
            <Repeat size={36} />
            <p>No repeating payments configured</p>
            <button className="btn-primary btn-sm" onClick={() => setFormOpen(true)}>Add Bill</button>
          </div>
        ) : (
          <div className="mobile-card-list">
            {items.map(item => {
              const categoryEmoji = item.category.split(' ')[0] || '📦';
              const categoryName = item.category.replace(/^[^\s]+\s*/, '');
              return (
                <div key={item.id} className={`mobile-transaction-card recurring-item ${item.active ? 'active' : 'paused'}`}>
                  <div className="card-left">
                    <div className="category-avatar-circle">
                      {categoryEmoji}
                    </div>
                    <div className="card-details">
                      <span className="card-title-text">{categoryName}</span>
                      <div className="card-subtitle-row">
                        <span className="card-subtitle-text">{item.note || 'No note'}</span>
                        <span className="dot-divider" />
                        <span className="frequency-badge">{item.frequency}</span>
                      </div>
                      <span className="next-date-text">Next: {item.next_date}</span>
                    </div>
                  </div>
                  
                  <div className="card-right">
                    <div className="card-right-amount">
                      <span className="card-amount negative">
                        {formatCurrency(item.amount, userCurrency)}
                      </span>
                    </div>
                    
                    <div className="card-action-row">
                      <button 
                        className={`card-action-btn toggle-play ${item.active ? 'pause' : 'play'}`} 
                        onClick={() => handleToggle(item.id)}
                        aria-label={item.active ? "Pause" : "Play"}
                      >
                        {item.active ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <button 
                        className="card-action-btn delete" 
                        onClick={() => handleDelete(item.id)}
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subscription creation bottom sheet */}
      <BottomSheet open={formOpen} onClose={() => setFormOpen(false)} title="New Recurring Bill">
        <form className="mobile-form" onSubmit={handleAdd}>
          <div className="form-group-amount">
            <label>Bill Amount</label>
            <div className="amount-input-wrap">
              <span className="currency-prefix">₹</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                required
                autoFocus
                inputMode="decimal"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <div className="category-picker-grid">
              {CATEGORIES.map(cat => {
                const isSelected = formData.category.label === cat.label;
                return (
                  <button
                    type="button"
                    key={cat.label}
                    className={`cat-picker-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, category: cat })}
                  >
                    <span className="cat-picker-emoji">{cat.emoji}</span>
                    <span className="cat-picker-label">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-group flex-1">
              <label>Frequency</label>
              <select 
                value={formData.frequency} 
                onChange={e => setFormData({ ...formData, frequency: e.target.value })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="form-group flex-1">
              <label>First Payment Date</label>
              <input 
                type="date" 
                value={formData.next_date} 
                onChange={e => setFormData({ ...formData, next_date: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Billing Description</label>
            <input 
              type="text" 
              placeholder="e.g. Netflix, Rent, gym membership"
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary flex-1" onClick={() => setFormOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1">Set Subscription</button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}
