CREATE TABLE IF NOT EXISTS work_items (
  id SERIAL PRIMARY KEY,
  component_id TEXT,
  status TEXT DEFAULT 'OPEN',
  severity TEXT DEFAULT 'P2',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  rca JSONB
);

CREATE TABLE IF NOT EXISTS work_item_logs (
  id SERIAL PRIMARY KEY,
  work_item_id INTEGER NOT NULL REFERENCES work_items(id),
  status TEXT,
  rca JSONB,
  changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);
