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
    icon: 'briefcase',
    isDefault: true,
  },
  {
    id: 'cat-income-business',
    name: 'Kinh doanh',
    type: 'income',
    color: '#059669',
    icon: 'chart-bar',
    isDefault: true,
  },
  {
    id: 'cat-income-investment',
    name: 'Đầu tư',
    type: 'income',
    color: '#34D399',
    icon: 'trending-up',
    isDefault: true,
  },
  {
    id: 'cat-income-gift',
    name: 'Quà tặng',
    type: 'income',
    color: '#6EE7B7',
    icon: 'gift',
    isDefault: true,
  },
  {
    id: 'cat-income-other',
    name: 'Thu nhập khác',
    type: 'income',
    color: '#A7F3D0',
    icon: 'plus-circle',
    isDefault: true,
  },
  
  // Expense categories
  {
    id: 'cat-expense-food',
    name: 'Ăn uống',
    type: 'expense',
    color: '#EF4444',
    icon: 'utensils',
    isDefault: true,
  },
  {
    id: 'cat-expense-transport',
    name: 'Di chuyển',
    type: 'expense',
    color: '#F97316',
    icon: 'car',
    isDefault: true,
  },
  {
    id: 'cat-expense-housing',
    name: 'Nhà ở',
    type: 'expense',
    color: '#8B5CF6',
    icon: 'home',
    isDefault: true,
  },
  {
    id: 'cat-expense-utilities',
    name: 'Tiện ích',
    type: 'expense',
    color: '#3B82F6',
    icon: 'lightning-bolt',
    isDefault: true,
  },
  {
    id: 'cat-expense-healthcare',
    name: 'Y tế',
    type: 'expense',
    color: '#EC4899',
    icon: 'heart',
    isDefault: true,
  },
  {
    id: 'cat-expense-entertainment',
    name: 'Giải trí',
    type: 'expense',
    color: '#F59E0B',
    icon: 'film',
    isDefault: true,
  },
  {
    id: 'cat-expense-shopping',
    name: 'Mua sắm',
    type: 'expense',
    color: '#14B8A6',
    icon: 'shopping-bag',
    isDefault: true,
  },
  {
    id: 'cat-expense-education',
    name: 'Giáo dục',
    type: 'expense',
    color: '#6366F1',
    icon: 'academic-cap',
    isDefault: true,
  },
  {
    id: 'cat-expense-other',
    name: 'Chi phí khác',
    type: 'expense',
    color: '#64748B',
    icon: 'dots-horizontal',
    isDefault: true,
  },
];
