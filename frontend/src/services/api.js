const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') + '/api';

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
export const fetchExpenses = async (start, end, category, search) => {
  try {
    const r = await fetch(buildUrl('/expenses', { start, end, category: category !== 'All' ? category : undefined, search }));
    return await r.json();
  } catch { return []; }
};

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
export const fetchSummary = async (start, end) => {
  try {
    const r = await fetch(buildUrl('/summary', { start, end }));
    return await r.json();
  } catch { return { total_income: 0, total_expense: 0, active_budgets_count: 0 }; }
};

export const fetchMonthly = async () => {
  try {
    const r = await fetch(buildUrl('/monthly'));
    return await r.json();
  } catch { return []; }
};

export const fetchDaily = async (days = 30) => {
  try {
    const r = await fetch(buildUrl('/daily', { days }));
    return await r.json();
  } catch { return []; }
};

// ── Budgets ───────────────────────────────────────────────────────
export const fetchBudgets = async (month) => {
  try {
    const r = await fetch(buildUrl('/budgets', { month }));
    return await r.json();
  } catch { return []; }
};

export const saveBudget = async (data) => {
  try {
    const r = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, user_id: getUserId() })
    });
    return await r.json();
  } catch { return { error: 'Network error' }; }
};

export const deleteBudget = async (id) => {
  try {
    const r = await fetch(`${API_BASE}/budgets/${id}?user_id=${getUserId()}`, { method: 'DELETE' });
    return await r.json();
  } catch { return {}; }
};

// ── Income ────────────────────────────────────────────────────────
export const fetchIncome = async (start, end) => {
  try {
    const r = await fetch(buildUrl('/income', { start, end }));
    return await r.json();
  } catch { return []; }
};

export const addIncome = async (data) => {
  try {
    const r = await fetch(`${API_BASE}/income`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, user_id: getUserId() })
    });
    return await r.json();
  } catch { return { error: 'Network error' }; }
};

export const deleteIncome = async (id) => {
  try {
    const r = await fetch(`${API_BASE}/income/${id}?user_id=${getUserId()}`, { method: 'DELETE' });
    return await r.json();
  } catch { return {}; }
};

export const fetchIncomeSummary = async (start, end) => {
  try {
    const r = await fetch(buildUrl('/income/summary', { start, end }));
    return await r.json();
  } catch { return { total_income: 0, total_expense: 0, net_savings: 0 }; }
};

// ── Recurring ─────────────────────────────────────────────────────
export const fetchRecurring = async () => {
  try {
    const r = await fetch(buildUrl('/recurring'));
    return await r.json();
  } catch { return []; }
};

export const addRecurring = async (data) => {
  try {
    const r = await fetch(`${API_BASE}/recurring`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, user_id: getUserId() })
    });
    return await r.json();
  } catch { return { error: 'Network error' }; }
};

export const deleteRecurring = async (id) => {
  try {
    const r = await fetch(`${API_BASE}/recurring/${id}?user_id=${getUserId()}`, { method: 'DELETE' });
    return await r.json();
  } catch { return {}; }
};

export const toggleRecurring = async (id) => {
  try {
    const r = await fetch(`${API_BASE}/recurring/${id}/toggle?user_id=${getUserId()}`, { method: 'PUT' });
    return await r.json();
  } catch { return {}; }
};

export const processRecurring = async () => {
  try {
    const r = await fetch(`${API_BASE}/recurring/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: getUserId() })
    });
    return await r.json();
  } catch { return { message: 'Network error' }; }
};

// ── Notifications ─────────────────────────────────────────────────
export const fetchNotifications = async () => {
  try {
    const r = await fetch(buildUrl('/notifications'));
    return await r.json();
  } catch { return []; }
};

export const markNotificationRead = async (id) => {
  try {
    const r = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
    return await r.json();
  } catch { return {}; }
};

export const clearNotifications = async () => {
  try {
    const r = await fetch(`${API_BASE}/notifications/clear?user_id=${getUserId()}`, { method: 'DELETE' });
    return await r.json();
  } catch { return {}; }
};

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
