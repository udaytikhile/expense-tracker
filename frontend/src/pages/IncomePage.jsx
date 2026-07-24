import React, { useState, useEffect } from 'react';
import { fetchIncome, fetchIncomeSummary, addIncome, deleteIncome } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import PageHeader from '../components/layout/PageHeader';
import BottomSheet from '../components/ui/BottomSheet';
import IncomeForm from '../components/forms/IncomeForm';
import { Plus, Wallet, TrendingUp, PiggyBank, ArrowDownRight, Trash2 } from 'lucide-react';

export default function IncomePage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [incomes, setIncomes] = useState([]);
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, net_savings: 0 });
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  const loadIncomeData = async () => {
    setLoading(true);
    try {
      const [incRes, sumRes] = await Promise.all([
        fetchIncome(),
        fetchIncomeSummary()
      ]);
      setIncomes(incRes || []);
      setSummary(sumRes || { total_income: 0, total_expense: 0, net_savings: 0 });
    } catch (err) {
      addToast('Failed to load income registry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncomeData();
  }, []);

  const handleAddIncome = async (incomeData) => {
    try {
      await addIncome(incomeData);
      addToast('Income entry logged successfully! 💰', 'success');
      setFormOpen(false);
      loadIncomeData();
    } catch (err) {
      addToast('Error saving income entry', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteIncome(id);
      addToast('Income record deleted', 'success');
      loadIncomeData();
    } catch (err) {
      addToast('Failed to delete record', 'error');
    }
  };

  const userCurrency = user?.currency || 'INR';
  const savingsRate = summary.total_income > 0 ? ((summary.net_savings / summary.total_income) * 100).toFixed(1) : 0;

  return (
    <div className="mobile-page">
      <PageHeader 
        title="Income" 
        rightAction={
          <button className="header-action-circle-btn teal" onClick={() => setFormOpen(true)}>
            <Plus size={20} />
          </button>
        }
      />

      {/* Stats Hero Section */}
      <div className="income-hero-card">
        <div className="savings-progress-wrap">
          <div className="progress-labels">
            <span>Net Savings</span>
            <span className="rate">{savingsRate}% saved</span>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }} />
          </div>
        </div>

        <div className="stats-mini-row">
          <div className="stat-item">
            <span className="label">Total Inflow</span>
            <span className="value green">{formatCurrency(summary.total_income, userCurrency)}</span>
          </div>
          <div className="stat-item">
            <span className="label">Outflow</span>
            <span className="value orange">{formatCurrency(summary.total_expense, userCurrency)}</span>
          </div>
        </div>
      </div>

      {/* Income Records List */}
      <div className="income-records-list">
        <h3 className="section-title">Income Registry</h3>
        {loading ? (
          <div className="skeleton-container">
            <div className="skeleton skeleton-list-item" />
            <div className="skeleton skeleton-list-item" />
          </div>
        ) : incomes.length === 0 ? (
          <div className="empty-card-list">
            <Wallet size={36} />
            <p>No income transactions logged yet</p>
            <button className="btn-primary btn-sm btn-income" onClick={() => setFormOpen(true)}>Add Income</button>
          </div>
        ) : (
          <div className="mobile-card-list">
            {incomes.map(inc => {
              const sourceEmoji = inc.source.split(' ')[0] || '💰';
              const sourceName = inc.source.replace(/^[^\s]+\s*/, '');
              return (
                <div key={inc.id} className="mobile-transaction-card">
                  <div className="card-left">
                    <div className="category-avatar-circle income">
                      {sourceEmoji}
                    </div>
                    <div className="card-details">
                      <span className="card-title-text">{sourceName}</span>
                      <div className="card-subtitle-row">
                        <span className="card-subtitle-text">{inc.note || 'No note'}</span>
                        <span className="dot-divider" />
                        <span className="card-date-badge">{formatDate(inc.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-right">
                    <span className="card-amount positive">
                      +{formatCurrency(inc.amount, userCurrency)}
                    </span>
                    <button className="card-action-btn delete" onClick={() => handleDelete(inc.id)} aria-label="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomSheet open={formOpen} onClose={() => setFormOpen(false)} title="Log Income Entry">
        <IncomeForm onSubmit={handleAddIncome} onCancel={() => setFormOpen(false)} />
      </BottomSheet>
    </div>
  );
}
