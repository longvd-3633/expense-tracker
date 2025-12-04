import { format as dateFnsFormat } from 'date-fns';
import { vi } from 'date-fns/locale';

export const useFormatters = () => {
  const settingsStore = useSettingsStore();

  const formatCurrency = (amount: number): string => {
    const { currency, numberFormat } = settingsStore.settings;
    
    const formatted = numberFormat === '1.000.000'
      ? amount.toLocaleString('de-DE')
      : amount.toLocaleString('en-US');
    
    return currency === 'VND' ? `${formatted} ₫` : `$${formatted}`;
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const { dateFormat } = settingsStore.settings;
    
    const formatString = dateFormat === 'DD/MM/YYYY' ? 'dd/MM/yyyy' : 'yyyy-MM-dd';
    return dateFnsFormat(dateObj, formatString, { locale: vi });
  };

  const formatDateTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateFnsFormat(dateObj, 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  const formatRelativeDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return 'Hôm qua';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} tháng trước`;
    return `${Math.floor(diffInDays / 365)} năm trước`;
  };

  return {
    formatCurrency,
    formatDate,
    formatDateTime,
    formatRelativeDate,
  };
};
