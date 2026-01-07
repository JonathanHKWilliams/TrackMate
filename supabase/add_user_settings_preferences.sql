-- Add new preference columns to user_settings table
-- This migration adds finance, budget, and display preferences

-- Add finance preferences
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS default_currency TEXT DEFAULT 'LRD' CHECK (default_currency IN ('LRD', 'USD', 'EUR', 'GBP')),
ADD COLUMN IF NOT EXISTS show_expense_categories BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_generate_estimate_numbers BOOLEAN DEFAULT true;

-- Add budget preferences
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS budget_alerts_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS budget_alert_threshold INTEGER DEFAULT 80 CHECK (budget_alert_threshold >= 0 AND budget_alert_threshold <= 100);

-- Add display preferences
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS compact_view BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_icons BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS animations_enabled BOOLEAN DEFAULT true;

-- Update existing rows to have default values
UPDATE user_settings
SET 
  default_currency = COALESCE(default_currency, 'LRD'),
  show_expense_categories = COALESCE(show_expense_categories, true),
  auto_generate_estimate_numbers = COALESCE(auto_generate_estimate_numbers, true),
  budget_alerts_enabled = COALESCE(budget_alerts_enabled, true),
  budget_alert_threshold = COALESCE(budget_alert_threshold, 80),
  compact_view = COALESCE(compact_view, false),
  show_icons = COALESCE(show_icons, true),
  animations_enabled = COALESCE(animations_enabled, true)
WHERE 
  default_currency IS NULL 
  OR show_expense_categories IS NULL 
  OR auto_generate_estimate_numbers IS NULL
  OR budget_alerts_enabled IS NULL
  OR budget_alert_threshold IS NULL
  OR compact_view IS NULL
  OR show_icons IS NULL
  OR animations_enabled IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN user_settings.default_currency IS 'Default currency for expenses and estimates (LRD, USD, EUR, GBP)';
COMMENT ON COLUMN user_settings.show_expense_categories IS 'Display category icons in expense lists';
COMMENT ON COLUMN user_settings.auto_generate_estimate_numbers IS 'Automatically generate sequential estimate numbers';
COMMENT ON COLUMN user_settings.budget_alerts_enabled IS 'Enable notifications when approaching budget limits';
COMMENT ON COLUMN user_settings.budget_alert_threshold IS 'Percentage threshold for budget alerts (0-100)';
COMMENT ON COLUMN user_settings.compact_view IS 'Show more items with smaller spacing';
COMMENT ON COLUMN user_settings.show_icons IS 'Display icons throughout the app';
COMMENT ON COLUMN user_settings.animations_enabled IS 'Enable smooth transitions and animations';
