-- Fix Function Search Path Mutable Security Warnings
-- This script adds SECURITY INVOKER and sets search_path for all functions
-- to prevent search_path manipulation attacks

-- 1. Fix update_updated_at_column function
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

-- 2. Fix handle_new_user function
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

-- 3. Fix calculate_project_progress function
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

-- 4. Fix update_project_progress function
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

-- 5. Fix create_default_expense_categories function
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
