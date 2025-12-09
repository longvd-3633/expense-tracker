export interface Transaction {
  id: string;                    // UUID
  userId: string;                // User ID (from Supabase Auth)
  date: Date;                    // Transaction date
  type: 'income' | 'expense';    // Transaction type
  amount: number;                // Amount in VND
  category: string | null;       // Category ID (can be null for legacy data)
  description: string;           // Description/notes
  tags?: string[];               // Optional tags
  recurringTransactionId?: string | null; // Reference to recurring template if generated
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
  recurringTransactionId?: string | null; // Optional reference to recurring template
}

// ============================================================================
// RECURRING TRANSACTIONS
// ============================================================================

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type MonthlyType = 'by_date' | 'by_weekday';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // Every N periods (e.g., every 2 weeks)
  startDate: Date;
  endDate: Date | null;
  
  // Weekly pattern (0=Sunday, 1=Monday, ..., 6=Saturday)
  weekdays?: number[];
  
  // Monthly pattern options
  monthlyType?: MonthlyType;
  monthlyDay?: number; // 1-31 for by_date
  monthlyWeekday?: number; // 0-6 for by_weekday (0=Sunday, ..., 6=Saturday)
  monthlyWeekPosition?: number; // 1-5 (1=first, 2=second, 3=third, 4=fourth, 5=last)
  
  // Max occurrences limit
  maxOccurrences?: number | null;
}

export interface RecurringTransaction {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  description: string;
  
  // Recurrence pattern
  frequency: RecurrenceFrequency;
  interval: number;
  startDate: Date;
  endDate: Date | null;
  weekdays?: number[];
  monthlyType?: MonthlyType;
  monthlyDay?: number;
  monthlyWeekday?: number;
  monthlyWeekPosition?: number;
  
  // Status
  isActive: boolean;
  autoCreate: boolean;
  
  // Tracking
  lastGeneratedDate: Date | null;
  nextOccurrenceDate: Date;
  occurrencesGenerated: number;
  maxOccurrences: number | null;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface RecurringTransactionInput {
  name: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  description: string;
  frequency: RecurrenceFrequency;
  interval: number;
  startDate: Date;
  endDate?: Date | null;
  weekdays?: number[];
  monthlyType?: MonthlyType;
  monthlyDay?: number;
  monthlyWeekday?: number;
  monthlyWeekPosition?: number;
  autoCreate?: boolean;
  maxOccurrences?: number | null;
}

export interface GeneratedTransaction {
  id: string;
  recurringTransactionId: string;
  transactionId: string;
  occurrenceDate: Date;
  createdAt: Date;
}
