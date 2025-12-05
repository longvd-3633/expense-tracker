// Storage keys
export const STORAGE_KEYS = {
  SETTINGS: 'expense-tracker:settings',
  PERIOD: 'expense-tracker:period',
} as const

// Validation
export const MAX_AMOUNT = 999999999999.99
export const MIN_AMOUNT = 0.01

// Date formats
export const DATE_FORMATS = {
  'DD/MM/YYYY': 'dd/MM/yyyy',
  'YYYY-MM-DD': 'yyyy-MM-dd',
  'MM/DD/YYYY': 'MM/dd/yyyy',
} as const

// Number formats
export const NUMBER_FORMATS = {
  '1.000.000': { thousands: '.', decimal: ',' },
  '1,000,000': { thousands: ',', decimal: '.' },
} as const

// Currencies
export const CURRENCIES = {
  VND: { symbol: '₫', position: 'after' },
  USD: { symbol: '$', position: 'before' },
} as const

// Period types
export const PERIOD_TYPES = ['daily', 'weekly', 'monthly'] as const

// Transaction types
export const TRANSACTION_TYPES = ['income', 'expense'] as const
