import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../../utils/constants';

export default function BudgetForm({ initialData, onSubmit, onCancel, submitLabel = "Save Budget" }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount || '');
      const foundCategory = CATEGORIES.find(c => `${c.emoji} ${c.label}` === initialData.category) || CATEGORIES[0];
      setCategory(foundCategory);
      setMonth(initialData.month || new Date().toISOString().slice(0, 7));
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    onSubmit({
      amount: parseFloat(amount),
      category: `${category.emoji} ${category.label}`,
      month
    });
  };

  return (
    <form className="mobile-form" onSubmit={handleSubmit}>
      <div className="form-group-amount">
        <label>Budget Limit</label>
        <div className="amount-input-wrap budget">
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
        <label>Budget Target Month</label>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Choose Category to Limit</label>
        <div className="category-picker-grid">
          {CATEGORIES.map(cat => {
            const isSelected = category.label === cat.label;
            return (
              <button
                type="button"
                key={cat.label}
                className={`cat-picker-item ${isSelected ? 'selected-budget' : ''}`}
                onClick={() => setCategory(cat)}
              >
                <span className="cat-picker-emoji">{cat.emoji}</span>
                <span className="cat-picker-label">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-budget flex-1">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
