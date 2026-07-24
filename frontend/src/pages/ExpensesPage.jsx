import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchExpenses, deleteExpense } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CATEGORIES } from '../utils/constants';
import PageHeader from '../components/layout/PageHeader';
import { Search, Filter, Plus, Trash2, Calendar, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import BottomSheet from '../components/ui/BottomSheet';

export default function ExpensesPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await fetchExpenses(
        startDate || undefined,
        endDate || undefined,
        category !== 'All' ? category : undefined,
        search || undefined
      );
      setExpenses(data || []);
      setCurrentPage(1);
    } catch (err) {
      addToast('Failed to load expenses list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [category, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadExpenses();
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      addToast('Transaction removed successfully', 'success');
      loadExpenses();
    } catch (err) {
      addToast('Failed to delete transaction', 'error');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setStartDate('');
    setEndDate('');
    setFilterOpen(false);
  };

  const userCurrency = user?.currency || 'INR';

  // Client side pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = expenses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(expenses.length / itemsPerPage);

  return (
    <div className="mobile-page">
      <PageHeader 
        title="Expenses" 
        rightAction={
          <button className="header-action-circle-btn" onClick={() => navigate('/expenses/add')}>
            <Plus size={20} />
          </button>
        }
      />

      {/* Search Bar */}
      <form className="search-form-wrap" onSubmit={handleSearchSubmit}>
        <div className="search-input-box">
          <Search size={18} className="search-icon" />
          <input
            type="search"
            placeholder="Search notes, categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button type="button" className="filter-toggle-btn" onClick={() => setFilterOpen(true)}>
          <SlidersHorizontal size={18} />
        </button>
      </form>

      {/* Expenses List */}
      <div className="expenses-list-container">
        {loading ? (
          <div className="skeleton-container">
            <div className="skeleton skeleton-list-item" />
            <div className="skeleton skeleton-list-item" />
            <div className="skeleton skeleton-list-item" />
            <div className="skeleton skeleton-list-item" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="empty-card-list">
            <SlidersHorizontal size={36} />
            <p>No transactions match your search/filters</p>
            <button className="btn-secondary btn-sm" onClick={resetFilters}>Reset Filters</button>
          </div>
        ) : (
          <>
            <div className="mobile-card-list">
              {currentItems.map(exp => {
                const categoryEmoji = exp.category.split(' ')[0] || '📦';
                const categoryName = exp.category.replace(/^[^\s]+\s*/, '');
                return (
                  <div key={exp.id} className="mobile-transaction-card">
                    <div className="card-left">
                      <div className="category-avatar-circle">
                        {categoryEmoji}
                      </div>
                      <div className="card-details">
                        <span className="card-title-text">{categoryName}</span>
                        <div className="card-subtitle-row">
                          <span className="card-subtitle-text">{exp.note || 'No note'}</span>
                          <span className="dot-divider" />
                          <span className="card-date-badge">{formatDate(exp.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="card-right">
                      <span className="card-amount negative">
                        -{formatCurrency(exp.amount, userCurrency)}
                      </span>
                      <button className="card-action-btn delete" onClick={() => handleDelete(exp.id)} aria-label="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-wrapper">
                <button 
                  className="page-nav-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="page-indicator">Page {currentPage} of {totalPages}</span>
                <button 
                  className="page-nav-btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      <BottomSheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter Transactions">
        <div className="filter-sheet-body">
          <div className="form-group">
            <label>Filter by Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.label} value={`${cat.emoji} ${cat.label}`}>{cat.emoji} {cat.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          <div className="filter-sheet-actions">
            <button className="btn-secondary flex-1" onClick={resetFilters}>Reset</button>
            <button className="btn-primary flex-1" onClick={() => setFilterOpen(false)}>Apply</button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
