export const EXPENSE_CATEGORY_ICONS: Record<string, string> = {
  'Food & Dining': 'restaurant',
  'Transportation': 'car',
  'Bills & Utilities': 'receipt',
  'Shopping': 'cart',
  'Entertainment': 'game-controller',
  'Healthcare': 'medical',
  'Business': 'briefcase',
  'Personal': 'person',
  'Travel': 'airplane',
  'Other': 'ellipsis-horizontal',
};

export const DEFAULT_CURRENCY = 'LRD';
export const CURRENCY_SYMBOLS: Record<string, string> = {
  'LRD': '$',
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'CAD': 'C$',
  'AUD': 'A$',
  'NGN': '₦',
  'INR': '₹',
  'CNY': '¥',
};

export const CURRENCIES = [
  { code: 'LRD', name: 'Liberian Dollar', symbol: '$' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
];

export function getCategoryIcon(categoryName: string): string {
  return EXPENSE_CATEGORY_ICONS[categoryName] || 'ellipsis-horizontal';
}

export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
}
