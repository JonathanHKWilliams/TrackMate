-- ============================================
-- FIX RLS PERFORMANCE ISSUES
-- ============================================
-- This script optimizes all RLS policies by wrapping auth.uid() calls
-- with (select auth.uid()) to prevent re-evaluation for each row.
-- Run this in your Supabase SQL Editor.
--
-- Based on Supabase linter recommendations:
-- https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
-- ============================================

-- ============================================
-- 1. USER_PROFILES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- 2. USER_SETTINGS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;
CREATE POLICY "Users can delete own settings"
  ON user_settings FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- 3. PROFILES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- 4. PROJECTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- 5. TASKS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view monitored tasks" ON tasks;
CREATE POLICY "Users can view monitored tasks"
  ON tasks FOR SELECT
  USING ((select auth.uid()) = ANY(monitor_uids));

DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- 6. NOTES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own notes" ON notes;
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notes" ON notes;
CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- 7. EXPENSE_CATEGORIES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own categories" ON expense_categories;
CREATE POLICY "Users can view own categories"
  ON expense_categories FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own categories" ON expense_categories;
CREATE POLICY "Users can insert own categories"
  ON expense_categories FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own categories" ON expense_categories;
CREATE POLICY "Users can update own categories"
  ON expense_categories FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own categories" ON expense_categories;
CREATE POLICY "Users can delete own categories"
  ON expense_categories FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- 8. EXPENSE_TAGS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own tags" ON expense_tags;
CREATE POLICY "Users can view own tags"
  ON expense_tags FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own tags" ON expense_tags;
CREATE POLICY "Users can insert own tags"
  ON expense_tags FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own tags" ON expense_tags;
CREATE POLICY "Users can update own tags"
  ON expense_tags FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own tags" ON expense_tags;
CREATE POLICY "Users can delete own tags"
  ON expense_tags FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- 9. EXPENSES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;
CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- 10. EXPENSE_TAG_RELATIONS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own expense tag relations" ON expense_tag_relations;
CREATE POLICY "Users can view own expense tag relations"
  ON expense_tag_relations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM expenses
      WHERE expenses.id = expense_tag_relations.expense_id
      AND expenses.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own expense tag relations" ON expense_tag_relations;
CREATE POLICY "Users can insert own expense tag relations"
  ON expense_tag_relations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM expenses
      WHERE expenses.id = expense_tag_relations.expense_id
      AND expenses.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own expense tag relations" ON expense_tag_relations;
CREATE POLICY "Users can delete own expense tag relations"
  ON expense_tag_relations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM expenses
      WHERE expenses.id = expense_tag_relations.expense_id
      AND expenses.user_id = (select auth.uid())
    )
  );

-- ============================================
-- 11. ESTIMATES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own estimates" ON estimates;
CREATE POLICY "Users can view own estimates"
  ON estimates FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own estimates" ON estimates;
CREATE POLICY "Users can insert own estimates"
  ON estimates FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own estimates" ON estimates;
CREATE POLICY "Users can update own estimates"
  ON estimates FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own estimates" ON estimates;
CREATE POLICY "Users can delete own estimates"
  ON estimates FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- 12. ESTIMATE_MATERIALS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own materials" ON estimate_materials;
CREATE POLICY "Users can view own materials"
  ON estimate_materials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM estimates 
      WHERE estimates.id = estimate_materials.estimate_id 
      AND estimates.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own materials" ON estimate_materials;
CREATE POLICY "Users can insert own materials"
  ON estimate_materials FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM estimates 
      WHERE estimates.id = estimate_materials.estimate_id 
      AND estimates.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own materials" ON estimate_materials;
CREATE POLICY "Users can update own materials"
  ON estimate_materials FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM estimates 
      WHERE estimates.id = estimate_materials.estimate_id 
      AND estimates.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own materials" ON estimate_materials;
CREATE POLICY "Users can delete own materials"
  ON estimate_materials FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM estimates 
      WHERE estimates.id = estimate_materials.estimate_id 
      AND estimates.user_id = (select auth.uid())
    )
  );

-- ============================================
-- 13. ESTIMATE_LABOR TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own labor" ON estimate_labor;
CREATE POLICY "Users can view own labor"
  ON estimate_labor FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM estimates 
      WHERE estimates.id = estimate_labor.estimate_id 
      AND estimates.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own labor" ON estimate_labor;
