import React, { useState, useEffect } from 'react';
import { fetchBudgets, saveBudget, deleteBudget } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';
import PageHeader from '../components/layout/PageHeader';
import BottomSheet from '../components/ui/BottomSheet';
import BudgetForm from '../components/forms/BudgetForm';
import { Plus, AlertOctagon, Target, Trash2 } from 'lucide-react';

export default function BudgetPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const data = await fetchBudgets(selectedMonth);
      setBudgets(data || []);
    } catch (err) {
      addToast('Failed to load budget goals', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [selectedMonth]);

  const handleCreateBudget = async (budgetData) => {
    try {
      const res = await saveBudget(budgetData);
      if (res && !res.error) {
        addToast('Budget saved successfully 🎯', 'success');
        setFormOpen(false);
        loadBudgets();
      } else {
        addToast(res.error || 'Failed to save budget', 'error');
      }
    } catch (err) {
      addToast('Error saving budget targets', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
      addToast('Budget removed', 'success');
      loadBudgets();
    } catch (err) {
      addToast('Failed to delete budget limit', 'error');
    }
  };

  const userCurrency = user?.currency || 'INR';

  return (
    <div className="mobile-page">
      <PageHeader 
        title="Budgets" 
        rightAction={
          <button className="header-action-circle-btn" onClick={() => setFormOpen(true)}>
            <Plus size={20} />
          </button>
        }
      />

      {/* Month Selector Filter */}
      <div className="budget-month-selector">
        <label>Selected Month</label>
        <input 
          type="month" 
          value={selectedMonth} 
          onChange={e => setSelectedMonth(e.target.value)} 
        />
      </div>

      {/* Budgets List */}
      <div className="budget-goals-container">
        {loading ? (
          <div className="skeleton-container">
            <div className="skeleton skeleton-list-item" style={{ height: 100 }} />
            <div className="skeleton skeleton-list-item" style={{ height: 100 }} />
          </div>
        ) : budgets.length === 0 ? (
          <div className="empty-card-list">
            <Target size={36} />
            <p>No budget targets configured for this month</p>
            <button className="btn-primary btn-sm" onClick={() => setFormOpen(true)}>Create Budget Limit</button>
          </div>
        ) : (
          <div className="budget-card-stack">
            {budgets.map(b => {
              const categoryEmoji = b.category.split(' ')[0] || '📦';
              const categoryName = b.category.replace(/^[^\s]+\s*/, '');
              const percentage = Math.min(100, Math.round((b.spent / b.amount) * 100)) || 0;
              const isOver = b.spent > b.amount;
              const isWarning = b.spent / b.amount >= 0.85 && !isOver;

              return (
                <div key={b.id} className={`budget-target-card ${isOver ? 'over' : isWarning ? 'warning' : ''}`}>
                  <div className="budget-card-top">
                    <div className="budget-category-info">
                      <span className="emoji-badge">{categoryEmoji}</span>
                      <span className="title">{categoryName}</span>
                    </div>
                    <button className="budget-delete-btn" onClick={() => handleDelete(b.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Progress Info */}
                  <div className="budget-progress-details">
                    <div className="amounts">
                      <span>Spent: <strong>{formatCurrency(b.spent, userCurrency)}</strong></span>
                      <span>Goal: {formatCurrency(b.amount, userCurrency)}</span>
                    </div>
                    
                    <div className="progress-track">
                      <div 
                        className={`progress-bar ${isOver ? 'danger' : isWarning ? 'warning' : 'success'}`} 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>

                    <div className="budget-card-footer">
                      <span className="percentage-text">{percentage}% utilized</span>
                      {isOver && (
                        <span className="alert-badgedanger">
                          <AlertOctagon size={12} /> Over Limit
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomSheet open={formOpen} onClose={() => setFormOpen(false)} title="Set Budget Target">
        <BudgetForm onSubmit={handleCreateBudget} onCancel={() => setFormOpen(false)} />
      </BottomSheet>
    </div>
  );
}
