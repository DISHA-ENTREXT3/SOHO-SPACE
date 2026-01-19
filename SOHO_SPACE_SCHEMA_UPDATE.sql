-- Soho Space Supabase Schema Update
-- Run this in your Supabase SQL Editor to fix missing columns and sync with the app.

-- 1. Update Companies Table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_ai_access BOOLEAN DEFAULT FALSE;

-- 2. Update Partners Table
ALTER TABLE partners
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_ai_access BOOLEAN DEFAULT FALSE;

-- 3. Update Users Table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_ai_access BOOLEAN DEFAULT FALSE;

-- 4. Ensure RLS is correctly configured for these columns
-- (Usually automatic if table-level RLS is on, but good to check)

-- 5. Fix any existing data (Optional)
UPDATE users
SET
    is_premium = TRUE,
    has_ai_access = TRUE
WHERE
    role = 'ADMIN';

UPDATE companies
SET
    is_premium = TRUE,
    has_ai_access = TRUE
WHERE
    subscription_plan IN ('PRO', 'ENTERPRISE');

UPDATE partners
SET
    is_premium = TRUE,
    has_ai_access = TRUE
WHERE
    subscription_plan IN ('PRO', 'ENTERPRISE');

-- 6. Storage Buckets (IMPORTANT)
-- Go to Storage in Supabase and create these 3 public buckets:
-- 1. 'avatars' (set to public)
-- 2. 'logos' (set to public)
-- 3. 'documents' (set to public)

-- 7. Verification
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'companies'
-- AND column_name IN ('subscription_expires_at', 'has_ai_access');