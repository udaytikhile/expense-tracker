const API_BASE = 'http://127.0.0.1:5000/api';

const getUserId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.id || 0;
};

async function request(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: { error: 'Network error. Check your connection.' } };
  }
}

function buildUrl(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.append('user_id', getUserId());
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v);
  });
  return url.toString();
}

// ── Auth ──────────────────────────────────────────────────────────
export const loginUser = (email, password) =>
  request(`${API_BASE}/login`, { method: 'POST', body: JSON.stringify({ email, password }) });

export const registerUser = (name, email, password) =>
  request(`${API_BASE}/register`, { method: 'POST', body: JSON.stringify({ name, email, password }) });

export const updateProfile = (name, currency) =>
  request(`${API_BASE}/user/profile`, {
    method: 'PUT',
    body: JSON.stringify({ user_id: getUserId(), name, currency })
  });

// ── Expenses ──────────────────────────────────────────────────────
export const fetchExpenses = (start, end, category, search) =>
  fetch(buildUrl('/expenses', { start, end, category: category !== 'All' ? category : undefined, search })).then(r => r.json());

export const addExpense = (data) =>
  fetch(`${API_BASE}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, user_id: getUserId() })
  }).then(r => r.json());

export const updateExpense = (id, data) =>
  fetch(`${API_BASE}/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, user_id: getUserId() })
  }).then(r => r.json());

export const deleteExpense = (id) =>
  fetch(`${API_BASE}/expenses/${id}?user_id=${getUserId()}`, { method: 'DELETE' }).then(r => r.json());

// ── Summary ───────────────────────────────────────────────────────
export const fetchSummary = (start, end) =>
  fetch(buildUrl('/summary', { start, end })).then(r => r.json());

export const fetchMonthly = () =>
  fetch(buildUrl('/monthly')).then(r => r.json());

export const fetchDaily = (days = 30) =>
  fetch(buildUrl('/daily', { days })).then(r => r.json());

// ── Budgets ───────────────────────────────────────────────────────
export const fetchBudgets = (month) =>
  fetch(buildUrl('/budgets', { month })).then(r => r.json());

export const saveBudget = (data) =>
  fetch(`${API_BASE}/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, user_id: getUserId() })
  }).then(r => r.json());

export const deleteBudget = (id) =>
  fetch(`${API_BASE}/budgets/${id}?user_id=${getUserId()}`, { method: 'DELETE' }).then(r => r.json());

// ── Income ────────────────────────────────────────────────────────
export const fetchIncome = (start, end) =>
  fetch(buildUrl('/income', { start, end })).then(r => r.json());

export const addIncome = (data) =>
  fetch(`${API_BASE}/income`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, user_id: getUserId() })
  }).then(r => r.json());

export const deleteIncome = (id) =>
  fetch(`${API_BASE}/income/${id}?user_id=${getUserId()}`, { method: 'DELETE' }).then(r => r.json());

export const fetchIncomeSummary = (start, end) =>
  fetch(buildUrl('/income/summary', { start, end })).then(r => r.json());

// ── Recurring ─────────────────────────────────────────────────────
export const fetchRecurring = () =>
  fetch(buildUrl('/recurring')).then(r => r.json());

export const addRecurring = (data) =>
  fetch(`${API_BASE}/recurring`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, user_id: getUserId() })
  }).then(r => r.json());

export const deleteRecurring = (id) =>
  fetch(`${API_BASE}/recurring/${id}?user_id=${getUserId()}`, { method: 'DELETE' }).then(r => r.json());

export const toggleRecurring = (id) =>
  fetch(`${API_BASE}/recurring/${id}/toggle?user_id=${getUserId()}`, { method: 'PUT' }).then(r => r.json());

export const processRecurring = () =>
  fetch(`${API_BASE}/recurring/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: getUserId() })
  }).then(r => r.json());

// ── Notifications ─────────────────────────────────────────────────
export const fetchNotifications = () =>
  fetch(buildUrl('/notifications')).then(r => r.json());

export const markNotificationRead = (id) =>
  fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' }).then(r => r.json());

export const clearNotifications = () =>
  fetch(`${API_BASE}/notifications/clear?user_id=${getUserId()}`, { method: 'DELETE' }).then(r => r.json());

// ── Export ─────────────────────────────────────────────────────────
export const exportCSV = async (start, end) => {
  const url = new URL(`${API_BASE}/export/csv`);
  url.searchParams.append('user_id', getUserId());
  if (start) url.searchParams.append('start', start);
  if (end) url.searchParams.append('end', end);
  const res = await fetch(url);
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `spendwise_expenses_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
};
