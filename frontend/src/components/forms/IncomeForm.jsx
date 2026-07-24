import React, { useState, useEffect } from 'react';
import { INCOME_SOURCES } from '../../utils/constants';

export default function IncomeForm({ initialData, onSubmit, onCancel, submitLabel = "Save Income" }) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState(INCOME_SOURCES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount || '');
      const foundSource = INCOME_SOURCES.find(s => `${s.emoji} ${s.label}` === initialData.source) || INCOME_SOURCES[0];
      setSource(foundSource);
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setNote(initialData.note || '');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    onSubmit({
      amount: parseFloat(amount),
      source: `${source.emoji} ${source.label}`,
      date,
      note
    });
  };

  return (
    <form className="mobile-form" onSubmit={handleSubmit}>
      <div className="form-group-amount">
        <label>Income Amount</label>
        <div className="amount-input-wrap income">
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
        <label>Source</label>
        <div className="category-picker-grid">
          {INCOME_SOURCES.map(inc => {
            const isSelected = source.label === inc.label;
            return (
              <button
                type="button"
                key={inc.label}
                className={`cat-picker-item ${isSelected ? 'selected-income' : ''}`}
                onClick={() => setSource(inc)}
              >
                <span className="cat-picker-emoji">{inc.emoji}</span>
                <span className="cat-picker-label">{inc.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-group-row">
        <div className="form-group flex-1">
          <label>Received Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Note / Reference</label>
        <input
          type="text"
          placeholder="e.g. Salary, Freelance project A, Birthday gift"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-income flex-1">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
