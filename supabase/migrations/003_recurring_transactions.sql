-- Migration: Recurring Transactions
-- Created: 2025-12-10
-- Description: Create recurring_transactions table and generated_transactions junction table with RLS policies

-- ============================================================================
-- TABLES
-- ============================================================================

-- Recurring Transactions Table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  description TEXT,
  
  -- Recurrence Pattern
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  interval INTEGER NOT NULL DEFAULT 1 CHECK (interval > 0),
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Weekly pattern (for weekly frequency only)
  weekdays INTEGER[] DEFAULT '{}', -- 0=Sunday, 1=Monday, ..., 6=Saturday
  
  -- Monthly pattern options
  monthly_type VARCHAR(20) CHECK (monthly_type IN ('by_date', 'by_weekday', NULL)),
  monthly_day INTEGER CHECK (monthly_day BETWEEN 1 AND 31), -- for by_date
  monthly_weekday INTEGER CHECK (monthly_weekday BETWEEN 0 AND 6), -- for by_weekday (0=Sunday, ..., 6=Saturday)
  monthly_week_position INTEGER CHECK (monthly_week_position BETWEEN 1 AND 5), -- 1=first, 2=second, 3=third, 4=fourth, 5=last
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  auto_create BOOLEAN NOT NULL DEFAULT true,
  
  -- Tracking
  last_generated_date DATE,
  next_occurrence_date DATE NOT NULL,
  occurrences_generated INTEGER NOT NULL DEFAULT 0,
  max_occurrences INTEGER CHECK (max_occurrences > 0),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT end_date_after_start CHECK (end_date IS NULL OR end_date > start_date),
  CONSTRAINT weekdays_for_weekly CHECK (
    (frequency = 'weekly' AND weekdays IS NOT NULL AND array_length(weekdays, 1) > 0) OR
    (frequency != 'weekly')
  ),
  CONSTRAINT monthly_type_for_monthly CHECK (
    (frequency = 'monthly' AND monthly_type IS NOT NULL) OR
    (frequency != 'monthly' AND monthly_type IS NULL)
  )
);

-- Generated Transactions Junction Table
-- Tracks which transactions were generated from which recurring template
CREATE TABLE IF NOT EXISTS generated_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurring_transaction_id UUID NOT NULL REFERENCES recurring_transactions(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  occurrence_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate generation for same occurrence
  CONSTRAINT unique_recurring_occurrence UNIQUE (recurring_transaction_id, occurrence_date)
);

-- Add recurring_transaction_id column to transactions table (for backward reference)
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS recurring_transaction_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Recurring Transactions Indexes
CREATE INDEX IF NOT EXISTS recurring_transactions_user_id_idx ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS recurring_transactions_next_occurrence_idx ON recurring_transactions(next_occurrence_date);
CREATE INDEX IF NOT EXISTS recurring_transactions_is_active_idx ON recurring_transactions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS recurring_transactions_deleted_at_idx ON recurring_transactions(deleted_at) WHERE deleted_at IS NULL;

-- Generated Transactions Indexes
CREATE INDEX IF NOT EXISTS generated_transactions_recurring_id_idx ON generated_transactions(recurring_transaction_id);
CREATE INDEX IF NOT EXISTS generated_transactions_transaction_id_idx ON generated_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS generated_transactions_occurrence_date_idx ON generated_transactions(occurrence_date);

-- Transactions recurring reference index
CREATE INDEX IF NOT EXISTS transactions_recurring_id_idx ON transactions(recurring_transaction_id) WHERE recurring_transaction_id IS NOT NULL;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on recurring_transactions
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own active recurring transactions
CREATE POLICY "Users can view own recurring transactions"
  ON recurring_transactions FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Users can create their own recurring transactions
CREATE POLICY "Users can create own recurring transactions"
  ON recurring_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own recurring transactions
CREATE POLICY "Users can update own recurring transactions"
  ON recurring_transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can soft delete their own recurring transactions
CREATE POLICY "Users can delete own recurring transactions"
  ON recurring_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on generated_transactions
ALTER TABLE generated_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view generated transactions for their recurring templates
CREATE POLICY "Users can view own generated transactions"
  ON generated_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recurring_transactions rt
      WHERE rt.id = recurring_transaction_id
        AND rt.user_id = auth.uid()
    )
  );

-- System can insert generated transactions (via authenticated user context)
CREATE POLICY "Users can create generated transactions"
  ON generated_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recurring_transactions rt
      WHERE rt.id = recurring_transaction_id
        AND rt.user_id = auth.uid()
    )
  );

-- Allow deletion when deleting template or transaction
CREATE POLICY "Users can delete generated transactions"
  ON generated_transactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recurring_transactions rt
      WHERE rt.id = recurring_transaction_id
        AND rt.user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_recurring_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER recurring_transactions_updated_at_trigger
  BEFORE UPDATE ON recurring_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_recurring_transactions_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE recurring_transactions IS 'Templates for recurring transactions that auto-generate on schedule';
COMMENT ON TABLE generated_transactions IS 'Junction table tracking which transactions were generated from recurring templates';
COMMENT ON COLUMN recurring_transactions.frequency IS 'Recurrence pattern: daily, weekly, monthly, yearly';
COMMENT ON COLUMN recurring_transactions.interval IS 'Repeat every N periods (e.g., every 2 weeks)';
COMMENT ON COLUMN recurring_transactions.weekdays IS 'For weekly: array of weekdays (0=Sun, 1=Mon, ..., 6=Sat)';
COMMENT ON COLUMN recurring_transactions.monthly_type IS 'For monthly: by_date (e.g., 15th) or by_weekday (e.g., 2nd Monday)';
COMMENT ON COLUMN recurring_transactions.next_occurrence_date IS 'Next scheduled date to generate transaction';
COMMENT ON COLUMN recurring_transactions.max_occurrences IS 'Stop after N occurrences (NULL = unlimited)';
