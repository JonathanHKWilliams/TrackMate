-- TrackMate Budget Management Schema
-- Run this in your Supabase SQL Editor after expense schema

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
  category_id UUID REFERENCES expense_categories(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  alert_threshold INTEGER DEFAULT 80 CHECK (alert_threshold >= 0 AND alert_threshold <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create budget_alerts table to track when users were notified
CREATE TABLE IF NOT EXISTS budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('threshold', 'exceeded', 'near_end')),
  percentage_used DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS budgets_user_id_idx ON budgets(user_id);
CREATE INDEX IF NOT EXISTS budgets_category_id_idx ON budgets(category_id);
CREATE INDEX IF NOT EXISTS budgets_period_idx ON budgets(period);
CREATE INDEX IF NOT EXISTS budgets_dates_idx ON budgets(start_date, end_date);
CREATE INDEX IF NOT EXISTS budget_alerts_budget_id_idx ON budget_alerts(budget_id);

-- Enable Row Level Security
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;

-- Policies for budgets
CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for budget_alerts
CREATE POLICY "Users can view own budget alerts"
  ON budget_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_alerts.budget_id
      AND budgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own budget alerts"
  ON budget_alerts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_alerts.budget_id
      AND budgets.user_id = auth.uid()
    )
  );

-- Trigger to auto-update updated_at
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate budget spending
CREATE OR REPLACE FUNCTION get_budget_spending(
  p_budget_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_category_id UUID DEFAULT NULL
)
RETURNS DECIMAL(12, 2) AS $$
DECLARE
  total_spent DECIMAL(12, 2);
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total_spent
  FROM expenses
  WHERE user_id = (SELECT user_id FROM budgets WHERE id = p_budget_id)
    AND expense_date >= p_start_date
    AND expense_date <= p_end_date
    AND (p_category_id IS NULL OR category_id = p_category_id);
  
  RETURN total_spent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Function to get active budgets with spending
CREATE OR REPLACE FUNCTION get_active_budgets_with_spending(p_user_id UUID)
RETURNS TABLE (
  budget_id UUID,
  budget_name TEXT,
  budget_amount DECIMAL(12, 2),
  period TEXT,
  category_id UUID,
  category_name TEXT,
  start_date DATE,
  end_date DATE,
  alert_threshold INTEGER,
  total_spent DECIMAL(12, 2),
  percentage_used DECIMAL(5, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.amount,
    b.period,
    b.category_id,
    ec.name,
    b.start_date,
    b.end_date,
    b.alert_threshold,
    get_budget_spending(b.id, b.start_date, b.end_date, b.category_id) as spent,
    CASE 
      WHEN b.amount > 0 THEN 
        (get_budget_spending(b.id, b.start_date, b.end_date, b.category_id) / b.amount * 100)
      ELSE 0
    END as pct_used
  FROM budgets b
  LEFT JOIN expense_categories ec ON b.category_id = ec.id
  WHERE b.user_id = p_user_id
    AND b.is_active = true
    AND CURRENT_DATE BETWEEN b.start_date AND b.end_date
  ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
