import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../../utils/constants';

export default function ExpenseForm({ initialData, onSubmit, onCancel, submitLabel = "Save Expense" }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('monthly');

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount || '');
      const foundCategory = CATEGORIES.find(c => `${c.emoji} ${c.label}` === initialData.category) || CATEGORIES[0];
      setCategory(foundCategory);
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setNote(initialData.note || '');
      setIsRecurring(!!initialData.is_recurring);
      setFrequency(initialData.frequency || 'monthly');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    
    onSubmit({
      amount: parseFloat(amount),
      category: `${category.emoji} ${category.label}`,
      date,
      note,
      is_recurring: isRecurring,
      frequency: isRecurring ? frequency : null
    });
  };

  return (
    <form className="mobile-form" onSubmit={handleSubmit}>
      <div className="form-group-amount">
        <label>Amount</label>
        <div className="amount-input-wrap">
          <span className="currency-prefix">₹</span>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
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
            const isSelected = category.label === cat.label;
            return (
              <button
                type="button"
                key={cat.label}
                className={`cat-picker-item ${isSelected ? 'selected' : ''}`}
                onClick={() => setCategory(cat)}
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
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Description / Notes</label>
        <input
          type="text"
          placeholder="e.g. Weekly groceries, electricity, lunch"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>

      <div className="form-group-toggle">
        <div className="toggle-label-wrap">
          <span className="toggle-title">Set as Recurring Expense</span>
          <span className="toggle-desc">Automatically repeat this transaction</span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={e => setIsRecurring(e.target.checked)}
          />
          <span className="slider round" />
        </label>
      </div>

      {isRecurring && (
        <div className="form-group animate-slide-down">
          <label>Repeat Frequency</label>
          <select value={frequency} onChange={e => setFrequency(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      )}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary flex-1">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
