const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Helper to get user_id from localStorage
const getUserId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || 0;
};

// ── Expenses ──────────────────────────────────────────────────────────────────
export const fetchExpenses = async (start, end, category, search) => {
    const url = new URL(`${API_BASE_URL}/expenses`);
    url.searchParams.append('user_id', getUserId());
    if (start) url.searchParams.append('start', start);
    if (end) url.searchParams.append('end', end);
    if (category && category !== 'All') url.searchParams.append('category', category);
    if (search) url.searchParams.append('search', search);
    const res = await fetch(url);
    return res.json();
};

export const addExpense = async (data) => {
    const res = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, user_id: getUserId() })
    });
    return res.json();
};

export const updateExpense = async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, user_id: getUserId() })
    });
    return res.json();
};

export const deleteExpense = async (id) => {
    const res = await fetch(`${API_BASE_URL}/expenses/${id}?user_id=${getUserId()}`, { method: 'DELETE' });
    return res.json();
};

// ── Summary ───────────────────────────────────────────────────────────────────
export const fetchSummary = async (start, end) => {
    const url = new URL(`${API_BASE_URL}/summary`);
    url.searchParams.append('user_id', getUserId());
    if (start) url.searchParams.append('start', start);
    if (end) url.searchParams.append('end', end);
    const res = await fetch(url);
    return res.json();
};

export const fetchMonthly = async () => {
    const res = await fetch(`${API_BASE_URL}/monthly?user_id=${getUserId()}`);
    return res.json();
};

export const fetchDaily = async (days = 30) => {
    const res = await fetch(`${API_BASE_URL}/daily?user_id=${getUserId()}&days=${days}`);
    return res.json();
};

// ── Budgets ───────────────────────────────────────────────────────────────────
export const fetchBudgets = async (month) => {
    const url = new URL(`${API_BASE_URL}/budgets`);
    url.searchParams.append('user_id', getUserId());
    if (month) url.searchParams.append('month', month);
    const res = await fetch(url);
    return res.json();
};

export const saveBudget = async (data) => {
    const res = await fetch(`${API_BASE_URL}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, user_id: getUserId() })
    });
    return res.json();
};

export const deleteBudget = async (id) => {
    const res = await fetch(`${API_BASE_URL}/budgets/${id}?user_id=${getUserId()}`, { method: 'DELETE' });
    return res.json();
};

// ── Income ────────────────────────────────────────────────────────────────────
export const fetchIncome = async (start, end) => {
    const url = new URL(`${API_BASE_URL}/income`);
    url.searchParams.append('user_id', getUserId());
    if (start) url.searchParams.append('start', start);
    if (end) url.searchParams.append('end', end);
    const res = await fetch(url);
    return res.json();
};

export const addIncome = async (data) => {
    const res = await fetch(`${API_BASE_URL}/income`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, user_id: getUserId() })
    });
    return res.json();
};

export const deleteIncome = async (id) => {
    const res = await fetch(`${API_BASE_URL}/income/${id}?user_id=${getUserId()}`, { method: 'DELETE' });
    return res.json();
};

export const fetchIncomeSummary = async (start, end) => {
    const url = new URL(`${API_BASE_URL}/income/summary`);
    url.searchParams.append('user_id', getUserId());
    if (start) url.searchParams.append('start', start);
    if (end) url.searchParams.append('end', end);
    const res = await fetch(url);
    return res.json();
};

// ── Recurring ─────────────────────────────────────────────────────────────────
export const fetchRecurring = async () => {
    const res = await fetch(`${API_BASE_URL}/recurring?user_id=${getUserId()}`);
    return res.json();
};

export const addRecurring = async (data) => {
    const res = await fetch(`${API_BASE_URL}/recurring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, user_id: getUserId() })
    });
    return res.json();
};

export const deleteRecurring = async (id) => {
    const res = await fetch(`${API_BASE_URL}/recurring/${id}?user_id=${getUserId()}`, { method: 'DELETE' });
    return res.json();
};

export const toggleRecurring = async (id) => {
    const res = await fetch(`${API_BASE_URL}/recurring/${id}/toggle?user_id=${getUserId()}`, { method: 'PUT' });
    return res.json();
};

export const processRecurring = async () => {
    const res = await fetch(`${API_BASE_URL}/recurring/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: getUserId() })
    });
    return res.json();
};

// ── Export ─────────────────────────────────────────────────────────────────────
export const exportCSV = async (start, end) => {
    const url = new URL(`${API_BASE_URL}/export/csv`);
    url.searchParams.append('user_id', getUserId());
    if (start) url.searchParams.append('start', start);
    if (end) url.searchParams.append('end', end);
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'expenses.csv';
    a.click();
    URL.revokeObjectURL(a.href);
};

// ── Authentication ────────────────────────────────────────────────────────────
export const registerUser = async (name, email, password) => {
    const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    return { ok: res.ok, data: await res.json() };
};

export const loginUser = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return { ok: res.ok, data: await res.json() };
};

// ── Profile ───────────────────────────────────────────────────────────────────
export const updateProfile = async (name, currency) => {
    const res = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: getUserId(), name, currency })
    });
    return { ok: res.ok, data: await res.json() };
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const fetchNotifications = async () => {
    const res = await fetch(`${API_BASE_URL}/notifications?user_id=${getUserId()}`);
    return res.json();
};

export const markNotificationRead = async (id) => {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
    return res.json();
};

export const clearNotifications = async () => {
    const res = await fetch(`${API_BASE_URL}/notifications/clear?user_id=${getUserId()}`, { method: 'DELETE' });
    return res.json();
};
