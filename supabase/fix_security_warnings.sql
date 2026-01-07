-- ============================================
-- FIX SECURITY WARNINGS
-- ============================================
-- This script fixes security warnings from Supabase linter:
-- 1. Function search_path mutable (SQL fix)
-- 2. Leaked password protection (Auth dashboard setting)
--
-- Run this in your Supabase SQL Editor.
-- ============================================

-- ============================================
-- 1. FIX FUNCTION SEARCH_PATH MUTABLE
-- ============================================
-- Setting search_path prevents search_path manipulation attacks
-- where malicious users could create functions in other schemas
-- to intercept function calls.

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Fix calculate_project_progress function
CREATE OR REPLACE FUNCTION calculate_project_progress(project_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
  progress_percentage INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_tasks
  FROM tasks
  WHERE project_id = project_uuid AND parent_task_id IS NULL;
  
  IF total_tasks = 0 THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*) INTO completed_tasks
  FROM tasks
  WHERE project_id = project_uuid 
    AND parent_task_id IS NULL 
    AND status = 'completed';
  
  progress_percentage := (completed_tasks * 100) / total_tasks;
  
  RETURN progress_percentage;
END;
$$;

-- Fix update_project_progress function
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE projects
    SET progress = calculate_project_progress(OLD.project_id)
    WHERE id = OLD.project_id;
    RETURN OLD;
  ELSE
    UPDATE projects
    SET progress = calculate_project_progress(NEW.project_id)
    WHERE id = NEW.project_id;
    RETURN NEW;
  END IF;
END;
$$;

-- Fix create_default_expense_categories function
CREATE OR REPLACE FUNCTION create_default_expense_categories(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
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
$$;

-- Fix get_budget_spending function
CREATE OR REPLACE FUNCTION get_budget_spending(
  p_budget_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_category_id UUID DEFAULT NULL
)
RETURNS DECIMAL(12, 2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- Fix get_active_budgets_with_spending function
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
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- Fix update_budget_list_updated_at function
CREATE OR REPLACE FUNCTION update_budget_list_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix get_budget_list_with_items function
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
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- Fix get_user_budget_lists function
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
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check all functions have search_path set
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  CASE 
    WHEN p.proconfig IS NULL THEN 'NO SEARCH_PATH SET'
    ELSE array_to_string(p.proconfig, ', ')
  END as config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'update_updated_at_column',
    'handle_new_user',
    'calculate_project_progress',
    'update_project_progress',
    'create_default_expense_categories',
    'get_budget_spending',
    'get_active_budgets_with_spending',
    'update_budget_list_updated_at',
    'get_budget_list_with_items',
    'get_user_budget_lists'
  )
ORDER BY p.proname;

-- ============================================
-- 2. LEAKED PASSWORD PROTECTION (MANUAL STEP)
-- ============================================
/*
IMPORTANT: This cannot be fixed via SQL. You must enable it in the Supabase Dashboard:

1. Go to your Supabase Dashboard
2. Navigate to: Authentication → Policies
3. Find "Password Strength and Leaked Password Protection"
4. Enable "Check for leaked passwords"

This will check user passwords against the HaveIBeenPwned database to prevent
the use of compromised passwords.

Documentation: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
*/
