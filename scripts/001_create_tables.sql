-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'expense',
  amount NUMERIC NOT NULL,
  person TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create recurring_bills table
CREATE TABLE IF NOT EXISTS recurring_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  due_day INTEGER NOT NULL DEFAULT 1,
  reminder_days_before INTEGER NOT NULL DEFAULT 3,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create data_sync_log table to track last sync and warn about purge
CREATE TABLE IF NOT EXISTS data_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  data_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days'),
  notification_sent BOOLEAN DEFAULT false
);
