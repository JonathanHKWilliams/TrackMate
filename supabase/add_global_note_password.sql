-- Add global note password fields to user_profiles table
-- This allows one password for all locked notes instead of per-note passwords

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS note_lock_password TEXT,
ADD COLUMN IF NOT EXISTS note_lock_security_question TEXT,
ADD COLUMN IF NOT EXISTS note_lock_security_answer TEXT;

-- Remove individual note password fields (if they exist)
-- Notes will now just have is_locked flag, password is stored in user_profiles
ALTER TABLE notes 
DROP COLUMN IF EXISTS password,
DROP COLUMN IF EXISTS security_question,
DROP COLUMN IF EXISTS security_answer;

-- Add comment for clarity
COMMENT ON COLUMN user_profiles.note_lock_password IS 'Hashed password for all locked notes';
COMMENT ON COLUMN user_profiles.note_lock_security_question IS 'Security question for password recovery';
COMMENT ON COLUMN user_profiles.note_lock_security_answer IS 'Hashed security answer for password recovery';
