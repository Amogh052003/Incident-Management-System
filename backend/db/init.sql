CREATE TABLE IF NOT EXISTS work_items (
  id SERIAL PRIMARY KEY,
  component_id TEXT,
  status TEXT DEFAULT 'OPEN',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  rca JSONB
);
