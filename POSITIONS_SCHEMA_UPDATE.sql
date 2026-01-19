-- Update companies table to include positions JSONB column
ALTER TABLE companies ADD COLUMN IF NOT EXISTS positions JSONB DEFAULT '[]'::jsonb;

-- Comment for clarity
COMMENT ON COLUMN companies.positions IS 'Array of Position objects {id, title, status}';