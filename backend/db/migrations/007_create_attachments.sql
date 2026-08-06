CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT
);
