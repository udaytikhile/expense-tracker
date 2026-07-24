import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchSummary, fetchExpenses, deleteExpense } from '../services/api';
import { formatCurrency, getGreeting } from '../utils/formatters';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import PageHeader from '../components/layout/PageHeader';
import { 
  ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Plus, 
  Receipt, Landmark, ChevronRight, Trash2, Edit2, Calendar, Sparkles
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [summary, setSummary] = useState({ total_income: 0, total_expenses: 0, balance: 0, active_budgets_count: 0 });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  const loadDashboardData = async () => {
    try {
      const [sumData, expData] = await Promise.all([
        fetchSummary(),
        fetchExpenses()
      ]);
      const inc = sumData?.total_income || 0;
      const exp = sumData?.total_expense ?? sumData?.total_expenses ?? 0;
      setSummary({
        total_income: inc,
        total_expenses: exp,
        balance: sumData?.balance ?? (inc - exp),
        active_budgets_count: sumData?.active_budgets_count || 0
      });
      const safeExpData = Array.isArray(expData) ? expData : [];
      setRecentExpenses(safeExpData.slice(0, 5));

      // Generate simple mock/processed chart data for the last few days
      if (safeExpData.length > 0) {
        const dailyMap = {};
        safeExpData.forEach(exp => {
          const dateLabel = new Date(exp.date || new Date()).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
          dailyMap[dateLabel] = (dailyMap[dateLabel] || 0) + (exp.amount || 0);
        });
        const chartList = Object.entries(dailyMap).map(([name, amount]) => ({ name, amount })).reverse().slice(-7);
        setChartData(chartList);
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id);
      addToast('Expense deleted successfully', 'success');
      loadDashboardData();
    } catch (err) {
      addToast('Failed to delete expense', 'error');
    }
  };

  if (loading) {
    return (
      <div className="mobile-page">
        <PageHeader title="Home" />
        <div className="skeleton-container">
          <div className="skeleton skeleton-hero" />
          <div className="skeleton-row">
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
          </div>
          <div className="skeleton skeleton-section-title" />
          <div className="skeleton skeleton-list-item" />
          <div className="skeleton skeleton-list-item" />
          <div className="skeleton skeleton-list-item" />
        </div>
      </div>
    );
  }

  const userCurrency = user?.currency || 'INR';

  return (
    <div className="mobile-page">
      <PageHeader title="Overview" />

      {/* Greeting card */}
      <div className="dashboard-greeting stagger-1">
        <div className="greeting-text">
          <h2>{getGreeting()}, {user?.name || 'User'}!</h2>
          <p>Here's your financial summary for this month</p>
        </div>
      </div>

      {/* Main Balance Card */}
      <div className="balance-hero-card stagger-1">
        <div className="balance-card-header">
          <span className="balance-card-label">Total Balance</span>
          <span className="balance-status-badge">
            <Sparkles size={12} /> Active
          </span>
        </div>

        <h2 className="balance-card-amount">
          <AnimatedCounter value={summary.balance} prefix={userCurrency === 'INR' ? '₹' : '$'} />
        </h2>
        
        <div className="balance-card-stats-row">
          <div className="stat-col">
            <div className="stat-icon-circle income">
              <ArrowUpRight size={16} />
            </div>
            <div className="stat-text-wrap">
              <span className="stat-col-label">Income</span>
              <span className="stat-col-val">{formatCurrency(summary.total_income, userCurrency)}</span>
            </div>
          </div>

          <div className="stat-col">
            <div className="stat-icon-circle expenses">
              <ArrowDownRight size={16} />
            </div>
            <div className="stat-text-wrap">
              <span className="stat-col-label">Expenses</span>
              <span className="stat-col-val">{formatCurrency(summary.total_expenses, userCurrency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="quick-actions-section stagger-2">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <button className="action-hub-btn" onClick={() => navigate('/expenses/add')}>
            <div className="action-icon-wrap orange">
              <Plus size={20} />
            </div>
            <span>Add Expense</span>
          </button>
          <button className="action-hub-btn" onClick={() => navigate('/income')}>
            <div className="action-icon-wrap teal">
              <Landmark size={20} />
            </div>
            <span>Add Income</span>
          </button>
          <button className="action-hub-btn" onClick={() => navigate('/budget')}>
            <div className="action-icon-wrap purple">
              <TrendingUp size={20} />
            </div>
            <span>Budgets</span>
          </button>
          <button className="action-hub-btn" onClick={() => navigate('/recurring')}>
            <div className="action-icon-wrap blue">
              <Calendar size={20} />
            </div>
            <span>Recurring</span>
          </button>
        </div>
      </div>

      {/* Mini Chart Section */}
      {chartData.length > 0 && (
        <div className="dashboard-chart-card stagger-3">
          <h3 className="section-title">Spending Trend</h3>
          <div style={{ width: '100%', height: 160 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Transactions Card List */}
      <div className="recent-transactions-section stagger-4">
        <div className="section-header-row">
          <h3 className="section-title">Recent Expenses</h3>
          <button className="view-all-link-btn" onClick={() => navigate('/expenses')}>
            See All <ChevronRight size={16} />
          </button>
        </div>

        <div className="mobile-card-list">
          {recentExpenses.length === 0 ? (
            <div className="empty-card-list">
              <Receipt size={32} />
              <p>No transactions added yet</p>
              <button className="btn-primary btn-sm" onClick={() => navigate('/expenses/add')}>Add First Expense</button>
            </div>
          ) : (
            recentExpenses.map(exp => {
              const categoryStr = exp.category || '📦 Unknown';
              const categoryEmoji = categoryStr.split(' ')[0] || '📦';
              const categoryName = categoryStr.replace(/^[^\s]+\s*/, '') || 'Unknown';
              return (
                <div key={exp.id} className="mobile-transaction-card">
                  <div className="card-left">
                    <div className="category-avatar-circle">
                      {categoryEmoji}
                    </div>
                    <div className="card-details">
                      <span className="card-title-text">{categoryName}</span>
                      <span className="card-subtitle-text">{exp.note || 'No note'}</span>
                    </div>
                  </div>
                  <div className="card-right">
                    <span className="card-amount negative">
                      -{formatCurrency(exp.amount, userCurrency)}
                    </span>
                    <button className="card-action-btn delete" onClick={() => handleDeleteExpense(exp.id)} aria-label="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
