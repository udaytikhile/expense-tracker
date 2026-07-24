export const CATEGORIES = [
  { label: "Food & Dining", emoji: "🍔", group: "essentials" },
  { label: "Transport", emoji: "🚗", group: "essentials" },
  { label: "Housing & Rent", emoji: "🏠", group: "essentials" },
  { label: "Health", emoji: "💊", group: "essentials" },
  { label: "Utilities", emoji: "💡", group: "essentials" },
  { label: "Shopping", emoji: "🛍️", group: "lifestyle" },
  { label: "Entertainment", emoji: "🎬", group: "lifestyle" },
  { label: "Travel", emoji: "✈️", group: "lifestyle" },
  { label: "Gifts", emoji: "🎁", group: "lifestyle" },
  { label: "Education", emoji: "📚", group: "work" },
  { label: "Business", emoji: "💼", group: "work" },
  { label: "Other", emoji: "📦", group: "other" },
];

export const CATEGORY_VALUES = CATEGORIES.map(c => `${c.emoji} ${c.label}`);
export const getCategoryValue = (cat) => `${cat.emoji} ${cat.label}`;

export const CATEGORY_GROUPS = {
  essentials: { label: "Essentials", emoji: "🏠" },
  lifestyle: { label: "Lifestyle", emoji: "✨" },
  work: { label: "Work & Learning", emoji: "💼" },
  other: { label: "Other", emoji: "📦" },
};

export const CHART_COLORS = [
  '#f97316', '#ea580c', '#fb923c', '#0d9488',
  '#7c3aed', '#d97706', '#059669', '#0284c7',
  '#e11d48', '#8b5cf6', '#06b6d4', '#84cc16',
];

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export const INCOME_SOURCES = [
  { label: "Salary", emoji: "💰" },
  { label: "Freelance", emoji: "💻" },
  { label: "Investment", emoji: "📈" },
  { label: "Business", emoji: "🏢" },
  { label: "Rental", emoji: "🏠" },
  { label: "Gift", emoji: "🎁" },
  { label: "Refund", emoji: "🔄" },
  { label: "Other", emoji: "📦" },
];

export const getCurrencySymbol = (code = 'INR') => {
  const found = CURRENCIES.find(c => c.code === code);
  return found ? found.symbol : '₹';
};
