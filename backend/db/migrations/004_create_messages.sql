CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  sender_type TEXT NOT NULL DEFAULT '"'"'user'"'"' CHECK (sender_type IN ('"'"'user'"'"', '"'"'ai'"'"')),
  content TEXT,
  message_type TEXT NOT NULL DEFAULT '"'"'text'"'"' CHECK (message_type IN ('"'"'text'"'"', '"'"'image'"'"', '"'"'video'"'"', '"'"'audio'"'"', '"'"'file'"'"', '"'"'sticker'"'"')),
  sticker_id UUID,
  edited BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  forwarded_from UUID REFERENCES messages(id),
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('"'"'english'"'"', coalesce(content, '"'"''"'"'))) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_search_idx ON messages USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS messages_chat_id_idx ON messages (chat_id);
