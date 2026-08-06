CREATE TABLE IF NOT EXISTS room_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL,
  chat_name TEXT NOT NULL,
  members_present TEXT[] NOT NULL,
  summary_text TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  trigger TEXT NOT NULL CHECK (trigger IN ('"'"'manual'"'"', '"'"'expiry'"'"'))
);