CREATE POLICY "Users can insert own labor"
  ON estimate_labor FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM estimates 
      WHERE estimates.id = estimate_labor.estimate_id 
      AND estimates.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own labor" ON estimate_labor;
CREATE POLICY "Users can update own labor"
  ON estimate_labor FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM estimates 
      WHERE estimates.id = estimate_labor.estimate_id 
      AND estimates.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own labor" ON estimate_labor;
CREATE POLICY "Users can delete own labor"
  ON estimate_labor FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM estimates 
      WHERE estimates.id = estimate_labor.estimate_id 
      AND estimates.user_id = (select auth.uid())
    )
  );

-- ============================================
-- 14. ESTIMATE_ADDITIONAL_CHARGES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own charges" ON estimate_additional_charges;
CREATE POLICY "Users can view own charges"
  ON estimate_additional_charges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM estimates 
      WHERE estimates.id = estimate_additional_charges.estimate_id 
      AND estimates.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own charges" ON estimate_additional_charges;
CREATE POLICY "Users can insert own charges"
  ON estimate_additional_charges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM estimates 
      WHERE estimates.id = estimate_additional_charges.estimate_id 
      AND estimates.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own charges" ON estimate_additional_charges;
CREATE POLICY "Users can update own charges"
  ON estimate_additional_charges FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM estimates 
      WHERE estimates.id = estimate_additional_charges.estimate_id 
      AND estimates.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own charges" ON estimate_additional_charges;
CREATE POLICY "Users can delete own charges"
  ON estimate_additional_charges FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM estimates 
      WHERE estimates.id = estimate_additional_charges.estimate_id 
      AND estimates.user_id = (select auth.uid())
    )
  );

-- ============================================
-- 15. BUDGETS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own budgets" ON budgets;
CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own budgets" ON budgets;
CREATE POLICY "Users can insert own budgets"
  ON budgets FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own budgets" ON budgets;
CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- 16. BUDGET_ALERTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own budget alerts" ON budget_alerts;
CREATE POLICY "Users can view own budget alerts"
  ON budget_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_alerts.budget_id
      AND budgets.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own budget alerts" ON budget_alerts;
CREATE POLICY "Users can insert own budget alerts"
  ON budget_alerts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_alerts.budget_id
      AND budgets.user_id = (select auth.uid())
    )
  );

-- ============================================
-- 17. BUDGET_LISTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view their own budget lists" ON budget_lists;
CREATE POLICY "Users can view their own budget lists"
  ON budget_lists FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own budget lists" ON budget_lists;
CREATE POLICY "Users can create their own budget lists"
  ON budget_lists FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own budget lists" ON budget_lists;
CREATE POLICY "Users can update their own budget lists"
  ON budget_lists FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own budget lists" ON budget_lists;
CREATE POLICY "Users can delete their own budget lists"
  ON budget_lists FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- 18. BUDGET_ITEMS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view items in their budget lists" ON budget_items;
CREATE POLICY "Users can view items in their budget lists"
  ON budget_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM budget_lists
      WHERE budget_lists.id = budget_items.budget_list_id
      AND budget_lists.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create items in their budget lists" ON budget_items;
CREATE POLICY "Users can create items in their budget lists"
  ON budget_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM budget_lists
      WHERE budget_lists.id = budget_items.budget_list_id
      AND budget_lists.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update items in their budget lists" ON budget_items;
CREATE POLICY "Users can update items in their budget lists"
  ON budget_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM budget_lists
      WHERE budget_lists.id = budget_items.budget_list_id
      AND budget_lists.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete items in their budget lists" ON budget_items;
CREATE POLICY "Users can delete items in their budget lists"
  ON budget_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM budget_lists
      WHERE budget_lists.id = budget_items.budget_list_id
      AND budget_lists.user_id = (select auth.uid())
    )
  );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all policies have been updated
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'user_profiles', 'user_settings', 'profiles', 'projects', 'tasks', 'notes',
    'expense_categories', 'expense_tags', 'expenses', 'expense_tag_relations',
    'estimates', 'estimate_materials', 'estimate_labor', 'estimate_additional_charges',
    'budgets', 'budget_alerts', 'budget_lists', 'budget_items'
  )
ORDER BY tablename, policyname;
