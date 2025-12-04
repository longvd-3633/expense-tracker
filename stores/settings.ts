import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';

const STORAGE_KEY = 'expense-tracker:settings';

export interface Settings {
  currency: 'VND' | 'USD';
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD';
  numberFormat: '1.000.000' | '1,000,000';
  defaultView: 'dashboard' | 'transactions';
  theme: 'light' | 'dark';
}

const DEFAULT_SETTINGS: Settings = {
  currency: 'VND',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: '1.000.000',
  defaultView: 'dashboard',
  theme: 'light',
};

export const useSettingsStore = defineStore('settings', () => {
  const settings = useLocalStorage<Settings>(STORAGE_KEY, DEFAULT_SETTINGS);

  const updateSettings = (updates: Partial<Settings>) => {
    settings.value = { ...settings.value, ...updates };
  };

  const resetSettings = () => {
    settings.value = DEFAULT_SETTINGS;
  };

  return {
    settings,
    updateSettings,
    resetSettings,
  };
});
