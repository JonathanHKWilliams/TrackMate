-- Budget List Schema
-- For planning purchases and creating shopping lists with budget tracking

-- Create budget_lists table
CREATE TABLE IF NOT EXISTS budget_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  total_budget DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'LRD',
  purpose TEXT, -- e.g., "School Supplies", "Shopping", "Trip"
  recipient TEXT, -- Who the list is for (e.g., "Mom", "Sponsor")
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create budget_items table
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_list_id UUID NOT NULL REFERENCES budget_lists(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  estimated_price DECIMAL(12, 2) NOT NULL,
  actual_price DECIMAL(12, 2),
  category TEXT, -- e.g., "Clothing", "Books", "Food"
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_purchased BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_budget_lists_user_id ON budget_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_lists_status ON budget_lists(status);
CREATE INDEX IF NOT EXISTS idx_budget_items_list_id ON budget_items(budget_list_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_category ON budget_items(category);

-- Enable Row Level Security
ALTER TABLE budget_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_lists
CREATE POLICY "Users can view their own budget lists"
  ON budget_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget lists"
  ON budget_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget lists"
  ON budget_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget lists"
  ON budget_lists FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for budget_items
CREATE POLICY "Users can view items in their budget lists"
  ON budget_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM budget_lists
      WHERE budget_lists.id = budget_items.budget_list_id
      AND budget_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create items in their budget lists"
  ON budget_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM budget_lists
      WHERE budget_lists.id = budget_items.budget_list_id
      AND budget_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their budget lists"
  ON budget_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM budget_lists
      WHERE budget_lists.id = budget_items.budget_list_id
      AND budget_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items in their budget lists"
  ON budget_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM budget_lists
      WHERE budget_lists.id = budget_items.budget_list_id
      AND budget_lists.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_budget_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_budget_lists_updated_at
  BEFORE UPDATE ON budget_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_list_updated_at();

CREATE TRIGGER update_budget_items_updated_at
  BEFORE UPDATE ON budget_items
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_list_updated_at();

-- Function to get budget list with items and totals
CREATE OR REPLACE FUNCTION get_budget_list_with_items(p_list_id UUID)
RETURNS TABLE (
  list_id UUID,
  list_title TEXT,
  list_description TEXT,
  total_budget DECIMAL(12, 2),
  currency TEXT,
  purpose TEXT,
  recipient TEXT,
  status TEXT,
  total_estimated DECIMAL(12, 2),
  total_actual DECIMAL(12, 2),
  remaining_budget DECIMAL(12, 2),
  item_count BIGINT,
  purchased_count BIGINT,
  items JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bl.id,
    bl.title,
    bl.description,
    bl.total_budget,
    bl.currency,
    bl.purpose,
    bl.recipient,
    bl.status,
    COALESCE(SUM(bi.estimated_price * bi.quantity), 0) as total_estimated,
    COALESCE(SUM(CASE WHEN bi.actual_price IS NOT NULL THEN bi.actual_price * bi.quantity ELSE 0 END), 0) as total_actual,
    bl.total_budget - COALESCE(SUM(bi.estimated_price * bi.quantity), 0) as remaining_budget,
    COUNT(bi.id) as item_count,
    COUNT(CASE WHEN bi.is_purchased THEN 1 END) as purchased_count,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', bi.id,
          'item_name', bi.item_name,
          'description', bi.description,
          'quantity', bi.quantity,
          'estimated_price', bi.estimated_price,
          'actual_price', bi.actual_price,
          'category', bi.category,
          'priority', bi.priority,
          'is_purchased', bi.is_purchased,
          'notes', bi.notes,
          'total_estimated', bi.estimated_price * bi.quantity,
          'total_actual', CASE WHEN bi.actual_price IS NOT NULL THEN bi.actual_price * bi.quantity ELSE NULL END
        ) ORDER BY bi.created_at
      ) FILTER (WHERE bi.id IS NOT NULL),
      '[]'::jsonb
    ) as items
  FROM budget_lists bl
  LEFT JOIN budget_items bi ON bl.id = bi.budget_list_id
  WHERE bl.id = p_list_id
  GROUP BY bl.id, bl.title, bl.description, bl.total_budget, bl.currency, bl.purpose, bl.recipient, bl.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Function to get all budget lists for a user with summary
CREATE OR REPLACE FUNCTION get_user_budget_lists(p_user_id UUID)
RETURNS TABLE (
  list_id UUID,
  list_title TEXT,
  list_description TEXT,
  total_budget DECIMAL(12, 2),
  currency TEXT,
  purpose TEXT,
  recipient TEXT,
  status TEXT,
  total_estimated DECIMAL(12, 2),
  remaining_budget DECIMAL(12, 2),
  item_count BIGINT,
  purchased_count BIGINT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bl.id,
    bl.title,
    bl.description,
    bl.total_budget,
    bl.currency,
    bl.purpose,
    bl.recipient,
    bl.status,
    COALESCE(SUM(bi.estimated_price * bi.quantity), 0) as total_estimated,
    bl.total_budget - COALESCE(SUM(bi.estimated_price * bi.quantity), 0) as remaining_budget,
    COUNT(bi.id) as item_count,
    COUNT(CASE WHEN bi.is_purchased THEN 1 END) as purchased_count,
    bl.created_at,
    bl.updated_at
  FROM budget_lists bl
  LEFT JOIN budget_items bi ON bl.id = bi.budget_list_id
  WHERE bl.user_id = p_user_id
  GROUP BY bl.id, bl.title, bl.description, bl.total_budget, bl.currency, bl.purpose, bl.recipient, bl.status, bl.created_at, bl.updated_at
  ORDER BY bl.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
