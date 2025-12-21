-- TrackMate Expense Management Schema
-- Run this in your Supabase SQL Editor

-- Create expense_categories table
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#FF8C00',
  icon TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create expense_tags table
CREATE TABLE IF NOT EXISTS expense_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#B0B0B0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  expense_date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other')),
  description TEXT,
  merchant TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create expense_tag_relations table (many-to-many)
CREATE TABLE IF NOT EXISTS expense_tag_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES expense_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(expense_id, tag_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS expense_categories_user_id_idx ON expense_categories(user_id);
CREATE INDEX IF NOT EXISTS expense_tags_user_id_idx ON expense_tags(user_id);
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_category_id_idx ON expenses(category_id);
CREATE INDEX IF NOT EXISTS expenses_expense_date_idx ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS expense_tag_relations_expense_id_idx ON expense_tag_relations(expense_id);
CREATE INDEX IF NOT EXISTS expense_tag_relations_tag_id_idx ON expense_tag_relations(tag_id);

-- Enable Row Level Security
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_tag_relations ENABLE ROW LEVEL SECURITY;

-- Policies for expense_categories
CREATE POLICY "Users can view own categories"
  ON expense_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON expense_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON expense_categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON expense_categories FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for expense_tags
CREATE POLICY "Users can view own tags"
  ON expense_tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags"
  ON expense_tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
  ON expense_tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
  ON expense_tags FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for expenses
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for expense_tag_relations
CREATE POLICY "Users can view own expense tag relations"
  ON expense_tag_relations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM expenses
      WHERE expenses.id = expense_tag_relations.expense_id
      AND expenses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own expense tag relations"
  ON expense_tag_relations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM expenses
      WHERE expenses.id = expense_tag_relations.expense_id
      AND expenses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own expense tag relations"
  ON expense_tag_relations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM expenses
      WHERE expenses.id = expense_tag_relations.expense_id
      AND expenses.user_id = auth.uid()
    )
  );

-- Triggers to auto-update updated_at
CREATE TRIGGER update_expense_categories_updated_at
  BEFORE UPDATE ON expense_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories for new users (run this as a function)
CREATE OR REPLACE FUNCTION create_default_expense_categories(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO expense_categories (user_id, name, color, icon, is_default) VALUES
    (p_user_id, 'Food & Dining', '#FF6B6B', 'restaurant', true),
    (p_user_id, 'Transportation', '#4ECDC4', 'car', true),
    (p_user_id, 'Bills & Utilities', '#FFD93D', 'receipt', true),
    (p_user_id, 'Shopping', '#95E1D3', 'shopping-bag', true),
    (p_user_id, 'Entertainment', '#A8E6CF', 'film', true),
    (p_user_id, 'Healthcare', '#FF8B94', 'heart-pulse', true),
    (p_user_id, 'Business', '#FF8C00', 'briefcase', true),
    (p_user_id, 'Personal', '#B4A7D6', 'user', true),
    (p_user_id, 'Travel', '#6C5CE7', 'plane', true),
    (p_user_id, 'Other', '#B0B0B0', 'more-horizontal', true);
END;
$$ LANGUAGE plpgsql;
