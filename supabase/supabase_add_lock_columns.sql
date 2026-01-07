-- Add lock-related columns to existing notes table
-- Run this in Supabase SQL Editor

-- Add is_locked column
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;

-- Add lock_password_hash column
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS lock_password_hash TEXT;

-- Add security_question column
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS security_question TEXT;

-- Add security_answer_hash column
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS security_answer_hash TEXT;

-- Create index for is_locked for better query performance
CREATE INDEX IF NOT EXISTS notes_is_locked_idx ON notes(is_locked);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notes'
ORDER BY ordinal_position;
