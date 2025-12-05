-- Migration: Initial Schema
-- Created: 2025-12-05
-- Description: Create tables for categories, transactions, user_settings with RLS policies

-- ============================================================================
-- TABLES
-- ============================================================================

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'both')),
  color VARCHAR(7) NOT NULL,
  icon VARCHAR(50),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  currency VARCHAR(10) DEFAULT 'VND',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  number_format VARCHAR(20) DEFAULT '1.000.000',
  default_view VARCHAR(20) DEFAULT 'dashboard',
  theme VARCHAR(20) DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Categories Policies
-- Users can view default categories (user_id IS NULL) and their own categories
CREATE POLICY "Users can view categories" ON categories
  FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

-- Users can create their own categories
CREATE POLICY "Users can create categories" ON categories
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update only their own categories
CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete only their own categories
CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE
  USING (user_id = auth.uid());

-- Transactions Policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own transactions" ON transactions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE
  USING (user_id = auth.uid());

-- User Settings Policies
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own settings" ON user_settings
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DEFAULT CATEGORIES (SEED DATA)
-- ============================================================================

-- Insert default categories (user_id = NULL for system defaults)
INSERT INTO categories (name, type, color, icon, is_default) VALUES
  -- Income categories
  ('Lương', 'income', '#10B981', 'briefcase', true),
  ('Kinh doanh', 'income', '#059669', 'chart-bar', true),
  ('Đầu tư', 'income', '#047857', 'trending-up', true),
  ('Quà tặng', 'income', '#34D399', 'gift', true),
  ('Thu nhập khác', 'income', '#6EE7B7', 'plus-circle', true),
  
  -- Expense categories
  ('Ăn uống', 'expense', '#EF4444', 'cake', true),
  ('Di chuyển', 'expense', '#DC2626', 'truck', true),
  ('Nhà ở', 'expense', '#B91C1C', 'home', true),
  ('Tiện ích', 'expense', '#991B1B', 'lightning-bolt', true),
  ('Y tế', 'expense', '#F87171', 'heart', true),
  ('Giải trí', 'expense', '#FCA5A5', 'film', true),
  ('Mua sắm', 'expense', '#FEE2E2', 'shopping-bag', true),
  ('Giáo dục', 'expense', '#F97316', 'academic-cap', true),
  ('Chi phí khác', 'expense', '#FDBA74', 'dots-horizontal', true)
ON CONFLICT DO NOTHING;
