export interface Category {
  id: string;                    // UUID
  userId?: string;               // User ID (null for default categories)
  name: string;                  // Category name
  type: 'income' | 'expense' | 'both';
  color: string;                 // Hex color code
  icon?: string;                 // Icon name
  isDefault: boolean;            // System default vs user-created
}

export const DEFAULT_CATEGORIES: Category[] = [
  // Income categories
  {
    id: 'cat-income-salary',
    name: 'Lương',
    type: 'income',
    color: '#10B981',
    icon: '💼',
    isDefault: true,
  },
  {
    id: 'cat-income-business',
    name: 'Kinh doanh',
    type: 'income',
    color: '#059669',
    icon: '📊',
    isDefault: true,
  },
  {
    id: 'cat-income-investment',
    name: 'Đầu tư',
    type: 'income',
    color: '#34D399',
    icon: '📈',
    isDefault: true,
  },
  {
    id: 'cat-income-gift',
    name: 'Quà tặng',
    type: 'income',
    color: '#6EE7B7',
    icon: '🎁',
    isDefault: true,
  },
  {
    id: 'cat-income-other',
    name: 'Thu nhập khác',
    type: 'income',
    color: '#A7F3D0',
    icon: '💰',
    isDefault: true,
  },
  
  // Expense categories
  {
    id: 'cat-expense-food',
    name: 'Ăn uống',
    type: 'expense',
    color: '#EF4444',
    icon: '🍽️',
    isDefault: true,
  },
  {
    id: 'cat-expense-transport',
    name: 'Di chuyển',
    type: 'expense',
    color: '#F97316',
    icon: '🚗',
    isDefault: true,
  },
  {
    id: 'cat-expense-housing',
    name: 'Nhà ở',
    type: 'expense',
    color: '#8B5CF6',
    icon: '🏠',
    isDefault: true,
  },
  {
    id: 'cat-expense-utilities',
    name: 'Tiện ích',
    type: 'expense',
    color: '#3B82F6',
    icon: '⚡',
    isDefault: true,
  },
  {
    id: 'cat-expense-healthcare',
    name: 'Y tế',
    type: 'expense',
    color: '#EC4899',
    icon: '🏥',
    isDefault: true,
  },
  {
    id: 'cat-expense-entertainment',
    name: 'Giải trí',
    type: 'expense',
    color: '#F59E0B',
    icon: '🎬',
    isDefault: true,
  },
  {
    id: 'cat-expense-shopping',
    name: 'Mua sắm',
    type: 'expense',
    color: '#14B8A6',
    icon: '🛍️',
    isDefault: true,
  },
  {
    id: 'cat-expense-education',
    name: 'Giáo dục',
    type: 'expense',
    color: '#6366F1',
    icon: '📚',
    isDefault: true,
  },
  {
    id: 'cat-expense-other',
    name: 'Chi phí khác',
    type: 'expense',
    color: '#64748B',
    icon: '📝',
    isDefault: true,
  },
];
