CREATE TABLE IF NOT EXISTS chat_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(chat_id, user_id)
);
