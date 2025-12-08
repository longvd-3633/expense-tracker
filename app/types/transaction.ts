export interface Transaction {
  id: string;                    // UUID
  userId: string;                // User ID (from Supabase Auth)
  date: Date;                    // Transaction date
  type: 'income' | 'expense';    // Transaction type
  amount: number;                // Amount in VND
  category: string | null;       // Category ID (can be null for legacy data)
  description: string;           // Description/notes
  tags?: string[];               // Optional tags
  createdAt: Date;               // Created timestamp
  updatedAt: Date;               // Last updated timestamp
}

export interface TransactionInput {
  date: Date;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  tags?: string[];
}
