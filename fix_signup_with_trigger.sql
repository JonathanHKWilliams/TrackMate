-- Fix signup flow by creating profiles automatically via trigger
-- This runs with elevated privileges, bypassing RLS during signup
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. CREATE FUNCTION TO HANDLE NEW USER SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user_profile
  INSERT INTO public.user_profiles (user_id, full_name, avatar_url)
  VALUES (NEW.id, NULL, NULL);
  
  -- Create user_settings with defaults
  INSERT INTO public.user_settings (user_id, currency, language, theme, notifications_enabled)
  VALUES (NEW.id, 'LRD', 'en', 'dark', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. CREATE TRIGGER ON AUTH.USERS
-- ============================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires when new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. UPDATE RLS POLICIES (Keep existing but add service role bypass)
-- ============================================

-- For user_profiles - allow authenticated users to update their profile
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- For user_settings
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. VERIFY SETUP
-- ============================================

-- Check if trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check if function exists
SELECT 
  routine_name, 
  routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
