import React, { useState, useEffect } from 'react';
import { fetchSummary, fetchMonthly } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';
import { CHART_COLORS } from '../utils/constants';
import PageHeader from '../components/layout/PageHeader';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

import { TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, Lightbulb } from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      const [sumRes, monRes] = await Promise.all([
        fetchSummary(),
        fetchMonthly()
      ]);
      setSummary(sumRes);
      setMonthlyData(monRes || []);
    } catch (err) {
      addToast('Failed to load financial analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="mobile-page">
        <PageHeader title="Analytics" />
        <div className="skeleton-container">
          <div className="skeleton skeleton-hero" style={{ height: 200 }} />
          <div className="skeleton skeleton-hero" style={{ height: 200 }} />
        </div>
      </div>
    );
  }

  const userCurrency = user?.currency || 'INR';

  // Format category distribution for Pie Chart
  const pieData = summary?.category_distribution 
    ? Object.entries(summary.category_distribution).map(([name, value]) => ({
        name: name.replace(/^[^\s]+\s*/, ''), // Remove emoji for cleaner presentation
        value
      }))
    : [];

  const totalInc = summary?.total_income || 0;
  const totalExp = summary?.total_expense ?? summary?.total_expenses ?? 0;
  const netSavings = summary?.balance ?? (totalInc - totalExp);

  return (
    <div className="mobile-page">
      <PageHeader title="Analytics" />

      {/* Financial Overview Stats Cards */}
      <div className="analytics-stats-grid stagger-1">
        <div className="analytics-stat-card income">
          <div className="icon-wrap"><ArrowUpRight size={16} /></div>
          <span className="label">Total Inflow</span>
          <span className="val">{formatCurrency(totalInc, userCurrency)}</span>
        </div>
        <div className="analytics-stat-card expense">
          <div className="icon-wrap"><ArrowDownRight size={16} /></div>
          <span className="label">Total Outflow</span>
          <span className="val">{formatCurrency(totalExp, userCurrency)}</span>
        </div>
        <div className="analytics-stat-card savings">
          <div className="icon-wrap"><Wallet size={16} /></div>
          <span className="label">Net Savings</span>
          <span className="val">{formatCurrency(netSavings, userCurrency)}</span>
        </div>
      </div>

      {/* Category Breakdown (Donut Chart) */}
      <div className="dashboard-chart-card stagger-2">
        <h3 className="section-title">Expense Distribution</h3>
        {pieData.length === 0 ? (
          <div className="chart-empty-state">No transaction history this month</div>
        ) : (
          <div style={{ width: '100%', height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value, userCurrency)} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Custom Pie Legend */}
            <div className="chart-custom-legend">
              {pieData.slice(0, 4).map((entry, index) => (
                <div key={entry.name} className="legend-item">
                  <span className="legend-badge" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                  <span className="legend-label">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Summary (Bar Chart) */}
      <div className="dashboard-chart-card">
        <h3 className="section-title">Monthly Comparison</h3>
        {monthlyData.length === 0 ? (
          <div className="chart-empty-state">No monthly records yet</div>
        ) : (
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => formatCurrency(value, userCurrency)} />
                <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]}>
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === monthlyData.length - 1 ? '#f97316' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
