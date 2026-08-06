CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('"'"'chatroom'"'"', '"'"'private'"'"')),
  name TEXT,
  admin_id UUID REFERENCES users(id),
  auto_reset_enabled BOOLEAN DEFAULT FALSE,
  auto_reset_accepted_by UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT now(),
  last_reset_at TIMESTAMPTZ
);
