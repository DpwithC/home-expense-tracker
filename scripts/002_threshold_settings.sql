-- Create threshold_settings table (single-row household config)
CREATE TABLE IF NOT EXISTS threshold_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  global_limit NUMERIC,
  category_limits JSONB DEFAULT '{}',
  email_recipient TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
