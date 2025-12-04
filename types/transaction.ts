export interface Transaction {
  id: string;
  date: Date;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionInput {
  date: Date;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  tags?: string[];
}
