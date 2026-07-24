import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { addExpense } from '../services/api';
import PageHeader from '../components/layout/PageHeader';
import ExpenseForm from '../components/forms/ExpenseForm';

export default function AddExpensePage() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (expenseData) => {
    setSaving(true);
    try {
      const res = await addExpense(expenseData);
      if (res && !res.error) {
        addToast('Expense recorded successfully! 💸', 'success');
        navigate('/');
      } else {
        addToast(res.error || 'Failed to save expense', 'error');
      }
    } catch (err) {
      addToast('Network error, please check connection', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mobile-page">
      <PageHeader title="New Expense" showBack={true} />
      <div className="form-page-container">
        <ExpenseForm onSubmit={handleSubmit} onCancel={() => navigate(-1)} submitLabel={saving ? "Saving..." : "Save Expense"} />
      </div>
    </div>
  );
}
