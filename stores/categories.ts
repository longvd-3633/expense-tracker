import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import type { Category } from '~/types/category';
import { DEFAULT_CATEGORIES } from '~/types/category';

const STORAGE_KEY = 'expense-tracker:categories';

export const useCategoriesStore = defineStore('categories', () => {
  // State
  const categories = useLocalStorage<Category[]>(STORAGE_KEY, DEFAULT_CATEGORIES);

  // Getters
  const incomeCategories = computed(() => 
    categories.value.filter(c => c.type === 'income' || c.type === 'both')
  );

  const expenseCategories = computed(() => 
    categories.value.filter(c => c.type === 'expense' || c.type === 'both')
  );

  const getCategoryById = (id: string) => {
    return categories.value.find(c => c.id === id);
  };

  // Actions
  const addCategory = (category: Omit<Category, 'id' | 'isDefault'>) => {
    const newCategory: Category = {
      ...category,
      id: `cat-custom-${Date.now()}`,
      isDefault: false,
    };
    categories.value.push(newCategory);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const index = categories.value.findIndex(c => c.id === id);
    if (index !== -1) {
      categories.value[index] = { ...categories.value[index], ...updates };
    }
  };

  const deleteCategory = (id: string) => {
    const category = getCategoryById(id);
    if (category && !category.isDefault) {
      categories.value = categories.value.filter(c => c.id !== id);
    }
  };

  const resetToDefaults = () => {
    categories.value = DEFAULT_CATEGORIES;
  };

  return {
    categories,
    incomeCategories,
    expenseCategories,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory,
    resetToDefaults,
  };
});
