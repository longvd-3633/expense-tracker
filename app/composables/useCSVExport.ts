import Papa from 'papaparse';
import type { Transaction } from '~/types/transaction';

export const useCSVExport = () => {
  const categoriesStore = useCategoriesStore();
  const { formatDate, formatCurrency } = useFormatters();

  const exportTransactions = (transactions: Transaction[], filename?: string) => {
    // Prepare data for CSV
    const csvData = transactions.map(t => ({
      'Ngày': formatDate(t.date),
      'Loại': t.type === 'income' ? 'Thu' : 'Chi',
      'Số tiền': t.amount,
      'Danh mục': categoriesStore.getCategoryById(t.category)?.name || t.category,
      'Mô tả': t.description,
      'Tags': t.tags?.join(', ') || '',
    }));

    // Convert to CSV
    const csv = Papa.unparse(csvData, {
      header: true,
    });

    // Add UTF-8 BOM for proper Excel display
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;

    // Create blob and download
    const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const defaultFilename = `expense-tracker-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.href = url;
    link.download = filename || defaultFilename;
    link.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
  };

  return {
    exportTransactions,
  };
};
